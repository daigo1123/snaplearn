
import React, { useState } from 'react';
import { Card as CardType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import Icon from './Icon';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isDeleting?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, onEdit, onDelete, onToggleFavorite, isDeleting = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { t } = useLanguage();

  const handleFlip = (e: React.MouseEvent) => {
    // Prevent flip if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const accuracy = (card.correct + card.wrong) > 0 
    ? Math.round((card.correct / (card.correct + card.wrong)) * 100) 
    : null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`w-full h-56 sm:h-64 perspective-1000 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {isDeleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-xl">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <span className="text-sm text-red-600 font-medium">Deleting...</span>
          </div>
        </div>
      )}
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          {/* Header with favorite star */}
          <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {formatDate(card.createdAt)}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(card.id);
              }}
              className={`p-2 rounded-full transition-all duration-200 touch-manipulation ${
                card.isFavorite 
                  ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 scale-110' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
              }`}
              aria-label="Toggle favorite"
            >
              <Icon name="star" className={`w-5 h-5 ${card.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          {/* Main content */}
          <div className="flex-grow flex items-center justify-center p-4">
            <p className="text-center text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{card.front}</p>
          </div>
          
          {/* Footer with stats */}
          <div className="flex justify-between items-center p-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {card.correct}
              </span>
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {card.wrong}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Icon name="flip" className="w-4 h-4"/>
              <span>Tap to flip</span>
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
          {/* Header with action buttons */}
          <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Icon name="flip" className="w-4 h-4"/>
              <span>Answer</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(card); }} 
                className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-all duration-200 touch-manipulation" 
                aria-label={t('editCard')}
              >
                <Icon name="edit" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} 
                className="p-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-all duration-200 touch-manipulation" 
                aria-label={t('deleteCard')}
              >
                <Icon name="delete" className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
          
          {/* Main answer content */}
          <div className="flex-grow flex items-center justify-center p-4">
            <p className="text-center text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-400 leading-relaxed">{card.back}</p>
          </div>
          
          {/* Statistics footer */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
            {accuracy !== null && (
              <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  accuracy >= 75 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : accuracy >= 50 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {t('accuracy')}: {accuracy}%
                </span>
              </div>
            )}
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-600 dark:text-gray-400">{t('correctAnswers')}: {card.correct}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-600 dark:text-gray-400">{t('wrongAnswers')}: {card.wrong}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom CSS for 3D transform effects
const customStyles = `
  .perspective-1000 { perspective: 1000px; }
  .transform-style-preserve-3d { transform-style: preserve-3d; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = customStyles;
document.head.appendChild(styleSheet);


export default CardComponent;
