
export type Role = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  isLoading?: boolean;
  groundingUrls?: Array<{title: string, uri: string}>;
  image?: string; // Base64 or URL
  toolCalls?: any[];
}

export interface UserPreferences {
  name: string;
  familySize: number;
  dietaryRestrictions: string[]; // e.g., 'Gluten Free', 'Vegetarian'
  allergies: string[];
  dislikes: string[]; // New field for ingredients to avoid
  cookingTime: string; // 'Fast (15-30m)', 'Medium (30-60m)', 'Slow (>60m)'
  goals: string[]; // Changed to array for multiple ordered goals
}

export enum ViewState {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DAILY = 'DAILY',
  PLAN = 'PLAN', 
  ASSISTANT = 'ASSISTANT',
  LIST = 'LIST',
  PROFILE = 'PROFILE',
  LIVE_COOKING = 'LIVE_COOKING' // Sub-view
}

export interface ReceiptItem {
  name: string;
  category: string;
  expiryEstimate?: string;
}

export interface ShoppingItem extends ReceiptItem {
  id: string;
  checked: boolean;
  addedFrom?: string; // 'scan' or 'meal-plan'
  searchTerm?: string; // Optimized search query for retailers
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Meal {
  title: string;
  description: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  difficulty: string; // "Easy", "Medium", "Hard"
  rating: number;
  time: string; // e.g. "30 min"
  ingredients: (Ingredient | string)[]; // structured object or string for backward compatibility
  prepSteps?: string[]; // Pre-cooking preparation
  cookingSteps?: string[]; // Actual cooking instructions
  recipeUrl: string; // Link to original or search
  imageKeyword: string;
  imagePrompt?: string; // New field for Imagen generation
  imageUrl?: string;
  liked?: boolean;
  disliked?: boolean;
}