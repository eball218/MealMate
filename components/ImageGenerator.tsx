import React, { useState } from 'react';
import { generateMealImage } from '../services/geminiService';
import { Icons } from '../constants';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedImage(null);
    try {
      const b64 = await generateMealImage(prompt, resolution);
      setGeneratedImage(b64);
    } catch (e) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-sm border border-stone-100 flex flex-col p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2">
          <span className="text-lime-500"><Icons.Image /></span>
          Meal Visualizer
        </h2>
        <p className="text-stone-500 text-sm mt-1">Visualize your next dinner in high definition.</p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto w-full">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">What does your meal look like?</label>
          <textarea
            className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-lime-400 outline-none resize-none h-24 text-sm font-medium"
            placeholder="A rustic vegetable lasagna with melted mozzarella and fresh basil on a wooden table..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div>
           <label className="block text-sm font-bold text-stone-700 mb-2">Quality</label>
           <div className="flex gap-2">
             {(['1K', '2K', '4K'] as const).map(res => (
               <button
                key={res}
                onClick={() => setResolution(res)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  resolution === res 
                    ? 'bg-stone-900 text-lime-400 border-stone-900' 
                    : 'bg-white text-stone-500 border-stone-100 hover:border-lime-300'
                }`}
               >
                 {res}
               </button>
             ))}
           </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full py-4 bg-lime-400 text-stone-900 rounded-xl font-bold hover:bg-lime-500 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-lime-200"
        >
          {loading ? (
            <>Generating...</>
          ) : (
            <>
              <Icons.Sparkle /> Generate Image
            </>
          )}
        </button>
      </div>

      {/* Result Area */}
      <div className="mt-8 flex-1 flex flex-col items-center justify-center min-h-[300px] bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 relative overflow-hidden group">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
             <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-lime-500"></div>
          </div>
        )}
        
        {generatedImage ? (
          <img src={generatedImage} alt="Generated meal" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-stone-400 p-8">
            {!loading && (
              <>
                <div className="mx-auto w-12 h-12 mb-3 opacity-50"><Icons.Image /></div>
                <p>Your culinary creation will appear here.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}