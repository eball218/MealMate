import React, { useState } from 'react';
import { UserPreferences, Meal } from '../types';
import { Icons } from '../constants';

interface Props {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  mealPlan: Meal[];
  onToggleLike: (index: number, type: 'like' | 'dislike') => void;
  onResetApp: () => void;
}

export default function ProfileView({ preferences, onUpdatePreferences, mealPlan, onToggleLike, onResetApp }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrefs, setTempPrefs] = useState<UserPreferences>(preferences);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetInput, setResetInput] = useState('');

  const handleSave = () => {
    onUpdatePreferences(tempPrefs);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempPrefs(preferences);
    setIsEditing(false);
  };

  const handleResetConfirm = () => {
    if (resetInput === 'DELETE') {
      onResetApp();
    }
  };

  const hasLikedMeals = mealPlan.some(m => m.liked);
  const hasDislikedMeals = mealPlan.some(m => m.disliked);

  return (
    <div className="h-full bg-stone-50 flex flex-col font-sans overflow-hidden relative">
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
                <div className="flex flex-col p-3 bg-stone-50 rounded-xl border border-stone-100 gap-2">
                   <span className="text-sm font-medium text-stone-600">Goals (Priority Order)</span>
                   {isEditing ? (
                      <div className="flex flex-col gap-2 mt-1">
                          {['Eat Healthier', 'Save Money', 'Save Time', 'Learn to Cook'].map(goal => {
                              const isSelected = tempPrefs.goals.includes(goal);
                              const index = tempPrefs.goals.indexOf(goal);
                              return (
                                  <button
                                      key={goal}
                                      onClick={() => {
                                          if (isSelected) {
                                              setTempPrefs(prev => ({...prev, goals: prev.goals.filter(g => g !== goal)}));
                                          } else {
                                              setTempPrefs(prev => ({...prev, goals: [...prev.goals, goal]}));
                                          }
                                      }}
                                      className={`p-2 rounded-lg text-xs font-bold border flex justify-between items-center ${
                                          isSelected 
                                              ? 'bg-lime-100 border-lime-300 text-stone-900' 
                                              : 'bg-white border-stone-200 text-stone-400'
                                      }`}
                                  >
                                      {goal}
                                      {isSelected && <span className="bg-lime-400 text-stone-900 px-1.5 rounded-full text-[10px]">{index + 1}</span>}
                                  </button>
                              )
                          })}
                      </div>
                   ) : (
                      <div className="flex flex-wrap gap-1">
                          {preferences.goals.map((goal, i) => (
                             <span key={i} className="bg-white border border-stone-200 px-2 py-1 rounded-md text-xs font-bold text-stone-800 flex items-center gap-1.5">
                                <span className="bg-stone-100 text-stone-500 w-4 h-4 rounded-full flex items-center justify-center text-[9px]">{i+1}</span>
                                {goal}
                             </span>
                          ))}
                      </div>
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

        </div>

        {/* Danger Zone */}
        <div className="max-w-7xl mx-auto w-full mt-10 border-t border-stone-200 pt-8">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Account Actions</h3>
            <button 
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-6 py-4 rounded-xl transition-colors border border-red-100 w-full md:w-auto justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.565-17.522a2.25 2.25 0 01-2.25 2.25H9.418a2.25 2.25 0 01-2.25-2.25l-.566-17.523a.75.75 0 01-.489-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                </svg>
                Reset & Delete Profile
            </button>
        </div>

        <div className="h-20"></div>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-[fadeInUp_0.2s_ease-out]">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-5 mx-auto border-4 border-red-50">
                <Icons.Alert />
            </div>
            <h3 className="text-2xl font-display font-black text-center text-stone-900 mb-2">Reset Account?</h3>
            <p className="text-center text-stone-500 text-sm mb-6 leading-relaxed">
                This will permanently delete your profile, all meal plans, and shopping lists. <br/><span className="font-bold text-red-500">This action cannot be undone.</span>
            </p>
            
            <div className="space-y-4">
                <div>
                <label className="text-xs font-bold text-stone-400 uppercase block mb-2 text-center">Type "DELETE" to confirm</label>
                <input 
                    type="text" 
                    value={resetInput}
                    onChange={(e) => setResetInput(e.target.value)}
                    className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-xl text-center font-black text-stone-900 focus:border-red-400 focus:ring-0 focus:outline-none uppercase tracking-widest text-lg"
                    placeholder="DELETE"
                />
                </div>
                
                <button 
                onClick={handleResetConfirm}
                disabled={resetInput !== 'DELETE'}
                className="w-full py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-200"
                >
                Yes, Reset Everything
                </button>
                <button 
                onClick={() => { setShowResetModal(false); setResetInput(''); }}
                className="w-full py-4 rounded-xl bg-white text-stone-500 font-bold border-2 border-stone-100 hover:bg-stone-50 transition-colors"
                >
                Cancel
                </button>
            </div>
            </div>
        </div>
      )}
    </div>
  );
}