
import React from 'react';
import { View } from '../types';
import Icon from './Icon';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  hasCards: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, hasCards }) => {
  const navButtonClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const activeClasses = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Icon name="cards" className="w-7 h-7 text-indigo-500" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">SnapLearn</h1>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView('upload')}
              className={`${navButtonClasses} ${currentView === 'upload' ? activeClasses : inactiveClasses}`}
              aria-label="Upload new image"
            >
              <Icon name="upload" className="w-5 h-5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <button
              onClick={() => hasCards && setView('list')}
              disabled={!hasCards}
              className={`${navButtonClasses} ${currentView === 'list' ? activeClasses : inactiveClasses} ${!hasCards ? disabledClasses : ''}`}
              aria-label="View all cards"
            >
              <Icon name="cards" className="w-5 h-5" />
              <span className="hidden sm:inline">My Cards</span>
            </button>
            <button
              onClick={() => hasCards && setView('study')}
              disabled={!hasCards}
              className={`${navButtonClasses} ${currentView === 'study' ? activeClasses : inactiveClasses} ${!hasCards ? disabledClasses : ''}`}
              aria-label="Start study session"
            >
              <Icon name="study" className="w-5 h-5" />
              <span className="hidden sm:inline">Study</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
