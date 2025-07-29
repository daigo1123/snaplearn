
import React, { useState, useMemo } from 'react';
import { useCards } from '../hooks/useCards';
import { useLanguage } from '../hooks/useLanguage';
import { Card as CardType, View } from '../types';
import CardComponent from './Card';
import CardEditorModal from './CardEditorModal';
import Icon from './Icon';

interface CardListProps {
  setView: (view: View) => void;
}

const CardList: React.FC<CardListProps> = ({ setView }) => {
  const { state, dispatch } = useCards();
  const { t } = useLanguage();
  const { cards, folders } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'date'>('grid');

  const filteredCards = useMemo(() => {
    let filtered = cards;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.back.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedFilter === 'favorites') {
      filtered = filtered.filter(card => card.isFavorite);
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(card => card.folderId === selectedFilter);
    }
    
    return filtered;
  }, [cards, searchTerm, selectedFilter]);

  const groupedCards = useMemo(() => {
    if (viewMode === 'date') {
      const groups: { [key: string]: CardType[] } = {};
      filteredCards.forEach(card => {
        const dateKey = new Date(card.createdAt).toDateString();
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(card);
      });
      return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }
    return null;
  }, [filteredCards, viewMode]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      dispatch({ type: 'DELETE_CARD', payload: id });
    }
  };
  
  const handleEdit = (card: CardType) => {
    setEditingCard(card);
  };

  const handleSave = (card: CardType) => {
    if (cards.some(c => c.id === card.id)) {
      dispatch({ type: 'UPDATE_CARD', payload: card });
    } else {
      dispatch({ type: 'ADD_CARD', payload: card });
    }
    setEditingCard(null);
  };

  const handleToggleFavorite = (id: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
  };
  
  const handleAddNew = () => {
    setEditingCard({
        id: crypto.randomUUID(),
        front: '',
        back: '',
        correct: 0,
        wrong: 0,
        createdAt: Date.now(),
        isFavorite: false,
        folderId: undefined
    });
  }

  if (state.isLoading) {
    return <div className="text-center p-10">Loading your flashcards...</div>
  }
  
  if (cards.length === 0) {
    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Flashcards Yet!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Ready to start learning? Create your first card.</p>
            <div className="mt-6">
                <button
                    onClick={() => setView('upload')}
                    className="mr-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    <Icon name="upload" className="w-5 h-5"/>
                    <span>Upload an Image</span>
                </button>
                 <button
                    onClick={handleAddNew}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    <Icon name="add" className="w-5 h-5"/>
                    <span>Add Manually</span>
                </button>
            </div>
        </div>
    );
  }

  return (
    <div>
      {/* Search and Add Button - Mobile First */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 duration-200"
        >
          <Icon name="add" className="w-5 h-5" />
          <span>Add New Card</span>
        </button>
      </div>

      {/* Filter and View Mode Buttons - Mobile Optimized */}
      <div className="mb-6 space-y-3">
        {/* Filter Pills - Horizontal scroll on mobile */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-2" style={{ minWidth: 'fit-content' }}>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon name="cards" className="w-4 h-4" />
              {t('allCards')}
            </button>
            <button
              onClick={() => setSelectedFilter('favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedFilter === 'favorites'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon name="star" className="w-4 h-4" />
              {t('favorites')}
            </button>
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFilter(folder.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedFilter === folder.id
                    ? 'shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedFilter === folder.id ? folder.color + '20' : undefined,
                  color: selectedFilter === folder.id ? folder.color : undefined
                }}
              >
                <Icon name="folder" className="w-4 h-4" />
                {folder.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <Icon name="grid" className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('date')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
              viewMode === 'date'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <Icon name="calendar" className="w-4 h-4" />
            <span className="hidden sm:inline">Date</span>
          </button>
        </div>
      </div>

      {/* Cards Display - Mobile Optimized */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-slide-up">
          {filteredCards.map(card => (
            <CardComponent key={card.id} card={card} onDelete={handleDelete} onEdit={handleEdit} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8 animate-slide-up">
          {groupedCards?.map(([date, cards]) => (
            <div key={date} className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 px-1">
                {new Date(date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
                <span className="ml-2 text-xs sm:text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {cards.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {cards.map(card => (
                  <CardComponent key={card.id} card={card} onDelete={handleDelete} onEdit={handleEdit} onToggleFavorite={handleToggleFavorite} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 animate-slide-up">
            <p>No cards found for "{searchTerm}".</p>
        </div>
      )}

      {filteredCards.length === 0 && !searchTerm && selectedFilter !== 'all' && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 animate-slide-up">
            <p>No cards in this category yet.</p>
        </div>
      )}

      {editingCard && (
        <CardEditorModal
          card={editingCard}
          onSave={handleSave}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
};

export default CardList;
