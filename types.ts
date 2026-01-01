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
  cookingTime: string; // 'Fast (15-30m)', 'Medium (30-60m)', 'Slow (>60m)'
  goals: string; // 'Save Money', 'Eat Healthier', 'Try New Foods'
}

export enum ViewState {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DAILY = 'DAILY',
  PLAN = 'PLAN', 
  ASSISTANT = 'ASSISTANT',
  LIST = 'LIST',
  SAVED = 'SAVED',
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
}

export interface GeneratedImageResponse {
  url: string;
  prompt: string;
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
  ingredients: string[]; // Full list with quantities
  prepSteps?: string[]; // Pre-cooking preparation
  cookingSteps?: string[]; // Actual cooking instructions
  recipeUrl: string; // Link to original or search
  imageKeyword: string;
  imageUrl?: string;
  liked?: boolean;
  disliked?: boolean;
}