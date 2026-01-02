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
    - Goals (in priority order): ${preferences.goals.join(', ')}
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
  
  // VERSION 3 PROMPT (With Imagen Template)
  const prompt = `Generate a 7-day dinner meal plan for a family of ${preferences.familySize}.

Diet: ${preferences.dietaryRestrictions.join(', ') || 'Omnivore'}
Allergies: ${preferences.allergies.join(', ') || 'None'}
Avoid ingredients: ${preferences.dislikes?.join(', ') || 'None'}
Goals (priority order): ${preferences.goals.join(', ')}
Cooking Time Preference: ${preferences.cookingTime}

This plan is for dinner meals only.
All ingredient quantities must be scaled appropriately for a family of ${preferences.familySize}.

Diversity rules:
- Every meal must be unique.
- Do not repeat the same primary protein more than twice during the week.
- Do not repeat the same cuisine style on consecutive days.
- Avoid using the same main ingredient in more than three meals.

Ingredient rules:
- Use clean, singular ingredient names (e.g., "Onion", not "Onions").
- Do not include brand names.
- Use standard U.S. measurements (cups, tbsp, tsp, lbs, oz).

Constraint handling:
- If all preferences cannot be fully satisfied, prioritize in this order:
  1. Allergies
  2. Dietary restrictions
  3. Avoid ingredients
  4. Goals
- Stay as close as possible to all preferences when compromises are required.

For each meal, provide:
1. title (mealName)
2. description (Short appetizing description)
3. calories (integer estimate per serving)
4. protein, carbs, fat (nutritional string estimates)
5. difficulty (Easy, Medium, Hard)
6. rating (4.0-5.0)
7. time (e.g. "30 min")
8. ingredients (array of objects: name, amount)
9. recipeUrl (string — a direct recipe link or a Google search URL if unknown)
10. prepSteps (array of strings): Only actions performed before heat is applied
11. cookingSteps (array of strings): Only actions involving heat or appliance use
12. imagePrompt (string — used with Imagen 4)

The imagePrompt MUST be generated using the following template and customized only by replacing {MEAL TITLE} with the exact mealName:

IMAGE PROMPT TEMPLATE (IMAGEN 4):

Generate a high-resolution editorial food-style image for the meal titled:
"{MEAL TITLE}"

Camera & framing:
• Top-down flat lay
• Overhead camera angle
• Centered plated dish as the main focal point
• Balanced composition with intentional negative space

Lighting:
• Soft, natural daylight
• Diffused window-style lighting
• Gentle realistic shadows
• Even exposure, no harsh contrast

Environment:
• Light cool-neutral background
• Matte stone, plaster, or soft concrete texture
• Clean surface with subtle organic imperfections
• Premium lifestyle editorial setting

Styling:
• Modern minimalist food editorial styling
• Clean, intentional arrangement
• Supporting elements placed naturally around the plate
  (small bowls, herbs, grains, seeds, linen napkin, wooden board)
• Styled to look effortless but professionally composed

Color & tone:
• Natural, fresh color palette
• Slightly muted saturation
• High color separation
• Crisp whites and soft neutrals
• No heavy color grading

Focus & realism:
• Deep focus across entire image
• Sharp high-detail textures
• Realistic materials and lighting behavior
• Professional stock-photo quality realism

Mood & purpose:
• Clean
• Fresh
• Health-forward
• Modern lifestyle
• Recipe blog / meal prep app / wellness brand aesthetic

Output quality:
• Ultra-detailed
• Photorealistic
• Studio-quality finish
• No text or branding

NEGATIVE PROMPT (IMPORTANT — DO NOT OMIT):
Avoid:
• Dark or moody lighting
• Dramatic shadows
• Oversaturation
• Cartoon or illustration styles
• AI artifacts
• Plastic or fake textures
• Messy or cluttered composition
• Shallow depth of field
• Extreme close-ups
• Hands, people, faces
• Logos, text, watermarks
• Rustic chaos or casual smartphone photography
• Unrealistic plating or proportions

Return ONLY valid JSON.
Do not include markdown, explanations, emojis, or extra text.

The response MUST be a JSON array of exactly 7 objects.`;

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
                    name: { type: Type.STRING, description: "Clean ingredient name" },
                    amount: { type: Type.STRING, description: "Quantity needed" }
                  }
                } 
              },
              prepSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              recipeUrl: { type: Type.STRING },
              imageKeyword: { type: Type.STRING },
              imagePrompt: { type: Type.STRING, description: "The full prompt for image generation" }
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
      recipeUrl: "https://www.google.com/search?q=healthy+family+dinner",
      imagePrompt: "A healthy family dinner with chicken and vegetables."
    });
  }
};

