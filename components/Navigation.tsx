import React, { useState } from 'react';
import { ViewState, UserPreferences } from '../types';
import { Icons } from '../constants';

interface Props {
  currentView: ViewState;
  setView: (v: ViewState) => void;
  preferences: UserPreferences | null;
}

export default function Navigation({ currentView, setView, preferences }: Props) {
  // State for Desktop Sidebar Toggle
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: ViewState.DAILY, icon: Icons.Chef, label: 'Daily Plan' },
    { id: ViewState.PLAN, icon: Icons.Calendar, label: 'Weekly Overview' },
    { id: ViewState.ASSISTANT, icon: Icons.Chat, label: 'AI Assistant' },
    { id: ViewState.LIST, icon: Icons.Receipt, label: 'Shopping List' },
  ];

  const isProfileActive = currentView === ViewState.PROFILE;

  return (
    <nav className={`
      relative bg-white border-t border-stone-200 z-50
      /* Desktop Layout & Animations */
      md:border-t-0 md:border-r md:h-full 
      ${isCollapsed ? 'md:w-24 px-2' : 'md:w-72 md:p-4'}
      md:flex-col md:justify-start md:transition-all md:duration-300 md:ease-in-out
      /* Mobile Layout */
      flex flex-row justify-between items-center px-6 py-2
      shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:shadow-none
    `}>
      
      {/* Desktop Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute top-8 -right-3 w-6 h-6 bg-white border border-stone-200 rounded-full items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm z-50 transition-transform hover:scale-110"
        title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
      >
        <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
           <Icons.ChevronLeft />
        </div>
      </button>

      {/* Desktop Logo Area */}
      <div className={`hidden md:flex items-center mb-10 mt-6 transition-all duration-300 ${isCollapsed ? 'justify-center px-0 flex-col gap-2' : 'gap-3 px-2 flex-row'}`}>
         <div className={`bg-lime-400 p-2 rounded-xl -rotate-6 shadow-lg shadow-lime-200/50 transition-transform hover:rotate-0 flex-shrink-0 ${isCollapsed ? 'w-10 h-10 flex items-center justify-center' : 'w-auto'}`}>
            <div className={`rotate-6 text-stone-900 ${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'}`}>
              <Icons.Chef />
            </div>
         </div>
         {/* Hide text when collapsed */}
         <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 h-0 scale-0' : 'w-auto opacity-100 scale-100'}`}>
            <h1 className="font-display font-black text-xl text-stone-900 tracking-tight leading-none whitespace-nowrap">MealMate</h1>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">Family AI</span>
         </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-row md:flex-col justify-between w-full md:gap-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              title={item.label} // Tooltip for collapsed state/mobile
              className={`
                group flex items-center transition-all duration-200 ease-out
                /* Mobile Styles - Icons Only, Centered */
                flex-col justify-center items-center p-2 rounded-xl w-16
                /* Desktop Styles */
                md:flex-row md:rounded-2xl text-left
                ${isCollapsed 
                  ? 'md:w-12 md:h-12 md:justify-center md:px-0 md:mx-auto' // Collapsed: Square, Centered, No Padding
                  : 'md:w-full md:h-14 md:justify-start md:px-5 md:gap-4 md:mx-0' // Expanded: Full width, Left aligned, Padding
                }
                ${isActive 
                  ? 'text-stone-900 md:bg-lime-400 md:shadow-lg md:shadow-lime-300/40' 
                  : 'text-stone-400 hover:text-stone-600 md:hover:bg-stone-50 md:hover:text-stone-900'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-6 h-6 transition-all duration-300 flex-shrink-0
                ${isActive ? 'text-lime-500 md:text-stone-900 scale-110' : 'group-hover:scale-110'}
              `}>
                <item.icon />
              </div>

              {/* Label - Hidden on Mobile, Shown on Desktop if expanded */}
              <span className={`
                hidden 
                ${!isCollapsed ? 'md:block' : ''}
                text-sm font-bold transition-colors whitespace-nowrap overflow-hidden
                ${isActive ? 'text-stone-900' : ''}
              `}>
                {item.label}
              </span>
              
              {/* Desktop Active Indicator (Chevron) - Only show if expanded */}
               {isActive && !isCollapsed && (
                 <div className="hidden md:block ml-auto opacity-70">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                   </svg>
                 </div>
               )}
            </button>
          );
        })}
      </div>

      {/* Desktop Footer / User Profile Link */}
      <div className="hidden md:flex mt-auto w-full pt-6 border-t border-stone-100 overflow-hidden">
          <button 
             onClick={() => setView(ViewState.PROFILE)}
             title="My Profile"
             className={`flex items-center transition-all duration-300 rounded-xl
                ${isCollapsed 
                   ? 'justify-center w-12 h-12 mx-auto px-0' 
                   : 'justify-start w-full gap-3 px-2 py-2'
                }
                ${isProfileActive 
                   ? 'bg-stone-50 ring-1 ring-stone-200' 
                   : 'hover:bg-stone-50'
                }`}
          >
             <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-stone-400 transition-colors flex-shrink-0 ${
                isProfileActive ? 'bg-white border-lime-400 text-lime-600' : 'bg-stone-100 border-stone-200'
             }`}>
                <Icons.User />
             </div>
             
             {/* Text Content - Hide if collapsed */}
             <div className={`flex-1 min-w-0 text-left transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                <p className={`text-xs font-bold truncate ${isProfileActive ? 'text-stone-900' : 'text-stone-700'}`}>
                   {preferences?.name ? `Chef ${preferences.name}` : 'My Profile'}
                </p>
                <p className="text-[10px] text-stone-400 truncate">Family Plan</p>
             </div>
             
             {!isCollapsed && (
               <div className={`text-stone-300 ${isProfileActive ? 'text-lime-500' : 'hover:text-stone-600'}`}>
                  {isProfileActive ? (
                     <div className="w-2 h-2 rounded-full bg-lime-500"></div>
                  ) : (
                     <Icons.ArrowRight />
                  )}
               </div>
             )}
          </button>
      </div>

      {/* Mobile Profile Link (Added to main nav for mobile) */}
      <button
         className="md:hidden flex flex-col justify-center items-center p-2 rounded-xl w-16 text-stone-400 hover:text-stone-600"
         onClick={() => setView(ViewState.PROFILE)}
      >
         <div className={`w-6 h-6 transition-all duration-300 ${isProfileActive ? 'text-lime-500 scale-110' : ''}`}>
           <Icons.User />
         </div>
      </button>

    </nav>
  );
}