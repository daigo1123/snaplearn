
import React, { useState } from 'react';
import { Card as CardType } from '../types';
import Icon from './Icon';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

const CardComponent: React.FC<CardProps> = ({ card, onEdit, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

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

  return (
    <div className="w-full h-64 perspective-1000">
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
          <p className="flex-grow flex items-center justify-center text-center text-lg font-medium text-gray-800 dark:text-gray-200">{card.front}</p>
          <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
            <span>Question</span>
            <Icon name="flip" className="w-4 h-4"/>
          </div>
        </div>

        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer">
           <div className="absolute top-3 right-3 flex gap-1">
            <button onClick={() => onEdit(card)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Edit card"><Icon name="edit" className="w-4 h-4 text-gray-500" /></button>
            <button onClick={() => onDelete(card.id)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Delete card"><Icon name="delete" className="w-4 h-4 text-red-500" /></button>
          </div>
          <p className="flex-grow flex items-center justify-center text-center text-lg font-semibold text-indigo-600 dark:text-indigo-400">{card.back}</p>
          <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
            <span>Answer</span>
            {accuracy !== null && (
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${accuracy >= 75 ? 'bg-green-100 text-green-800' : accuracy >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {accuracy}%
                </span>
            )}
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
