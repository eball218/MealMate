import React, { useState, useEffect } from 'react';
import { ViewState, UserPreferences, Meal, ShoppingItem } from './types';
import Onboarding from './components/Onboarding';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import LiveCookingAssistant from './components/LiveCookingAssistant';
import ReceiptScanner from './components/ReceiptScanner';
import Navigation from './components/Navigation';
import DailyView from './components/DailyView';
import LandingPage from './components/LandingPage';
import PlanView from './components/PlanView';
import ProfileView from './components/ProfileView';
import { getWeeklyPlan } from './services/geminiService';

export default function App() {
  // Simple check for API Key
  if (!process.env.API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-800 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-2">Configuration Error</h1>
          <p>Please provide a valid API_KEY in the environment variables.</p>
        </div>
      </div>
    );
  }

  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Load state from storage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('nourish_prefs');
    const savedPlan = localStorage.getItem('nourish_plan');
    const savedList = localStorage.getItem('nourish_list');
    
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }

    if (savedPlan) {
      setMealPlan(JSON.parse(savedPlan));
    }

    if (savedList) {
      setShoppingList(JSON.parse(savedList));
    }
  }, []);

  // Save list whenever it changes
  useEffect(() => {
    localStorage.setItem('nourish_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const addToShoppingList = (item: ShoppingItem) => {
    setShoppingList(prev => [...prev, item]);
  };

  const updateShoppingList = (newList: ShoppingItem[]) => {
    setShoppingList(newList);
  };

  const generateAndSavePlan = async (prefs: UserPreferences) => {
    setIsGeneratingPlan(true);
    try {
      const meals = await getWeeklyPlan(prefs);
      
      // Map images (simple mapping for demo consistency)
      const enhancedMeals = meals.map((m, i) => ({
             ...m,
             imageUrl: `https://images.unsplash.com/photo-${[
                '1547592180-85f173990554', // Chicken
                '1504674900247-0877df9cc836', // Meat
                '1626800547487-56311a426f5f', // Stir fry
                '1604908176997-125f25cc6f3d', // Salad
                '1551183053-bf91a1d7b330', // Taco
                '1547496503-42b29eb14f75', // Soup
                '1512621776951-a57141f2eefd'  // Veggies
             ][i % 7]}?q=80&w=600&h=400&auto=format&fit=crop`
      }));

      setMealPlan(enhancedMeals);
      localStorage.setItem('nourish_plan', JSON.stringify(enhancedMeals));
    } catch (e) {
      console.error("Failed to generate plan", e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleOnboardingComplete = (prefs: UserPreferences) => {
    setPreferences(prefs);
    localStorage.setItem('nourish_prefs', JSON.stringify(prefs));
    generateAndSavePlan(prefs);
    setView(ViewState.DAILY);
  };

  const handleRegeneratePlan = () => {
    if (preferences) {
      generateAndSavePlan(preferences);
    }
  };

  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('nourish_prefs', JSON.stringify(newPrefs));
    // Optional: could trigger regenerate here if major changes
  };

  const toggleMealLike = (index: number, type: 'like' | 'dislike') => {
    const newPlan = [...mealPlan];
    if (type === 'like') {
        newPlan[index].liked = !newPlan[index].liked;
        newPlan[index].disliked = false;
    } else {
        newPlan[index].disliked = !newPlan[index].disliked;
        newPlan[index].liked = false;
    }
    setMealPlan(newPlan);
    localStorage.setItem('nourish_plan', JSON.stringify(newPlan));
  };

  if (view === ViewState.LANDING) {
    return <LandingPage onStart={() => {
        if (preferences) {
            setView(ViewState.DAILY);
        } else {
            setView(ViewState.ONBOARDING);
        }
    }} />;
  }

  if (view === ViewState.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen bg-stone-100 overflow-hidden font-sans">
      
      {/* Navigation */}
      {view !== ViewState.LIVE_COOKING && (
         <Navigation currentView={view} setView={setView} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative">
        <div className="h-full w-full max-w-md mx-auto md:max-w-5xl md:rounded-3xl overflow-hidden shadow-sm bg-stone-50">
          
          {/* Daily / Home View */}
          {view === ViewState.DAILY && preferences && (
            <DailyView 
              preferences={preferences} 
              mealPlan={mealPlan} 
              onStartCooking={() => setView(ViewState.LIVE_COOKING)}
              onRegenerate={handleRegeneratePlan}
              loading={isGeneratingPlan}
              onToggleLike={toggleMealLike}
            />
          )}

          {/* Plan View */}
          {view === ViewState.PLAN && preferences && (
            <PlanView 
              preferences={preferences} 
              mealPlan={mealPlan}
              onRegenerate={handleRegeneratePlan}
              loading={isGeneratingPlan}
              onAddToShoppingList={addToShoppingList}
              onToggleLike={toggleMealLike}
            />
          )}
          {view === ViewState.PLAN && !preferences && (
             <div className="h-full flex items-center justify-center text-stone-400">Please complete onboarding first.</div>
          )}

          {/* Assistant View (Chat) */}
          {view === ViewState.ASSISTANT && preferences && (
            <ChatInterface 
              preferences={preferences} 
              onRegeneratePlan={handleRegeneratePlan}
            />
          )}

          {/* List View (Receipts & Shopping List) */}
          {view === ViewState.LIST && (
            <ReceiptScanner 
              shoppingList={shoppingList}
              onUpdateList={updateShoppingList}
            />
          )}

          {/* Profile View (User Info & Likes) */}
          {view === ViewState.PROFILE && preferences && (
             <ProfileView 
               preferences={preferences}
               onUpdatePreferences={handleUpdatePreferences}
               mealPlan={mealPlan}
               onToggleLike={toggleMealLike}
               onOpenVisualizer={() => setView(ViewState.SAVED)}
             />
          )}

          {/* Saved View (Image Generator / Visualizer) - Hidden from main nav but accessible */}
          {view === ViewState.SAVED && (
             <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b border-stone-100 flex items-center gap-2">
                   <button onClick={() => setView(ViewState.PROFILE)} className="text-stone-500 hover:text-stone-900">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                   </button>
                   <span className="font-bold text-stone-900">Back to Profile</span>
                </div>
                <ImageGenerator />
             </div>
          )}

          {/* Live Cooking Mode (Overlay/Full screen) */}
          {view === ViewState.LIVE_COOKING && (
            <div className="relative h-full">
              <button 
                onClick={() => setView(ViewState.DAILY)}
                className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <LiveCookingAssistant />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}