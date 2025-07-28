
import React, { useState, useMemo } from 'react';
import { useCards } from '../hooks/useCards';
import { Card as CardType, View } from '../types';
import CardComponent from './Card';
import CardEditorModal from './CardEditorModal';
import Icon from './Icon';

interface CardListProps {
  setView: (view: View) => void;
}

const CardList: React.FC<CardListProps> = ({ setView }) => {
  const { state, dispatch } = useCards();
  const { cards } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const filteredCards = useMemo(() => {
    return cards.filter(card =>
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cards, searchTerm]);

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
  
  const handleAddNew = () => {
    setEditingCard({
        id: crypto.randomUUID(),
        front: '',
        back: '',
        correct: 0,
        wrong: 0,
        createdAt: Date.now()
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
          <Icon name="add" className="w-5 h-5" />
          <span>Add New Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCards.map(card => (
          <CardComponent key={card.id} card={card} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>
      
      {filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p>No cards found for "{searchTerm}".</p>
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
