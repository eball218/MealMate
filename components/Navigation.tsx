import React from 'react';
import { ViewState } from '../types';
import { Icons } from '../constants';

interface Props {
  currentView: ViewState;
  setView: (v: ViewState) => void;
}

export default function Navigation({ currentView, setView }: Props) {
  const navItems = [
    { id: ViewState.DAILY, icon: Icons.Calendar, label: 'Daily' },
    { id: ViewState.PLAN, icon: Icons.Receipt, label: 'Plan' }, // Placeholder icon for Plan
    { id: ViewState.ASSISTANT, icon: Icons.Chat, label: 'Assistant' },
    { id: ViewState.LIST, icon: Icons.List, label: 'List' },
    { id: ViewState.SAVED, icon: Icons.Heart, label: 'Saved' },
  ];

  return (
    <div className="bg-white border-t border-stone-200 md:border-t-0 md:border-r md:flex-col md:w-24 md:h-full flex flex-row justify-between items-center px-6 py-2 md:py-8 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 md:w-full md:h-16 ${
            currentView === item.id
              ? 'text-[#84cc16] md:bg-stone-50'
              : 'text-stone-300 hover:text-stone-500'
          }`}
        >
          <div className="w-6 h-6 mb-1"><item.icon /></div>
          <span className={`text-[10px] font-bold ${currentView === item.id ? 'text-[#84cc16]' : 'text-stone-400'}`}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
