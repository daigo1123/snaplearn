
import React from 'react';
import { View } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import Icon from './Icon';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  hasCards: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, hasCards }) => {
  const { t } = useLanguage();
  const navButtonClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200";
  const activeClasses = "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-sm ring-2 ring-indigo-200 dark:ring-indigo-700 scale-105";
  const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-102";
  const disabledClasses = "opacity-40 cursor-not-allowed grayscale";

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => hasCards && setView('list')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer min-w-0"
            disabled={!hasCards}
          >
            <Icon name="cards" className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">{t('appName')}</h1>
          </button>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setView('upload')}
              className={`${navButtonClasses} ${currentView === 'upload' ? activeClasses : inactiveClasses} relative`}
              aria-label="Upload new image"
            >
              <Icon name="upload" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline text-xs sm:text-sm">{t('upload')}</span>
              {currentView === 'upload' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => hasCards && setView('list')}
              disabled={!hasCards}
              className={`${navButtonClasses} ${currentView === 'list' ? activeClasses : inactiveClasses} ${!hasCards ? disabledClasses : ''} relative`}
              aria-label="View all cards"
            >
              <Icon name="cards" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline text-xs sm:text-sm">{t('myCards')}</span>
              {currentView === 'list' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => hasCards && setView('study')}
              disabled={!hasCards}
              className={`${navButtonClasses} ${currentView === 'study' ? activeClasses : inactiveClasses} ${!hasCards ? disabledClasses : ''} relative`}
              aria-label="Start study session"
            >
              <Icon name="study" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline text-xs sm:text-sm">{t('study')}</span>
              {currentView === 'study' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"></div>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
