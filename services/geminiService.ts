
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('GEMINI_API_KEY in service:', API_KEY ? `Present (${API_KEY.substring(0, 10)}...)` : 'Missing');

if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error('API Key check failed:', {
        VITE_GEMINI_API_KEY: API_KEY
    });
    throw new Error("Gemini API key is not configured. Please set your GEMINI_API_KEY in the .env file. Get your API key from: https://makersuite.google.com/app/apikey");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Extracts text from a given image using Gemini.
 * @param {string} base64Image - The base64 encoded image string.
 * @returns {Promise<string>} The extracted text.
 */
export const getTextFromImage = async (base64Image: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: "Extract all text from this image. Preserve the line breaks and language."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        if (error instanceof Error && error.message.includes('API key')) {
            throw new Error("Gemini API key is not configured. Please set your GEMINI_API_KEY in the .env file.");
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
        const response = await ai.models.generateContent({
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
        throw new Error("Failed to generate flashcards. The AI model might be unavailable or the text could not be parsed.");
    }
};
