
import React, { useState, useEffect, useMemo } from 'react';
import { useCards } from '../hooks/useCards';
import { Card } from '../types';
import Icon from './Icon';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const StudyCard: React.FC<{ card: Card, isFlipped: boolean, onFlip: () => void }> = ({ card, isFlipped, onFlip }) => {
    return (
        <div className="w-full h-80 perspective-1000" onClick={onFlip}>
            <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                    <p className="text-2xl md:text-3xl font-semibold text-center text-gray-800 dark:text-gray-200">{card.front}</p>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                     <p className="text-2xl md:text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">{card.back}</p>
                </div>
            </div>
        </div>
    );
};

const StudyMode: React.FC = () => {
  const { state, dispatch } = useCards();
  const [studyDeck, setStudyDeck] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  useEffect(() => {
    if (state.cards.length > 0) {
      setStudyDeck(shuffleArray(state.cards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionFinished(false);
    }
  }, [state.cards]);

  const handleNextCard = (knewIt: boolean) => {
    const cardId = studyDeck[currentIndex].id;
    if (knewIt) {
      dispatch({ type: 'INCREMENT_CORRECT', payload: cardId });
    } else {
      dispatch({ type: 'INCREMENT_WRONG', payload: cardId });
    }
    
    if (currentIndex < studyDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setSessionFinished(true);
    }
  };

  const restartSession = () => {
      setStudyDeck(shuffleArray(state.cards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionFinished(false);
  };
  
  const currentCard = useMemo(() => studyDeck[currentIndex], [studyDeck, currentIndex]);
  const progressPercentage = studyDeck.length > 0 ? ((currentIndex + (sessionFinished ? 1 : 0)) / studyDeck.length) * 100 : 0;

  if (studyDeck.length === 0) {
    return <div className="text-center p-10">Add some cards to start studying!</div>;
  }
  
  if (sessionFinished) {
      return (
          <div className="text-center max-w-md mx-auto py-12">
              <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Great job!</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">You've completed this study session.</p>
              <div className="mt-8">
                <button
                    onClick={restartSession}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    <Icon name="shuffle" className="w-5 h-5"/>
                    <span>Study Again</span>
                </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col h-full">
        <div className="mb-4">
            <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{currentIndex + 1} / {studyDeck.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </div>

        <div className="flex-grow flex items-center justify-center py-6">
            {currentCard && <StudyCard card={currentCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />}
        </div>
      
        <div className="mt-6">
            {isFlipped ? (
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleNextCard(false)} className="flex items-center justify-center gap-3 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                        <Icon name="wrong" className="w-6 h-6"/>
                        <span>Didn't Know</span>
                    </button>
                    <button onClick={() => handleNextCard(true)} className="flex items-center justify-center gap-3 p-4 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-bold rounded-lg hover:bg-green-200 dark:hover:bg-green-900 transition-colors">
                        <Icon name="correct" className="w-6 h-6"/>
                        <span>Knew It!</span>
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsFlipped(true)} className="w-full p-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                    Show Answer
                </button>
            )}
        </div>
    </div>
  );
};

export default StudyMode;
