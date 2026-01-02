import React, { useState, useEffect } from 'react';
import { ViewState, UserPreferences, Meal, ShoppingItem } from './types';
import Onboarding from './components/Onboarding';
import ChatInterface from './components/ChatInterface';
import LiveCookingAssistant from './components/LiveCookingAssistant';
import ReceiptScanner from './components/ReceiptScanner';
import Navigation from './components/Navigation';
import DailyView from './components/DailyView';
import LandingPage from './components/LandingPage';
import PlanView from './components/PlanView';
import ProfileView from './components/ProfileView';
import { getWeeklyPlan, generateMealImage, getSingleMealSuggestion } from './services/geminiService';
import { setItem, getItem, removeItem, clearStorage } from './services/storageService';

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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load state from storage on mount (Async)
  useEffect(() => {
    const loadData = async () => {
      try {
        // --- Migration Step: Move LocalStorage to IndexedDB if exists ---
        const localPrefs = localStorage.getItem('nourish_prefs');
        if (localPrefs) {
            await setItem('nourish_prefs', JSON.parse(localPrefs));
            localStorage.removeItem('nourish_prefs');
        }
        const localPlan = localStorage.getItem('nourish_plan');
        if (localPlan) {
            await setItem('nourish_plan', JSON.parse(localPlan));
            localStorage.removeItem('nourish_plan');
        }
        const localList = localStorage.getItem('nourish_list');
        if (localList) {
            await setItem('nourish_list', JSON.parse(localList));
            localStorage.removeItem('nourish_list');
        }
        // ----------------------------------------------------------------

        // Load Preferences
        const savedPrefs = await getItem<UserPreferences>('nourish_prefs');
        if (savedPrefs) {
            // Migration: goals string -> array for existing users
            if (typeof (savedPrefs as any).goals === 'string') {
              (savedPrefs as any).goals = [(savedPrefs as any).goals];
            }
            setPreferences(savedPrefs);
        }

        // Load Plan
        const savedPlan = await getItem<Meal[]>('nourish_plan');
        if (savedPlan) {
            setMealPlan(savedPlan);
        }

        // Load List
        const savedList = await getItem<ShoppingItem[]>('nourish_list');
        if (savedList) {
            setShoppingList(savedList);
        }
      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save list whenever it changes, but only after initial load
  useEffect(() => {
    if (isDataLoaded) {
        setItem('nourish_list', shoppingList).catch(e => console.error("Save list failed", e));
    }
  }, [shoppingList, isDataLoaded]);

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
      
      // Generate images for all meals in parallel
      const mealsWithImages = await Promise.all(meals.map(async (meal) => {
        let imageUrl = '';
        try {
          // Use imagePrompt if available, otherwise fallback to title
          const prompt = meal.imagePrompt || `A delicious photo of ${meal.title}, high quality food photography`;
          
          // Use '1K' which maps to standard generation (Flash model) for speed in batch
          imageUrl = await generateMealImage(prompt, '1K'); 
        } catch (err) {
          console.error(`Failed to generate image for ${meal.title}`, err);
          // Fallback to Unsplash if generation fails
          imageUrl = `https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&h=400&auto=format&fit=crop`; 
        }
        
        return {
          ...meal,
          imageUrl
        };
      }));

      setMealPlan(mealsWithImages);
      await setItem('nourish_plan', mealsWithImages);
    } catch (e) {
      console.error("Failed to generate plan", e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSwapMeal = async (index: number) => {
    if (!preferences || !mealPlan[index]) return;
    
    // We use the same loading state to show UI feedback
    setIsGeneratingPlan(true);
    try {
      const currentMeal = mealPlan[index];
      const newMeal = await getSingleMealSuggestion(preferences, currentMeal);
      
      // Generate Image for new meal
      let imageUrl = '';
      try {
         const prompt = newMeal.imagePrompt || `A delicious photo of ${newMeal.title}, high quality food photography`;
         imageUrl = await generateMealImage(prompt, '1K');
      } catch (err) {
         console.error(`Failed to generate image for ${newMeal.title}`, err);
         imageUrl = `https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&h=400&auto=format&fit=crop`;
      }

      const updatedMeal = { ...newMeal, imageUrl };
      
      const newPlan = [...mealPlan];
      newPlan[index] = updatedMeal;
      
      setMealPlan(newPlan);
      await setItem('nourish_plan', newPlan);
    } catch (e) {
      console.error("Swap failed", e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    await setItem('nourish_prefs', prefs);
    generateAndSavePlan(prefs);
    setView(ViewState.DAILY);
  };

  const handleRegeneratePlan = () => {
    if (preferences) {
      generateAndSavePlan(preferences);
    }
  };

  const handleUpdatePreferences = async (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    await setItem('nourish_prefs', newPrefs);
  };

  const toggleMealLike = async (index: number, type: 'like' | 'dislike') => {
    const newPlan = [...mealPlan];
    if (type === 'like') {
        newPlan[index].liked = !newPlan[index].liked;
        newPlan[index].disliked = false;
    } else {
        newPlan[index].disliked = !newPlan[index].disliked;
        newPlan[index].liked = false;
    }
    setMealPlan(newPlan);
    await setItem('nourish_plan', newPlan);
  };

  const handleResetApp = async () => {
    await clearStorage();
    localStorage.clear(); // Clear legacy if any remains
    setPreferences(null);
    setMealPlan([]);
    setShoppingList([]);
    setView(ViewState.LANDING);
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
         <Navigation 
            currentView={view} 
            setView={setView} 
            preferences={preferences}
         />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative bg-stone-50">
        {/* Removed max-w constraints to allow full fluid width on desktop */}
        <div className="h-full w-full overflow-hidden shadow-sm">
          
          {/* Daily / Home View */}
          {view === ViewState.DAILY && preferences && (
            <DailyView 
              preferences={preferences} 
              mealPlan={mealPlan} 
              onStartCooking={() => setView(ViewState.LIVE_COOKING)}
              onRegenerate={handleRegeneratePlan}
              onSwapMeal={handleSwapMeal}
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
               onResetApp={handleResetApp}
             />
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