import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { Icons } from '../constants';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
}

const steps = [
  { id: 1, title: 'Household', desc: "Who are we cooking for?" },
  { id: 2, title: 'Dietary', desc: "Any restrictions or allergies?" },
  { id: 3, title: 'Goals', desc: "What's important to you?" }
];

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(1); // Renamed to avoid confusion with children prop
  
  const [prefs, setPrefs] = useState<UserPreferences>({
    name: '',
    familySize: 3,
    dietaryRestrictions: [],
    allergies: [],
    cookingTime: 'Medium (30-60m)',
    goals: 'Eat Healthier'
  });

  // Update family size when counts change
  useEffect(() => {
    setPrefs(prev => ({...prev, familySize: adults + childrenCount}));
  }, [adults, childrenCount]);

  const next = () => setStep(s => Math.min(s + 1, 3));
  const back = () => setStep(s => Math.max(s - 1, 1));
  const finish = () => onComplete(prefs);

  const totalPeople = adults + childrenCount;
  const estimatedCost = totalPeople * 8; // Simple calculation for the tip

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-6 bg-stone-50 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-6 md:p-8 border border-stone-100 min-h-[600px] flex flex-col">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={back} 
            disabled={step === 1}
            className={`p-2 rounded-full transition-colors ${step === 1 ? 'opacity-0 cursor-default' : 'hover:bg-stone-100 text-stone-600'}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <span className="text-xs font-extrabold tracking-widest text-stone-400 uppercase">
            Step {step} of 3
          </span>

          <button onClick={() => setStep(3)} className="text-xs font-bold text-stone-400 hover:text-stone-600">
            Skip
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i <= step ? 'bg-lime-400' : 'bg-stone-100'}`} />
          ))}
        </div>

        {/* Step Title Content */}
        <div className="mb-8">
            <h2 className="text-3xl font-display font-black text-stone-900 mb-3">
              {step === 1 ? "Who's hungry?" : steps[step-1].title}
            </h2>
            <p className="text-stone-500 font-medium leading-relaxed">
              {step === 1 ? "This helps our AI calculate accurate portion sizes and generate a smart grocery budget." : steps[step-1].desc}
            </p>
        </div>

        {/* Dynamic Form Content */}
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
               {/* Adults Counter */}
               <div className="bg-white border-2 border-stone-100 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-900" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-lg text-stone-900">Adults</span>
                    </div>
                    <span className="text-stone-400 text-sm font-medium ml-7">Age 18+</span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-stone-100 rounded-full p-1.5 border border-stone-200">
                    <button 
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-sm hover:bg-stone-50 transition-colors"
                    >
                      <span className="text-xl font-bold mb-1">−</span>
                    </button>
                    <span className="w-6 text-center font-bold text-xl text-stone-900">{adults}</span>
                    <button 
                      onClick={() => setAdults(adults + 1)}
                      className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center text-stone-900 hover:bg-lime-500 transition-colors shadow-sm"
                    >
                      <span className="text-xl font-bold mb-1">+</span>
                    </button>
                  </div>
               </div>

               {/* Children Counter */}
               <div className="bg-white border-2 border-stone-100 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-900" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-lg text-stone-900">Children</span>
                    </div>
                    <span className="text-stone-400 text-sm font-medium ml-7">Under 18</span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-stone-100 rounded-full p-1.5 border border-stone-200">
                    <button 
                      onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-sm hover:bg-stone-50 transition-colors"
                    >
                      <span className="text-xl font-bold mb-1">−</span>
                    </button>
                    <span className="w-6 text-center font-bold text-xl text-stone-900">{childrenCount}</span>
                    <button 
                      onClick={() => setChildrenCount(childrenCount + 1)}
                      className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center text-stone-900 hover:bg-lime-500 transition-colors shadow-sm"
                    >
                      <span className="text-xl font-bold mb-1">+</span>
                    </button>
                  </div>
               </div>

               {/* AI Tip */}
               <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
                 <span className="text-lg">💡</span>
                 <p className="text-blue-900 text-sm font-semibold leading-relaxed">
                   <span className="font-bold text-blue-700">AI Tip:</span> Based on {totalPeople} people, I'll plan meals that average around ${estimatedCost} per dinner.
                 </p>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten Free', 'Keto', 'Paleo', 'Dairy Free', 'Halal'].map(diet => (
                    <button
                      key={diet}
                      onClick={() => {
                        const newDiets = prefs.dietaryRestrictions.includes(diet)
                          ? prefs.dietaryRestrictions.filter(d => d !== diet)
                          : [...prefs.dietaryRestrictions, diet];
                        setPrefs({...prefs, dietaryRestrictions: newDiets});
                      }}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 border ${
                        prefs.dietaryRestrictions.includes(diet) 
                          ? 'bg-lime-400 text-stone-900 border-lime-400 shadow-lg shadow-lime-200' 
                          : 'bg-white text-stone-600 border-stone-200 hover:border-lime-400'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
               <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Allergies (Optional)</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-xl border-2 border-stone-100 focus:border-lime-400 focus:ring-0 outline-none transition-colors bg-stone-50 font-medium"
                  value={prefs.allergies.join(', ')}
                  onChange={e => setPrefs({...prefs, allergies: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="e.g. Peanuts, Shellfish"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">What should we call you?</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-xl border-2 border-stone-100 focus:border-lime-400 focus:ring-0 outline-none transition-colors font-medium text-lg bg-stone-50"
                  value={prefs.name}
                  onChange={e => setPrefs({...prefs, name: e.target.value})}
                  placeholder="e.g. Chef Alex"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">Primary Goal</label>
                 <div className="grid grid-cols-1 gap-3">
                  {['Eat Healthier', 'Save Money', 'Save Time', 'Learn to Cook'].map(goal => (
                     <button
                      key={goal}
                      onClick={() => setPrefs({...prefs, goals: goal})}
                      className={`p-4 rounded-xl text-left border-2 transition-all group ${
                        prefs.goals === goal 
                          ? 'bg-lime-50 border-lime-400 shadow-sm' 
                          : 'bg-white border-stone-100 hover:border-lime-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`block font-bold text-lg ${prefs.goals === goal ? 'text-stone-900' : 'text-stone-600 group-hover:text-stone-900'}`}>
                            {goal}
                        </span>
                        {prefs.goals === goal && <div className="text-lime-500"><Icons.Sparkle /></div>}
                      </div>
                    </button>
                  ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="mt-8 pt-4">
            <button 
                onClick={step === 3 ? finish : next} 
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                    step === 3 
                    ? 'bg-lime-400 text-stone-900 hover:bg-lime-500 shadow-[0_10px_30px_rgba(163,230,53,0.3)]' 
                    : 'bg-lime-400 text-stone-900 hover:bg-lime-500'
                }`}
            >
                {step === 3 ? 'Start Planning' : 'Continue'}
                <Icons.ArrowRight />
            </button>
             {step < 3 && (
                <button onClick={finish} className="w-full mt-4 text-xs font-bold text-stone-400 hover:text-stone-600 uppercase tracking-widest">
                    I'll decide later
                </button>
            )}
        </div>

      </div>
    </div>
  );
}