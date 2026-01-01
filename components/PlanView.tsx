import React, { useEffect, useState, useRef } from 'react';
import { UserPreferences, Meal, ShoppingItem, Ingredient } from '../types';
import { Icons } from '../constants';

interface Props {
  preferences: UserPreferences;
  mealPlan: Meal[];
  onRegenerate: () => void;
  loading: boolean;
  onAddToShoppingList: (item: ShoppingItem) => void;
  onToggleLike: (index: number, type: 'like' | 'dislike') => void;
}

export default function PlanView({ preferences, mealPlan, onRegenerate, loading, onAddToShoppingList, onToggleLike }: Props) {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [addedIngredients, setAddedIngredients] = useState<Set<string>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate next 7 days
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: d.getDate(),
      fullDate: d
    };
  });

  // Scroll to meal when selectedDateIndex changes
  useEffect(() => {
    if (itemRefs.current[selectedDateIndex]) {
      itemRefs.current[selectedDateIndex]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [selectedDateIndex]);

  const handleAddIngredient = (ingredient: string | Ingredient, mealTitle: string) => {
    let name = '';
    let searchTerm = '';
    let idBase = '';

    if (typeof ingredient === 'string') {
        name = ingredient;
        searchTerm = ingredient;
        idBase = ingredient;
    } else {
        name = `${ingredient.name} - ${ingredient.amount}`;
        searchTerm = ingredient.name;
        idBase = ingredient.name;
    }

    const id = `${mealTitle}-${idBase}`;
    onAddToShoppingList({
      id: Date.now().toString() + Math.random().toString(), // Ensure unique ID
      name: name,
      category: 'Meal Plan',
      checked: false,
      addedFrom: 'meal-plan',
      searchTerm: searchTerm
    });
    setAddedIngredients(prev => new Set(prev).add(id));
  };

  const getIngredientDisplay = (ing: string | Ingredient) => {
    if (typeof ing === 'string') return ing;
    return (
        <span className="flex justify-between w-full">
            <span>{ing.name}</span>
            <span className="text-stone-400 font-normal">{ing.amount}</span>
        </span>
    );
  };

  return (
    <div className="h-full bg-stone-50 flex flex-col font-sans">
      
      {/* Header Section */}
      <div className="p-6 bg-white pb-4 shadow-sm z-20 sticky top-0">
        <div className="mb-1">
            <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase">MealMate</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
            The {preferences.dietaryRestrictions[0] || 'Omnivore'} Plan
          </h1>
          <button 
            onClick={onRegenerate}
            disabled={loading}
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-stone-100 transition-colors ${loading ? 'animate-spin' : ''}`}
          >
            <Icons.Refresh />
          </button>
        </div>

        {/* Date Scroller */}
        <div className="flex justify-between items-center gap-2 overflow-x-auto scrollbar-hide">
          {weekDates.map((date, idx) => {
            const isSelected = idx === selectedDateIndex;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDateIndex(idx)}
                className={`flex flex-col items-center justify-center min-w-[3.8rem] h-16 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  isSelected 
                    ? 'bg-stone-900 text-white shadow-lg shadow-stone-300 scale-105' 
                    : 'bg-transparent text-stone-300 hover:text-stone-500'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase mb-0.5 ${isSelected ? 'text-stone-400' : 'text-stone-300'}`}>
                  {date.dayName}
                </span>
                <span className="text-xl font-bold">{date.dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <h2 className="text-lg font-bold text-stone-900 mb-4">Weekly Calendar</h2>
        
        <div className="space-y-6">
          {loading || mealPlan.length === 0 ? (
             // Loading Skeletons
             Array.from({length: 5}).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse flex items-center p-3 gap-4 border border-stone-100">
                   <div className="w-20 h-20 bg-stone-100 rounded-xl"></div>
                   <div className="flex-1 space-y-2">
                      <div className="h-4 bg-stone-100 rounded w-3/4"></div>
                      <div className="h-3 bg-stone-100 rounded w-1/2"></div>
                   </div>
                </div>
             ))
          ) : (
             mealPlan.map((meal, idx) => {
               const isExpanded = selectedDateIndex === idx;
               
               return (
                <div 
                   key={idx}
                   ref={el => itemRefs.current[idx] = el}
                   onClick={() => setSelectedDateIndex(idx)}
                   className={`group bg-white rounded-[24px] overflow-hidden transition-all duration-500 cursor-pointer border ${
                      isExpanded
                        ? 'border-lime-400 shadow-[0_20px_40px_-10px_rgba(163,230,53,0.2)] ring-1 ring-lime-400/50' 
                        : 'border-transparent shadow-sm hover:shadow-md hover:border-stone-100'
                   }`}
                >
                   {/* Header Row */}
                   <div className="p-3 pr-5 flex items-start gap-4">
                      {/* Image Thumbnail */}
                      <div className={`relative flex-shrink-0 transition-all duration-500 ${isExpanded ? 'w-full h-48 rounded-2xl order-last hidden' : 'w-20 h-20'}`}>
                          <img 
                            src={meal.imageUrl} 
                            alt={meal.title} 
                            className="w-full h-full object-cover rounded-xl"
                          />
                      </div>

                      {/* Text Content - Collapsed View */}
                      {!isExpanded && (
                        <div className="flex-1 py-1">
                            <h3 className="font-bold text-stone-800 leading-tight line-clamp-2 text-lg">
                              {meal.title}
                            </h3>
                            <p className="text-xs text-stone-400 mt-1 font-medium line-clamp-1">{meal.description}</p>
                        </div>
                      )}

                      {/* Expanded Header View */}
                      {isExpanded && (
                         <div className="w-full">
                            <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 relative">
                                <img src={meal.imageUrl} className="w-full h-full object-cover" alt={meal.title}/>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-stone-900 shadow-sm border border-white/20">
                                   Day {idx + 1}
                                </div>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-display font-black text-stone-900 leading-tight">
                                    {meal.title}
                                </h3>
                                <div className="flex gap-2">
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); onToggleLike(idx, 'like'); }}
                                     className={`p-2 rounded-full transition-colors ${meal.liked ? 'text-red-500 bg-red-50' : 'text-stone-300 hover:text-red-400 hover:bg-stone-50'}`}
                                   >
                                      <Icons.Heart />
                                   </button>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); onToggleLike(idx, 'dislike'); }}
                                      className={`p-2 rounded-full transition-colors ${meal.disliked ? 'text-stone-800 bg-stone-200' : 'text-stone-300 hover:text-stone-600 hover:bg-stone-50'}`}
                                   >
                                      <Icons.ThumbsDown />
                                   </button>
                                </div>
                            </div>
                            <p className="text-stone-500 font-medium leading-relaxed mb-6">
                                {meal.description}
                            </p>

                            {/* Details Grid */}
                            <div className="bg-stone-50 rounded-2xl p-5 mb-6 border border-stone-100">
                               <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200/60">
                                   <div className="flex items-center gap-2">
                                       <span className="text-yellow-500"><Icons.Star /></span>
                                       <span className="font-bold text-stone-800">{meal.rating} Rating</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <span className="text-lime-500"><Icons.Chef /></span>
                                       <span className="font-bold text-stone-800">{meal.difficulty}</span>
                                   </div>
                               </div>
                               <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Nutrition</h4>
                               <div className="grid grid-cols-4 gap-2 text-center">
                                  <div className="bg-white p-2 rounded-xl border border-stone-100">
                                     <div className="text-xs text-stone-400 font-bold mb-1">Cals</div>
                                     <div className="font-black text-stone-800">{meal.calories}</div>
                                  </div>
                                  <div className="bg-white p-2 rounded-xl border border-stone-100">
                                     <div className="text-xs text-stone-400 font-bold mb-1">Prot</div>
                                     <div className="font-black text-stone-800">{meal.protein}</div>
                                  </div>
                                  <div className="bg-white p-2 rounded-xl border border-stone-100">
                                     <div className="text-xs text-stone-400 font-bold mb-1">Carb</div>
                                     <div className="font-black text-stone-800">{meal.carbs}</div>
                                  </div>
                                  <div className="bg-white p-2 rounded-xl border border-stone-100">
                                     <div className="text-xs text-stone-400 font-bold mb-1">Fat</div>
                                     <div className="font-black text-stone-800">{meal.fat}</div>
                                  </div>
                               </div>
                            </div>

                            {/* Ingredients List */}
                            <div className="mb-6">
                                <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Full Ingredients List</h4>
                                <div className="space-y-2">
                                    {meal.ingredients?.map((ing, i) => {
                                        const ingName = typeof ing === 'string' ? ing : ing.name;
                                        const id = `${meal.title}-${ingName}`;
                                        const isAdded = addedIngredients.has(id);
                                        return (
                                            <div key={i} className="flex items-center justify-between bg-white border border-stone-200 p-3 rounded-xl shadow-sm">
                                                <div className="text-sm font-medium text-stone-700 w-full pr-2">
                                                    {getIngredientDisplay(ing)}
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAddIngredient(ing, meal.title); }}
                                                    disabled={isAdded}
                                                    className={`p-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                                        isAdded 
                                                        ? 'bg-lime-100 text-lime-700 cursor-default' 
                                                        : 'bg-stone-100 text-stone-500 hover:bg-lime-400 hover:text-stone-900'
                                                    }`}
                                                >
                                                    {isAdded ? 'Added' : '+ List'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                         </div>
                      )}

                      {/* Day Badge - Collapsed Only */}
                      {!isExpanded && (
                         <div className="flex flex-col items-end justify-center">
                            <span className="text-[10px] font-black text-lime-600 uppercase tracking-wide bg-lime-50 px-2 py-1 rounded-md whitespace-nowrap">
                                Day {idx + 1}
                            </span>
                         </div>
                      )}
                   </div>
                </div>
               );
             })
          )}
        </div>
        
        {/* Bottom padding for scrolling */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}