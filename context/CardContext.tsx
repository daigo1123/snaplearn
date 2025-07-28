
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { Card } from '../types';
import { storageService } from '../services/storageService';

interface CardState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
}

type CardAction =
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'INCREMENT_CORRECT'; payload: string }
  | { type: 'INCREMENT_WRONG'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: CardState = {
  cards: [],
  isLoading: true,
  error: null,
};

const cardReducer = (state: CardState, action: CardAction): CardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CARDS':
      return { ...state, cards: action.payload, isLoading: false };
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] };
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.payload),
      };
    case 'INCREMENT_CORRECT':
      return {
        ...state,
        cards: state.cards.map(c => c.id === action.payload ? {...c, correct: c.correct + 1} : c)
      };
    case 'INCREMENT_WRONG':
        return {
          ...state,
          cards: state.cards.map(c => c.id === action.payload ? {...c, wrong: c.wrong + 1} : c)
        };
    default:
      return state;
  }
};

const CardContext = createContext<{ state: CardState; dispatch: React.Dispatch<CardAction> } | undefined>(undefined);

export const CardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cardReducer, initialState);

  useEffect(() => {
    // Persist state to localStorage whenever cards change
    if(!state.isLoading) {
        storageService.save(state.cards).catch(err => {
            console.error("Failed to save cards:", err);
            // Optionally dispatch an error to the context
        });
    }
  }, [state.cards, state.isLoading]);

  return (
    <CardContext.Provider value={{ state, dispatch }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};
