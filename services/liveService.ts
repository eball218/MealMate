import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Helper for PCM Blob creation
function createBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Decode helper
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decode Audio Data helper
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class LiveClient {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private sessionPromise: Promise<any> | null = null;
  private isActive = false;
  private onTranscriptionUpdate: (txt: string, isUser: boolean) => void;

  constructor(onTranscriptionUpdate: (txt: string, isUser: boolean) => void) {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.onTranscriptionUpdate = onTranscriptionUpdate;
  }

  async connect() {
    this.isActive = true;
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.nextStartTime = 0;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log("Live Session Open");
          if (!this.inputAudioContext) return;
          
          const source = this.inputAudioContext.createMediaStreamSource(stream);
          const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            if (!this.isActive) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            
            this.sessionPromise?.then(session => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(this.inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
           // Handle Transcriptions
           if (message.serverContent?.outputTranscription) {
              this.onTranscriptionUpdate(message.serverContent.outputTranscription.text, false);
           } else if (message.serverContent?.inputTranscription) {
              this.onTranscriptionUpdate(message.serverContent.inputTranscription.text, true);
           }

          // Handle Audio Output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && this.outputAudioContext) {
             this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
             
             const audioBuffer = await decodeAudioData(
               decode(base64Audio),
               this.outputAudioContext,
               24000,
               1
             );

             const source = this.outputAudioContext.createBufferSource();
             source.buffer = audioBuffer;
             source.connect(this.outputAudioContext.destination);
             source.addEventListener('ended', () => {
               this.sources.delete(source);
             });
             source.start(this.nextStartTime);
             this.nextStartTime += audioBuffer.duration;
             this.sources.add(source);
          }
        },
        onclose: () => {
          console.log("Live Session Closed");
        },
        onerror: (e) => {
          console.error("Live Session Error", e);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: "You are a helpful sous-chef. Keep answers short, encouraging, and helpful for someone currently cooking. If asked about ingredients, give quick substitutions.",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });
  }

  disconnect() {
    this.isActive = false;
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    // Cannot explicitly close session with current SDK, but breaking the audio stream effectively ends the loop
  }
}
