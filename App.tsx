
import React, { useState, useEffect } from 'react';
import { CardProvider, useCards } from './context/CardContext';
import { ToastProvider, useToast } from './hooks/useToast';
import { useLanguage } from './hooks/useLanguage';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import CardList from './components/CardList';
import StudyMode from './components/StudyMode';
import { View } from './types';
import { storageService } from './services/storageService';

const MainApp: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const { state, dispatch } = useCards();
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cards = await storageService.load();
        dispatch({ type: 'SET_CARDS', payload: cards });
        if (cards.length === 0) {
          setView('upload');
        } else {
          setView('list');
        }
      } catch (error) {
        console.error("Failed to load cards:", error);
        addToast("Error loading your cards. Your browser's private mode might be preventing data storage.", 'error');
        setView('upload');
      }
    };
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onCardsCreated = () => {
    setView('list');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={view} setView={setView} hasCards={state.cards.length > 0} />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {view === 'upload' && <ImageUploader onCardsCreated={onCardsCreated} />}
        {view === 'list' && <CardList setView={setView} />}
        {view === 'study' && <StudyMode />}
      </main>
      <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <CardProvider>
        <MainApp />
      </CardProvider>
    </ToastProvider>
  );
};

export default App;
