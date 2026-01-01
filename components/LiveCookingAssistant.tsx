import React, { useState, useEffect, useRef } from 'react';
import { LiveClient } from '../services/liveService';
import { Icons } from '../constants';

export default function LiveCookingAssistant() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Ready to connect');
  const [transcriptions, setTranscriptions] = useState<Array<{text: string, isUser: boolean}>>([]);
  
  const clientRef = useRef<LiveClient | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new transcription
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const toggleConnection = async () => {
    if (isConnected) {
      clientRef.current?.disconnect();
      setIsConnected(false);
      setStatus('Disconnected');
    } else {
      setStatus('Connecting...');
      try {
        clientRef.current = new LiveClient((text, isUser) => {
           setTranscriptions(prev => {
             const last = prev[prev.length - 1];
             // Simple logic to append to last message if same speaker, otherwise new bubble
             if (last && last.isUser === isUser) {
               return [...prev.slice(0, -1), { text: last.text + text, isUser }];
             }
             return [...prev, { text, isUser }];
           });
        });
        await clientRef.current.connect();
        setIsConnected(true);
        setStatus('Live');
      } catch (e) {
        console.error(e);
        setStatus('Connection Failed');
        setIsConnected(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="h-full bg-stone-950 rounded-3xl shadow-2xl border border-stone-800 flex flex-col overflow-hidden relative">
      
      {/* Visualizer Background Effect (Simulated) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-lime-500 rounded-full blur-[120px] transition-all duration-1000 ${isConnected ? 'scale-125 opacity-100' : 'scale-50 opacity-0'}`}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm">
        <div>
          <h2 className="text-white font-display font-bold text-xl flex items-center gap-2">
            <span className={isConnected ? "text-lime-400 animate-pulse" : "text-stone-600"}>●</span>
            Cooking Assistant
          </h2>
          <p className="text-stone-400 text-xs mt-1 font-medium">{status}</p>
        </div>
        <button 
          onClick={toggleConnection}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isConnected 
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-900/20' 
              : 'bg-lime-400 text-stone-900 hover:bg-lime-500 shadow-lime-900/20 hover:scale-105'
          }`}
        >
          {isConnected ? (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
            </svg>
          ) : (
            <Icons.Microphone />
          )}
        </button>
      </div>

      {/* Transcription Area */}
      <div className="flex-1 relative z-10 p-6 overflow-y-auto space-y-6" ref={scrollRef}>
        {transcriptions.length === 0 && (
           <div className="h-full flex items-center justify-center text-stone-500 text-center">
             <p className="font-medium">Tap the microphone to start <br/> a hands-free cooking session.</p>
           </div>
        )}
        {transcriptions.map((t, i) => (
          <div key={i} className={`flex ${t.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-2xl text-lg font-medium leading-relaxed ${
              t.isUser 
                ? 'bg-stone-800 text-stone-100 rounded-tr-sm' 
                : 'bg-lime-900/30 text-lime-100 border border-lime-500/20 rounded-tl-sm backdrop-blur-sm'
            }`}>
              {t.text}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Hint */}
      <div className="relative z-10 p-4 bg-stone-900/80 backdrop-blur-md border-t border-stone-800 text-center">
        <p className="text-stone-600 text-xs font-bold uppercase tracking-wider">Powered by Gemini 2.5 Native Audio Live API</p>
      </div>
    </div>
  );
}