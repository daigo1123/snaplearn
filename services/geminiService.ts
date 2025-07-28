
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        throw new Error("Failed to process image with Gemini API.");
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