// -- Single Meal Swap --
export const getSingleMealSuggestion = async (preferences: UserPreferences, avoidMeal: Meal): Promise<Meal> => {
  const modelId = 'gemini-3-flash-preview';
  
  const prompt = `Generate a single dinner meal replacement for a family of ${preferences.familySize}.
  
  CURRENT CONTEXT:
  The user wants to replace this meal: "${avoidMeal.title}".
  The new meal MUST be significantly different (different protein or cuisine).

  Diet: ${preferences.dietaryRestrictions.join(', ') || 'Omnivore'}
  Allergies: ${preferences.allergies.join(', ') || 'None'}
  Avoid ingredients: ${preferences.dislikes?.join(', ') || 'None'}
  Goals: ${preferences.goals.join(', ')}
  Cooking Time: ${preferences.cookingTime}

  Requirements:
  1. Unique and distinct.
  2. Ingredient names must be clean (no brands).
  3. Standard U.S. measurements.

  For the meal, provide:
  - title (mealName)
  - description
  - calories (int)
  - protein, carbs, fat (strings)
  - difficulty (Easy, Medium, Hard)
  - rating (number)
  - time (string)
  - ingredients (array of {name, amount})
  - prepSteps (string array)
  - cookingSteps (string array)
  - recipeUrl (string)
  - imageKeyword (string)
  - imagePrompt (string - see template below)

  IMAGE PROMPT TEMPLATE (IMAGEN 4):

  Generate a high-resolution editorial food-style image for the meal titled:
  "{MEAL TITLE}"

  Camera & framing:
  • Top-down flat lay
  • Overhead camera angle
  • Centered plated dish as the main focal point
  • Balanced composition with intentional negative space

  Lighting:
  • Soft, natural daylight
  • Diffused window-style lighting
  • Gentle realistic shadows
  • Even exposure, no harsh contrast

  Environment:
  • Light cool-neutral background
  • Matte stone, plaster, or soft concrete texture
  • Clean surface with subtle organic imperfections
  • Premium lifestyle editorial setting

  Styling:
  • Modern minimalist food editorial styling
  • Clean, intentional arrangement
  • Supporting elements placed naturally around the plate
    (small bowls, herbs, grains, seeds, linen napkin, wooden board)
  • Styled to look effortless but professionally composed

  Color & tone:
  • Natural, fresh color palette
  • Slightly muted saturation
  • High color separation
  • Crisp whites and soft neutrals
  • No heavy color grading

  Focus & realism:
  • Deep focus across entire image
  • Sharp high-detail textures
  • Realistic materials and lighting behavior
  • Professional stock-photo quality realism

  Mood & purpose:
  • Clean
  • Fresh
  • Health-forward
  • Modern lifestyle
  • Recipe blog / meal prep app / wellness brand aesthetic

  Output quality:
  • Ultra-detailed
  • Photorealistic
  • Studio-quality finish
  • No text or branding

  NEGATIVE PROMPT (IMPORTANT — DO NOT OMIT):
  Avoid:
  • Dark or moody lighting
  • Dramatic shadows
  • Oversaturation
  • Cartoon or illustration styles
  • AI artifacts
  • Plastic or fake textures
  • Messy or cluttered composition
  • Shallow depth of field
  • Extreme close-ups
  • Hands, people, faces
  • Logos, text, watermarks
  • Rustic chaos or casual smartphone photography
  • Unrealistic plating or proportions

  Return ONLY valid JSON.
  Do not include markdown, explanations, emojis, or extra text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
                    name: { type: Type.STRING, description: "Clean ingredient name" },
                    amount: { type: Type.STRING, description: "Quantity needed" }
                  }
                } 
              },
              prepSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              recipeUrl: { type: Type.STRING },
              imageKeyword: { type: Type.STRING },
              imagePrompt: { type: Type.STRING, description: "The full prompt for image generation" }
            }
          }
        }
      });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Single Meal Swap Error:", error);
    // Fallback data
    return { 
      title: "Simple Pasta", 
      imageKeyword: "pasta",
      description: "A quick fallback meal.",
      calories: 400,
      difficulty: "Easy",
      rating: 4.0,
      time: "15 min",
      ingredients: [
        { name: "Pasta", amount: "1 lb" },
        { name: "Marinara Sauce", amount: "1 jar" }
      ],
      protein: "10g",
      carbs: "60g",
      fat: "5g",
      prepSteps: ["Boil water"],
      cookingSteps: ["Cook pasta", "Add sauce"],
      recipeUrl: "https://www.google.com/search?q=simple+pasta",
      imagePrompt: "Simple pasta dish"
    };
  }
};

// -- Image Generation --
export const generateMealImage = async (prompt: string, size: '1K' | '2K' | '4K') => {
  // Use 'gemini-2.5-flash-image' for standard (1K) requests to improve speed/latency.
  // Use 'gemini-3-pro-image-preview' for high quality (2K/4K) requests.
  const isHighQuality = size === '2K' || size === '4K';
  const modelId = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  try {
    const config: any = {
       imageConfig: {
           aspectRatio: '4:3',
       }
    };
    
    // imageSize is only supported by the Pro model
    if (isHighQuality) {
       config.imageConfig.imageSize = size;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }]
      },
      config: config
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