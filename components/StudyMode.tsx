
import React, { useState, useEffect, useMemo } from 'react';
import { useCards } from '../hooks/useCards';
import { useLanguage } from '../hooks/useLanguage';
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
  const { t } = useLanguage();
  const [studyDeck, setStudyDeck] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  // デバッグ用のログ
  console.log('StudyMode render:', {
    currentIndex,
    studyDeckLength: studyDeck.length,
    sessionFinished,
    isFlipped
  });

  useEffect(() => {
    if (state.cards.length > 0) {
      console.log('Setting up new study deck:', state.cards.length, 'cards');
      setStudyDeck(shuffleArray(state.cards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionFinished(false);
    }
  }, [state.cards]);

  const handleNextCard = (knewIt: boolean) => {
    console.log('handleNextCard called:', {
      knewIt,
      currentIndex,
      studyDeckLength: studyDeck.length,
      nextIndex: currentIndex + 1
    });
    
    const cardId = studyDeck[currentIndex].id;
    if (knewIt) {
      dispatch({ type: 'INCREMENT_CORRECT', payload: cardId });
    } else {
      dispatch({ type: 'INCREMENT_WRONG', payload: cardId });
    }
    
    if (currentIndex < studyDeck.length - 1) {
      const nextIndex = currentIndex + 1;
      console.log('Moving to next card:', nextIndex);
      setCurrentIndex(nextIndex);
      setIsFlipped(false);
    } else {
      console.log('Session finished');
      setSessionFinished(true);
    }
  };

  const restartSession = () => {
      console.log('Restarting session');
      setStudyDeck(shuffleArray(state.cards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionFinished(false);
  };
  
  const currentCard = useMemo(() => {
    const card = studyDeck[currentIndex];
    console.log('Current card:', currentIndex, card?.front);
    return card;
  }, [studyDeck, currentIndex]);
  
  const progressPercentage = studyDeck.length > 0 ? ((currentIndex + (sessionFinished ? 1 : 0)) / studyDeck.length) * 100 : 0;

  if (studyDeck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Icon name="cards" className="w-10 h-10 text-gray-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('addCardsToStudy')}</h3>
          <p className="text-gray-500 dark:text-gray-400">Create some flashcards first to start studying!</p>
        </div>
      </div>
    );
  }
  
  if (sessionFinished) {
      return (
          <div className="text-center max-w-md mx-auto py-12 animate-slide-up">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-green flex items-center justify-center">
                  <Icon name="correct" className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{t('greatJob')}</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('sessionComplete')}</p>
              </div>
              <div className="mt-8">
                <button
                    onClick={restartSession}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white gradient-blue rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                    <Icon name="shuffle" className="w-5 h-5"/>
                    <span>{t('studyAgain')}</span>
                </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col h-full">
        <div className="mb-4">
            <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                <span>{t('progress')}</span>
                <span>{currentIndex + 1} / {studyDeck.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="gradient-blue h-3 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </div>

        <div className="flex-grow flex items-center justify-center py-6">
            {currentCard && <StudyCard card={currentCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />}
        </div>
      
        <div className="mt-6">
            {isFlipped ? (
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleNextCard(false)} className="flex items-center justify-center gap-3 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                        <Icon name="wrong" className="w-6 h-6"/>
                        <span>{t('didntKnow')}</span>
                    </button>
                    <button onClick={() => handleNextCard(true)} className="flex items-center justify-center gap-3 p-4 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-bold rounded-xl hover:bg-green-200 dark:hover:bg-green-900 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                        <Icon name="correct" className="w-6 h-6"/>
                        <span>{t('knewIt')}</span>
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsFlipped(true)} className="w-full p-4 gradient-purple text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 shadow-lg">
                    {t('showAnswer')}
                </button>
            )}
        </div>
    </div>
  );
};

export default StudyMode;
