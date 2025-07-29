
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 詳細なデバッグ情報を追加
console.log('=== GEMINI API KEY DEBUG INFO ===');
console.log('Raw API_KEY:', API_KEY);
console.log('API_KEY type:', typeof API_KEY);
console.log('API_KEY length:', API_KEY ? API_KEY.length : 'undefined');
console.log('Environment mode:', import.meta.env.MODE);
console.log('Development mode:', import.meta.env.DEV);
console.log('Production mode:', import.meta.env.PROD);
console.log('All env vars:', import.meta.env);
console.log('=== END DEBUG INFO ===');

console.log('GEMINI_API_KEY in service:', API_KEY ? `Present (${API_KEY.substring(0, 10)}...)` : 'Missing');
console.log('Environment variables check:', {
    VITE_GEMINI_API_KEY: API_KEY ? 'Present' : 'Missing',
    env: import.meta.env
});

// APIキーが無い場合でもアプリは起動できるように、初期化をlazy loadingにする
let ai: GoogleGenAI | null = null;

const getAI = () => {
    console.log('getAI called - API_KEY check:', {
        hasApiKey: !!API_KEY,
        apiKeyType: typeof API_KEY,
        apiKeyValue: API_KEY,
        isUndefined: API_KEY === 'undefined',
        isDefault: API_KEY === 'your_api_key_here'
    });
    
    if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY === 'undefined' || API_KEY === undefined) {
        console.error('API Key validation failed:', {
            API_KEY,
            condition1: !API_KEY,
            condition2: API_KEY === 'your_api_key_here',
            condition3: API_KEY === 'undefined',
            condition4: API_KEY === undefined
        });
        throw new Error("Gemini API key is not configured. Please set your VITE_GEMINI_API_KEY in Vercel environment variables. Get your API key from: https://makersuite.google.com/app/apikey");
    }
    
    if (!ai) {
        console.log('Initializing GoogleGenAI with API key...');
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    
    return ai;
};

/**
 * Extracts text from a given image using Gemini.
 * @param {string} base64Image - The base64 encoded image string.
 * @returns {Promise<string>} The extracted text.
 */
export const getTextFromImage = async (base64Image: string): Promise<string> => {
    try {
        const aiInstance = getAI(); // APIキーチェックはここで行う
        
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: "Extract all text from this image. Preserve the line breaks and language."
        };

        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        if (error instanceof Error && (error.message.includes('API key') || error.message.includes('not configured'))) {
            throw new Error("Gemini API key is not configured. Please check your Vercel environment variables.");
        }
        throw new Error("Failed to process image with Gemini API. Please check your API key and try again.");
    }
};

/**
 * Converts a block of raw text into structured flashcard data using Gemini.
 * @param {string} text - The raw text to convert.
 * @returns {Promise<Array<{ front: string; back: string }>>} An array of flashcard objects.
 */
export const generateCardsFromText = async (text: string): Promise<Array<{ front: string; back: string }>> => {
    if (!text.trim()) {
        return [];
    }

    try {
        const aiInstance = getAI(); // APIキーチェックはここで行う
        
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following text and convert it into flashcards. Each flashcard should have a "front" (question/term) and a "back" (answer/definition). Intelligently identify pairs based on separators like ':', '-', or '?'. If no clear separator exists, use context to create meaningful pairs. Text to analyze:\n\n---\n${text}\n---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "A list of flashcards generated from the text.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            front: {
                                type: Type.STRING,
                                description: "The front of the flashcard (question or term).",
                            },
                            back: {
                                type: Type.STRING,
                                description: "The back of the flashcard (answer or definition).",
                            },
                        },
                        required: ["front", "back"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const cards = JSON.parse(jsonText);
        return Array.isArray(cards) ? cards : [];

    } catch (error) {
        console.error("Error generating cards from text:", error);
        if (error instanceof Error && (error.message.includes('API key') || error.message.includes('not configured'))) {
            throw new Error("Gemini API key is not configured. Please check your Vercel environment variables.");
        }
        throw new Error("Failed to generate flashcards. The AI model might be unavailable or the text could not be parsed.");
    }
};
