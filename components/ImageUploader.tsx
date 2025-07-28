
import React, { useState, useRef, useCallback } from 'react';
import { useCards } from '../hooks/useCards';
import { useToast } from '../hooks/useToast';
import { generateCardsFromText, getTextFromImage } from '../services/geminiService';
import { Card } from '../types';
import Icon from './Icon';

interface ImageUploaderProps {
  onCardsCreated: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onCardsCreated }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useCards();
  const { addToast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Note: In a real-world app, use a library like browser-image-compression here.
      // For simplicity, we are skipping the compression step.
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processImage = useCallback(async () => {
    if (!imagePreview) {
      addToast('Please select an image first.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      setLoadingStep('1/2: Extracting text from image...');
      // The Data URL includes a prefix we need to remove for the API
      const base64Image = imagePreview.split(',')[1];
      const extractedText = await getTextFromImage(base64Image);
      
      if (!extractedText || extractedText.trim().length === 0) {
        addToast('No text could be found in the image. Please try another one or enter cards manually.', 'info');
        setIsLoading(false);
        return;
      }

      setLoadingStep('2/2: Generating flashcards...');
      const generatedCards = await generateCardsFromText(extractedText);

      if (generatedCards.length === 0) {
         addToast('Could not automatically create cards. You can add them manually.', 'info');
         onCardsCreated(); // Go to list view even if no cards were made
         return;
      }

      const newCards: Card[] = generatedCards.map(card => ({
        ...card,
        id: crypto.randomUUID(),
        correct: 0,
        wrong: 0,
        createdAt: Date.now(),
      }));

      newCards.forEach(card => dispatch({ type: 'ADD_CARD', payload: card }));
      addToast(`${newCards.length} cards created successfully!`, 'success');
      onCardsCreated();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
      addToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [imagePreview, dispatch, addToast, onCardsCreated]);

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div
        className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer"
        onClick={handleUploadClick}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        {imagePreview ? (
          <img src={imagePreview} alt="Selected preview" className="mx-auto max-h-64 rounded-md shadow-md" />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-500 dark:text-gray-400">
            <Icon name="upload" className="w-16 h-16"/>
            <p className="text-lg font-semibold">Click to upload an image</p>
            <p className="text-sm">Or drag and drop a file here</p>
            <p className="text-xs">Supports JPG, PNG, WEBP. Use your camera for notes!</p>
          </div>
        )}
      </div>

      {imagePreview && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={processImage}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
                <Icon name="cards" className="w-5 h-5"/>
            )}
            <span>{isLoading ? 'Processing...' : 'Create Flashcards'}</span>
          </button>
          {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">{loadingStep}</p>}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
