
import React, { useState } from 'react';
import { Card as CardType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import Icon from './Icon';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

const CardComponent: React.FC<CardProps> = ({ card, onEdit, onDelete }) => {
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
    <div className="w-full h-64 perspective-1000">
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow">
          <div className="text-xs text-gray-400 dark:text-gray-500 text-right mb-2">
            {t('addedOn')}: {formatDate(card.createdAt)}
          </div>
          <p className="flex-grow flex items-center justify-center text-center text-lg font-medium text-gray-800 dark:text-gray-200">{card.front}</p>
          <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
            <div className="flex gap-3">
              <span className="text-green-600">✓ {card.correct}</span>
              <span className="text-red-600">✗ {card.wrong}</span>
            </div>
            <Icon name="flip" className="w-4 h-4"/>
          </div>
        </div>

        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow">
           <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={() => onEdit(card)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label={t('editCard')}><Icon name="edit" className="w-4 h-4 text-gray-500" /></button>
            <button onClick={() => onDelete(card.id)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label={t('deleteCard')}><Icon name="delete" className="w-4 h-4 text-red-500" /></button>
          </div>
          <p className="flex-grow flex items-center justify-center text-center text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-8">{card.back}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 dark:text-gray-500">Statistics</span>
              {accuracy !== null && (
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${accuracy >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : accuracy >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                      {t('accuracy')}: {accuracy}%
                  </span>
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{t('correctAnswers')}: {card.correct}</span>
              <span>{t('wrongAnswers')}: {card.wrong}</span>
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
