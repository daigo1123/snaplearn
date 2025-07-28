
import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import Icon from './Icon';

interface CardEditorModalProps {
  card: Card;
  onSave: (card: Card) => void;
  onClose: () => void;
}

const CardEditorModal: React.FC<CardEditorModalProps> = ({ card, onSave, onClose }) => {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  useEffect(() => {
    // Handle escape key to close modal
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onSave({ ...card, front, back });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Close editor">
            <Icon name="close" className="w-5 h-5"/>
        </button>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{card.createdAt === 0 ? 'Add New Card' : 'Edit Card'}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="front" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Front (Question)</label>
              <textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="back" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Back (Answer)</label>
              <textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50" disabled={!front.trim() || !back.trim()}>
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardEditorModal;
