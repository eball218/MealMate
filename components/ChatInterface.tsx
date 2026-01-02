import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserPreferences, Role } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { Icons } from '../constants';

interface Props {
  preferences: UserPreferences;
  onRegeneratePlan: () => void;
}

export default function ChatInterface({ preferences, onRegeneratePlan }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'model', 
      text: `Hi ${preferences.name}! I've noted that you're cooking for ${preferences.familySize} people and want to ${preferences.goals.join(' and ').toLowerCase()}. How can I help with your meal plan today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Convert history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const { text, groundingUrls, toolCalls } = await sendChatMessage(input, history, preferences);

      // Handle Tool Calls (e.g., regenerate plan)
      let aiResponseText = text;
      
      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls) {
            if (call.name === 'regenerate_plan') {
                onRegeneratePlan();
                if (!aiResponseText) {
                    aiResponseText = "I'm creating a fresh meal plan for you right now!";
                }
            }
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponseText || "I've processed your request.",
        groundingUrls: groundingUrls
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble reaching the kitchen server right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
        <div className="p-2 bg-lime-100 text-lime-600 rounded-full">
           <Icons.Sparkle />
        </div>
        <div>
          <h3 className="font-display font-bold text-stone-800">Meal Planner</h3>
          <p className="text-xs text-stone-500 font-medium">Powered by Gemini 3 Flash</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-stone-900 text-white rounded-tr-sm' 
                : 'bg-stone-50 text-stone-800 border border-stone-100 rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{msg.text}</div>
              
              {/* Search Grounding Sources */}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-200/50">
                  <p className="text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-lime-700 bg-lime-50 px-2 py-1 rounded-md border border-lime-200 hover:border-lime-400 truncate max-w-[200px] transition-colors"
                      >
                        {url.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-stone-50 text-stone-400 rounded-2xl p-4 rounded-tl-sm flex gap-1 border border-stone-100">
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="flex gap-2 bg-stone-50 p-1.5 rounded-full border border-stone-200 focus-within:ring-2 focus-within:ring-lime-400 focus-within:border-transparent transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for a meal plan, recipe, or substitution..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-stone-800 text-sm font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-lime-400 text-stone-900 rounded-full hover:bg-lime-500 disabled:opacity-50 disabled:hover:bg-lime-400 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.89 28.89 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}