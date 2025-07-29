
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useCards();
  const { addToast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      addToast('Please select a valid image file (JPG, PNG, or WEBP)', 'error');
      return false;
    }

    if (file.size > maxSize) {
      addToast('File size must be less than 10MB', 'error');
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(0);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setUploadProgress(100);
        addToast('Image uploaded successfully!', 'success');
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
    setUploadProgress(0);
    try {
      setLoadingStep('1/2: Extracting text from image...');
      setUploadProgress(25);
      
      const base64Image = imagePreview.split(',')[1];
      const extractedText = await getTextFromImage(base64Image);
      
      setUploadProgress(50);
      
      if (!extractedText || extractedText.trim().length === 0) {
        addToast('No text could be found in the image. Please try a clearer image with visible text, or add cards manually.', 'warning');
        setIsLoading(false);
        setUploadProgress(0);
        return;
      }

      setLoadingStep('2/2: Generating flashcards...');
      setUploadProgress(75);
      const generatedCards = await generateCardsFromText(extractedText);

      setUploadProgress(90);

      if (generatedCards.length === 0) {
         addToast('Could not automatically create cards from this content. Try uploading a different image or add cards manually.', 'warning');
         onCardsCreated();
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
      setUploadProgress(100);
      addToast(`Successfully created ${newCards.length} flashcard${newCards.length > 1 ? 's' : ''}!`, 'success');
      onCardsCreated();
    } catch (error) {
      console.error(error);
      let errorMessage = "Something went wrong while processing your image.";
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "API key is missing or invalid. Please check your configuration.";
        } else if (error.message.includes('quota')) {
          errorMessage = "API quota exceeded. Please try again later.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      addToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      setUploadProgress(0);
    }
  }, [imagePreview, dispatch, addToast, onCardsCreated]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && validateFile(files[0])) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(0);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setUploadProgress(100);
        addToast('Image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
          isDragOver 
            ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20' 
            : imagePreview 
              ? 'border-gray-300 dark:border-gray-600' 
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
        }`}
        onClick={!isDragOver ? handleUploadClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
            <Icon name="upload" className={`w-16 h-16 ${isDragOver ? 'text-indigo-500' : ''}`}/>
            <p className="text-lg font-semibold">
              {isDragOver ? 'Drop your image here' : 'Click to upload an image'}
            </p>
            <p className="text-sm">Or drag and drop a file here</p>
            <div className="flex items-center gap-2 text-xs">
              <span>Supported formats:</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md font-medium">JPG</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md font-medium">PNG</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md font-medium">WEBP</span>
            </div>
            <p className="text-xs text-gray-400">Max file size: 10MB • Perfect for camera photos!</p>
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
          {isLoading && (
            <div className="w-full max-w-md space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{loadingStep}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">{Math.round(uploadProgress)}% complete</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
