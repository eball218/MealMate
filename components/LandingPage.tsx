import React from 'react';
import { Icons } from '../constants';

interface Props {
  onStart: () => void;
}

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-stone-900 font-display">
      
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1556909212-d5b604d0c90d?q=80&w=2070&auto=format&fit=crop" 
          alt="Warm modern family kitchen scene" 
          className="w-full h-full object-cover"
        />
        {/* Cinematic Dark Overlay for Contrast */}
        <div className="absolute inset-0 bg-stone-900/50" /> 
        
        {/* Gradient for Text Readability at Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent mix-blend-multiply" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center max-w-4xl mx-auto">
        
        {/* Animated Logo Badge */}
        <div className="fade-in-up mb-8 transform hover:scale-105 transition-transform duration-500">
          <div className="bg-[#a3e635] rotate-3 rounded-2xl p-5 shadow-[0_0_40px_rgba(163,230,53,0.3)]">
            <div className="-rotate-3 text-stone-900">
               <Icons.Chef />
            </div>
          </div>
        </div>

        {/* Headlines */}
        <h1 className="fade-in-up text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-xl">
          MealMate AI
        </h1>
        
        <p className="fade-in-up-delay text-lg md:text-2xl text-stone-100 font-medium max-w-xl leading-relaxed mb-10 drop-shadow-md text-opacity-90">
          Your family's personal chef. We handle the planning, you enjoy the cooking.
        </p>

        {/* CTA Button */}
        <button 
          onClick={onStart}
          className="fade-in-up-delay group bg-[#a3e635] text-stone-900 text-lg font-bold py-4 px-10 rounded-full flex items-center gap-3 shadow-[0_4px_20px_rgba(163,230,53,0.4)] hover:shadow-[0_4px_30px_rgba(163,230,53,0.6)] hover:scale-105 transition-all duration-300"
        >
          Get Started
          <span className="transform group-hover:translate-x-1 transition-transform">
            <Icons.ArrowRight />
          </span>
        </button>

      </div>

      {/* Footer Tagline */}
      <div className="absolute bottom-8 left-0 right-0 z-10 text-center">
        <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-[0.2em] opacity-80">
          AI Powered
        </p>
      </div>
    </div>
  );
}