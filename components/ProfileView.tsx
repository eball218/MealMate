import React, { useState } from 'react';
import { UserPreferences, Meal } from '../types';
import { Icons } from '../constants';

interface Props {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  mealPlan: Meal[];
  onToggleLike: (index: number, type: 'like' | 'dislike') => void;
  onOpenVisualizer: () => void;
}

export default function ProfileView({ preferences, onUpdatePreferences, mealPlan, onToggleLike, onOpenVisualizer }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrefs, setTempPrefs] = useState<UserPreferences>(preferences);

  const handleSave = () => {
    onUpdatePreferences(tempPrefs);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempPrefs(preferences);
    setIsEditing(false);
  };

  const hasLikedMeals = mealPlan.some(m => m.liked);
  const hasDislikedMeals = mealPlan.some(m => m.disliked);

  return (
    <div className="h-full bg-stone-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2 flex-shrink-0 bg-stone-50">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center mb-6">
          <div>
             <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase">My Profile</span>
             <h1 className="text-2xl font-display font-black text-stone-900 tracking-tight">
               {isEditing ? 'Edit Profile' : `Chef ${preferences.name}`}
             </h1>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
               <button onClick={handleCancel} className="px-4 py-2 rounded-full text-xs font-bold text-stone-500 bg-white border border-stone-200 hover:bg-stone-100">
                 Cancel
               </button>
               <button onClick={handleSave} className="px-4 py-2 rounded-full text-xs font-bold text-stone-900 bg-lime-400 hover:bg-lime-500 shadow-sm flex items-center gap-1">
                 Save
               </button>
            </div>
          ) : (
             <button 
               onClick={() => setIsEditing(true)}
               className="p-3 bg-white rounded-full border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-lime-300 transition-colors shadow-sm"
             >
               <Icons.Edit />
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-0">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* User Stats/Details Card */}
          <div className={`bg-white rounded-[24px] p-6 shadow-sm border transition-colors ${isEditing ? 'border-lime-300 ring-1 ring-lime-100' : 'border-stone-100'}`}>
             <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
               <span className="text-lime-500"><Icons.User /></span> Household & Goals
             </h3>
             
             <div className="space-y-4">
                {/* Name Field */}
                {isEditing && (
                   <div>
                     <label className="text-xs font-bold text-stone-400 uppercase block mb-1">Name</label>
                     <input 
                        type="text" 
                        value={tempPrefs.name}
                        onChange={(e) => setTempPrefs({...tempPrefs, name: e.target.value})}
                        className="w-full p-2 bg-stone-50 rounded-lg border border-stone-200 font-bold text-stone-900 focus:outline-none focus:border-lime-400"
                     />
                   </div>
                )}

                {/* Family Size */}
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                   <span className="text-sm font-medium text-stone-600">Family Size</span>
                   {isEditing ? (
                      <div className="flex items-center gap-3">
                         <button onClick={() => setTempPrefs(p => ({...p, familySize: Math.max(1, p.familySize - 1)}))} className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-500 hover:text-stone-900 hover:border-stone-400">-</button>
                         <span className="font-bold text-stone-900 w-4 text-center">{tempPrefs.familySize}</span>
                         <button onClick={() => setTempPrefs(p => ({...p, familySize: p.familySize + 1}))} className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-500 hover:text-stone-900 hover:border-stone-400">+</button>
                      </div>
                   ) : (
                      <span className="font-black text-stone-900">{preferences.familySize} People</span>
                   )}
                </div>

                {/* Cooking Time */}
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                   <span className="text-sm font-medium text-stone-600">Cooking Time</span>
                   {isEditing ? (
                      <select 
                        value={tempPrefs.cookingTime}
                        onChange={(e) => setTempPrefs({...tempPrefs, cookingTime: e.target.value})}
                        className="bg-white border-stone-200 text-stone-900 text-sm font-bold rounded-lg p-1 outline-none"
                      >
                         <option value="Fast (15-30m)">Fast (15-30m)</option>
                         <option value="Medium (30-60m)">Medium (30-60m)</option>
                         <option value="Slow (>60m)">Slow (&gt;60m)</option>
                      </select>
                   ) : (
                      <span className="font-black text-stone-900 text-sm">{preferences.cookingTime}</span>
                   )}
                </div>

                {/* Goal */}
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                   <span className="text-sm font-medium text-stone-600">Primary Goal</span>
                   {isEditing ? (
                      <select 
                        value={tempPrefs.goals}
                        onChange={(e) => setTempPrefs({...tempPrefs, goals: e.target.value})}
                        className="bg-white border-stone-200 text-stone-900 text-sm font-bold rounded-lg p-1 outline-none max-w-[160px]"
                      >
                         <option>Eat Healthier</option>
                         <option>Save Money</option>
                         <option>Save Time</option>
                         <option>Learn to Cook</option>
                      </select>
                   ) : (
                      <span className="font-black text-stone-900 text-sm">{preferences.goals}</span>
                   )}
                </div>
             </div>
          </div>

          {/* Dietary & Allergies */}
          <div className={`bg-white rounded-[24px] p-6 shadow-sm border transition-colors ${isEditing ? 'border-lime-300 ring-1 ring-lime-100' : 'border-stone-100'}`}>
              <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <span className="text-lime-500"><Icons.List /></span> Dietary Profile
              </h3>
              
              <div className="space-y-4">
                  {/* Critical Allergies Section */}
                  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-red-900 transform rotate-12 scale-150">
                        <Icons.Alert />
                     </div>
                     <label className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-2">
                         <Icons.Alert /> Critical Allergies
                     </label>
                     {isEditing ? (
                        <input 
                           type="text" 
                           value={tempPrefs.allergies.join(', ')}
                           onChange={(e) => setTempPrefs({...tempPrefs, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                           placeholder="e.g. Peanuts, Shellfish (Comma separated)"
                           className="w-full p-3 bg-white rounded-xl border border-red-200 text-sm font-medium text-red-900 placeholder-red-300 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        />
                     ) : (
                        <div className="text-sm font-bold text-red-900 break-words">
                           {preferences.allergies.length > 0 && preferences.allergies[0] !== '' 
                              ? preferences.allergies.join(', ') 
                              : <span className="text-red-400 italic font-medium">No known allergies</span>}
                        </div>
                     )}
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                     <label className="text-xs font-bold text-stone-400 uppercase block mb-2">Dietary Restrictions</label>
                     <div className="flex flex-wrap gap-2">
                        {(isEditing ? ['Vegetarian', 'Vegan', 'Gluten Free', 'Keto', 'Dairy Free', 'Paleo', 'Halal'] : preferences.dietaryRestrictions).map(diet => {
                           const isActive = isEditing ? tempPrefs.dietaryRestrictions.includes(diet) : true;
                           if (!isActive && !isEditing) return null;
                           
                           return (
                             <button 
                               key={diet}
                               disabled={!isEditing}
                               onClick={() => {
                                  if (isActive) {
                                     setTempPrefs(p => ({...p, dietaryRestrictions: p.dietaryRestrictions.filter(d => d !== diet)}));
                                  } else {
                                     setTempPrefs(p => ({...p, dietaryRestrictions: [...p.dietaryRestrictions, diet]}));
                                  }
                               }}
                               className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                  isActive 
                                    ? 'bg-lime-100 text-lime-800 border-lime-200' 
                                    : 'bg-white text-stone-400 border-stone-200'
                               } ${!isEditing ? 'cursor-default' : ''}`}
                             >
                                {diet}
                             </button>
                           );
                        })}
                        {preferences.dietaryRestrictions.length === 0 && !isEditing && (
                            <span className="text-stone-400 text-sm italic">None selected</span>
                        )}
                     </div>
                  </div>

                  {/* Dislikes / Exclusions */}
                  <div>
                     <label className="text-xs font-bold text-stone-400 uppercase block mb-2">Dislikes & Exclusions</label>
                     {isEditing ? (
                        <div className="space-y-2">
                           <input 
                              type="text" 
                              value={(tempPrefs.dislikes || []).join(', ')}
                              onChange={(e) => setTempPrefs({...tempPrefs, dislikes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                              placeholder="e.g. Mushrooms, Olives, Cilantro"
                              className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-lime-400"
                           />
                           <p className="text-[10px] text-stone-400 font-medium ml-1">Separate ingredients with commas.</p>
                        </div>
                     ) : (
                        <div className="flex flex-wrap gap-2">
                           {(preferences.dislikes && preferences.dislikes.length > 0 && preferences.dislikes[0] !== '') ? (
                              preferences.dislikes.map((item, i) => (
                                 <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200 flex items-center gap-1">
                                    <span className="text-stone-300 text-[10px]"><Icons.ThumbsDown /></span> {item}
                                 </span>
                              ))
                           ) : (
                              <span className="text-stone-400 text-sm italic">No exclusions listed</span>
                           )}
                        </div>
                     )}
                  </div>
              </div>
          </div>

          {/* Favorite Meals */}
          <div>
             <h3 className="text-lg font-bold text-stone-900 mb-4 px-1">Favorite Meals</h3>
             {hasLikedMeals ? (
                <div className="grid grid-cols-1 gap-4">
                   {mealPlan.map((meal, idx) => {
                      if (!meal.liked) return null;
                      return (
                          <div key={idx} className="bg-white rounded-2xl p-3 flex gap-4 border border-stone-100 shadow-sm items-center">
                          <div className="w-20 h-20 rounded-xl bg-stone-200 flex-shrink-0 overflow-hidden">
                              <img src={meal.imageUrl} className="w-full h-full object-cover" alt={meal.title}/>
                          </div>
                          <div className="flex-1 py-1">
                              <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{meal.title}</h4>
                              <p className="text-xs text-stone-500 line-clamp-2 mt-1">{meal.description}</p>
                              <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase">
                                  <span className="bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">{meal.calories} kcal</span>
                                  <span className="bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">{meal.time}</span>
                              </div>
                          </div>
                          <button 
                              onClick={() => onToggleLike(idx, 'like')}
                              className="p-3 text-red-500 hover:text-stone-300 transition-colors"
                              title="Remove from favorites"
                          >
                              <Icons.Heart />
                          </button>
                          </div>
                      );
                   })}
                </div>
             ) : (
                <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center">
                   <div className="text-stone-300 mb-2 flex justify-center"><Icons.Heart /></div>
                   <p className="text-stone-500 text-sm font-medium">No favorites yet.</p>
                   <p className="text-xs text-stone-400 mt-1">Heart a meal in your plan to save it here.</p>
                </div>
             )}
          </div>

          {/* Disliked Meals */}
          <div>
             <h3 className="text-lg font-bold text-stone-900 mb-4 px-1">Disliked Meals</h3>
             {hasDislikedMeals ? (
                <div className="grid grid-cols-1 gap-4">
                   {mealPlan.map((meal, idx) => {
                      if (!meal.disliked) return null;
                      return (
                          <div key={idx} className="bg-white rounded-2xl p-3 flex gap-4 border border-stone-100 shadow-sm items-center opacity-70 hover:opacity-100 transition-opacity">
                              <div className="w-20 h-20 rounded-xl bg-stone-200 flex-shrink-0 overflow-hidden grayscale">
                                  <img src={meal.imageUrl} className="w-full h-full object-cover" alt={meal.title}/>
                              </div>
                              <div className="flex-1 py-1">
                                  <h4 className="font-bold text-stone-900 text-sm line-clamp-1 decoration-stone-400 line-through decoration-2">{meal.title}</h4>
                                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">Marked as disliked</p>
                              </div>
                              <button 
                                  onClick={() => onToggleLike(idx, 'dislike')}
                                  className="p-3 text-stone-800 hover:text-stone-500 transition-colors"
                                  title="Remove from dislikes"
                              >
                                  <Icons.ThumbsDown />
                              </button>
                          </div>
                      );
                   })}
                </div>
             ) : (
                <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center">
                   <div className="text-stone-300 mb-2 flex justify-center"><Icons.ThumbsDown /></div>
                   <p className="text-stone-500 text-sm font-medium">No flagged meals.</p>
                </div>
             )}
          </div>

          {/* Tools Section - Updated */}
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[24px] p-6 shadow-sm border border-stone-100 mt-4">
               <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                   <span className="text-purple-500"><Icons.Sparkle /></span> Creative Studio
               </h3>
               <p className="text-stone-500 text-sm mb-5 leading-relaxed">
                  Want to see what a recipe looks like before you cook? Use our AI Visualizer to generate photorealistic images of your meal ideas. Perfect for getting inspired!
               </p>
               <button 
                  onClick={onOpenVisualizer}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-stone-200"
               >
                  <Icons.Image />
                  Open Meal Visualizer
               </button>
          </div>
        </div>
        <div className="h-20"></div>
      </div>
    </div>
  );
}