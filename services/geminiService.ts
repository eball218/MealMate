import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { UserPreferences, ReceiptItem, Meal } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// -- Chat with Search Grounding & Tools --
export const sendChatMessage = async (
  message: string, 
  history: any[], 
  preferences: UserPreferences
) => {
  const modelId = 'gemini-3-flash-preview';
  
  const regeneratePlanTool: FunctionDeclaration = {
    name: "regenerate_plan",
    description: "Regenerate the entire weekly meal plan with new recipes. Use this when the user asks to change the week's plan or swap all meals.",
    parameters: { type: Type.OBJECT, properties: {} }
  };

  const systemInstruction = `
    You are Nourish, a friendly, family-focused meal planning assistant.
    Family Profile:
    - Size: ${preferences.familySize} people
    - Diets: ${preferences.dietaryRestrictions.join(', ') || 'None'}
    - Allergies: ${preferences.allergies.join(', ') || 'None'}
    - Dislikes: ${preferences.dislikes?.join(', ') || 'None'}
    - Goals: ${preferences.goals}
    - Preferred Cooking Time: ${preferences.cookingTime}

    Tone: Warm, encouraging, calm.
    If the user asks to change the plan or get new meals for the week, call the 'regenerate_plan' tool.
    Use Google Search to find current prices or popular new recipes if asked.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        tools: [
            { googleSearch: {} }, 
            { functionDeclarations: [regeneratePlanTool] }
        ]
      }
    });

    const text = response.text || "";
    const toolCalls = response.functionCalls;
    
    // Extract grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let groundingUrls: Array<{title: string, uri: string}> = [];
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingUrls.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return { text, groundingUrls, toolCalls };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

// -- Weekly Meal Plan --
export const getWeeklyPlan = async (preferences: UserPreferences): Promise<Meal[]> => {
  const modelId = 'gemini-3-flash-preview';
  
  const prompt = `Generate a 7-day dinner meal plan for a family of ${preferences.familySize}.
  Diet: ${preferences.dietaryRestrictions.join(', ') || 'Omnivore'}.
  Allergies: ${preferences.allergies.join(', ') || 'None'}.
  Avoid ingredients: ${preferences.dislikes?.join(', ') || 'None'}.
  Goal: ${preferences.goals}.
  Cooking Time Preference: ${preferences.cookingTime}.
  Ensure every meal is unique and distinct from the others in the week.
  
  For each meal, provide:
  1. A list of ingredients where 'name' is the clean product name (e.g. 'Chicken Breast', not 'Fresh Organic Chicken') and 'amount' is the quantity (e.g. '2 lbs').
  2. A valid URL to a recipe page for this dish (or a google search URL if specific one unknown).
  3. A list of preparation steps (prepSteps).
  4. A list of cooking steps (cookingSteps).

  Return a JSON array of 7 objects.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.STRING },
              carbs: { type: Type.STRING },
              fat: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              time: { type: Type.STRING },
              ingredients: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Clean ingredient name for shopping search" },
                    amount: { type: Type.STRING, description: "Quantity needed" }
                  }
                } 
              },
              prepSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              recipeUrl: { type: Type.STRING },
              imageKeyword: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Weekly Plan Error:", error);
    // Fallback data if AI fails
    return Array(7).fill({ 
      title: "Healthy Family Dinner", 
      imageKeyword: "dinner",
      description: "A nutritious meal for the family.",
      calories: 500,
      difficulty: "Medium",
      rating: 4.5,
      time: "30 min",
      ingredients: [
        { name: "Chicken Breast", amount: "1 lb" },
        { name: "White Rice", amount: "2 cups" },
        { name: "Broccoli", amount: "1 head" },
        { name: "Soy Sauce", amount: "2 tbsp" }
      ],
      prepSteps: ["Wash vegetables", "Cut chicken into cubes"],
      cookingSteps: ["Cook rice according to package", "Stir fry chicken", "Add veggies"],
      recipeUrl: "https://www.google.com/search?q=healthy+family+dinner"
    });
  }
};

// -- Image Generation (High Quality) --
export const generateMealImage = async (prompt: string, size: '1K' | '2K' | '4K') => {
  const modelId = 'gemini-3-pro-image-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3', // Better for card layout
          imageSize: size
        }
      }
    });

    // Find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

// -- Receipt Analysis --
export const analyzeReceipt = async (base64Image: string): Promise<ReceiptItem[]> => {
  const modelId = 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, practically detected from file
              data: base64Image
            }
          },
          {
            text: "Extract grocery items from this receipt. Return a JSON list with name, category, and expiryEstimate (e.g. '1 week')."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              expiryEstimate: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Gemini Receipt Error:", error);
    throw error;
  }
};