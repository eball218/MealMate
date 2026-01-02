import React, { useState } from 'react';
import { UserPreferences, Meal, Ingredient } from '../types';
import { Icons } from '../constants';

interface Props {
  preferences: UserPreferences;
  mealPlan: Meal[];
  onStartCooking: () => void;
  onRegenerate: () => void;
  onSwapMeal: (index: number) => void;
  loading: boolean;
  onToggleLike: (index: number, type: 'like' | 'dislike') => void;
}

export default function DailyView({ preferences, mealPlan, onStartCooking, onRegenerate, onSwapMeal, loading, onToggleLike }: Props) {
  const [selectedDay, setSelectedDay] = useState(0); // 0 is today

  // Simple date logic
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      num: d.getDate(),
      isToday: i === 0
    };
  });

  const mealIndex = selectedDay % mealPlan.length;
  const meal = mealPlan[mealIndex];

  // Helper to format ingredient display
  const formatIngredient = (ing: string | Ingredient) => {
    if (typeof ing === 'string') return ing;
    return `${ing.amount} ${ing.name}`;
  };

  return (
    <div className="h-full bg-stone-50 overflow-y-auto font-sans scroll-smooth">
      <div className="max-w-7xl mx-auto w-full pb-24 md:pb-6">
        
        {/* Header */}
        <div className="p-6 pb-2 bg-stone-50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-black tracking-widest text-stone-400 uppercase">MealMate</span>
              <h1 className="text-3xl font-display font-extrabold text-stone-900 tracking-tight">
                The {preferences.dietaryRestrictions[0] || 'Omnivore'} Plan
              </h1>
            </div>
            <button 
              className={`p-2 bg-white border border-stone-200 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors ${loading ? 'animate-spin' : ''}`} 
              onClick={onRegenerate}
              disabled={loading}
            >
              <Icons.Refresh />
            </button>
          </div>

          {/* Date Scroller */}
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-2">
            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl transition-all ${
                  selectedDay === idx 
                    ? 'bg-stone-900 text-lime-400 shadow-lg shadow-stone-200 scale-105' 
                    : 'bg-white border border-stone-100 text-stone-400 hover:border-lime-300 hover:text-stone-600'
                }`}
              >
                <span className="text-[10px] font-bold">{day.name}</span>
                <span className={`text-lg font-bold ${selectedDay === idx ? 'text-lime-400' : 'text-stone-800'}`}>{day.num}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 pt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-stone-900">{selectedDay === 0 ? "Tonight's Dinner" : "Planned Dinner"}</h2>
            <button 
              onClick={() => onSwapMeal(mealIndex)}
              disabled={loading}
              className="text-sm font-bold text-lime-600 hover:text-lime-700 flex items-center gap-1 bg-lime-50 px-3 py-1 rounded-full disabled:opacity-50"
            >
              <Icons.Refresh /> Swap
            </button>
          </div>

          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Hero Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-4">
              <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] rounded-[32px] overflow-hidden shadow-2xl shadow-stone-200 bg-stone-200 group">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-lime-400 mb-4"></div>
                    <p className="text-sm font-bold text-stone-500 animate-pulse">Chefs are planning...</p>
                  </div>
                ) : meal ? (
                  <>
                    <img 
                      src={meal.imageUrl} 
                      alt={meal.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-stone-900 shadow-sm border border-white/20">
                        <Icons.Clock /> {meal.time || '30m'}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onToggleLike(mealIndex, 'dislike')}
                          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors border border-white/10 ${
                            meal.disliked ? 'bg-stone-800 text-white' : 'bg-stone-900/40 text-white hover:bg-stone-900/60'
                          }`}
                        >
                          <Icons.ThumbsDown />
                        </button>
                        <button 
                          onClick={() => onToggleLike(mealIndex, 'like')}
                          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors border border-white/10 ${
                              meal.liked ? 'bg-red-500 text-white shadow-red-500/30 shadow-lg' : 'bg-stone-900/40 text-lime-400 hover:bg-stone-900/60'
                          }`}
                        >
                          <Icons.Heart />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white">
                      <h3 className="text-3xl font-display font-black leading-tight mb-3 drop-shadow-md">
                        {meal.title}
                      </h3>
                      <p className="text-stone-200 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                        {meal.description}
                      </p>

                      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-4 text-white shadow-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400"><Icons.Star /></span>
                          <span className="font-bold text-sm">{meal.rating}</span>
                        </div>
                        <div className="w-px h-6 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400"><Icons.Fire /></span>
                          <span className="font-bold text-sm">{meal.calories} kcal</span>
                        </div>
                        <div className="w-px h-6 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                          <span className="text-lime-400"><Icons.Chef /></span>
                          <span className="font-bold text-sm">{meal.difficulty}</span>
                        </div>
                      </div>

                      <button 
                        onClick={onStartCooking}
                        className="w-full bg-[#a3e635] hover:bg-[#84cc16] text-stone-900 font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-[0_4px_20px_rgba(163,230,53,0.3)]"
                      >
                        Start Cooking
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-400">
                      <div className="text-center">
                          <Icons.List />
                          <p className="mt-2 text-sm">No plan generated yet.</p>
                      </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-7">
              {meal && !loading && (
                <div className="space-y-6 fade-in-up">
                  
                  {/* Ingredients Section */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                    <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                      <span className="text-lime-500"><Icons.List /></span> Ingredients
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {meal.ingredients?.map((ing, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="mt-1.5 w-2 h-2 rounded-full bg-lime-400 flex-shrink-0" />
                            <span className="text-stone-700 font-medium text-sm leading-relaxed">{formatIngredient(ing)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prep Section */}
                  {meal.prepSteps && meal.prepSteps.length > 0 && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                          <span className="text-orange-400"><Icons.Clock /></span> Prep
                        </h3>
                        <div className="space-y-4">
                            {meal.prepSteps.map((step, i) => (
                              <div key={i} className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center border border-orange-200">
                                  {i + 1}
                                </span>
                                <p className="text-stone-600 font-medium text-sm leading-relaxed border-b border-stone-50 pb-2 w-full">
                                  {step}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                  )}

                  {/* Cooking Section */}
                  {meal.cookingSteps && meal.cookingSteps.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                      <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <span className="text-red-500"><Icons.Fire /></span> Cooking Instructions
                      </h3>
                      <div className="space-y-6">
                          {meal.cookingSteps.map((step, i) => (
                            <div key={i} className="relative pl-6 border-l-2 border-stone-100 last:border-0 pb-1">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-stone-900 border-2 border-white ring-2 ring-stone-100"></div>
                              <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-1">Step {i + 1}</h4>
                              <p className="text-stone-800 font-medium leading-relaxed">
                                {step}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="h-10"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}