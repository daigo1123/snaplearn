
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { Card, Folder } from '../types';
import { storageService } from '../services/storageService';

interface CardState {
  cards: Card[];
  folders: Folder[];
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
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'MOVE_TO_FOLDER'; payload: { cardId: string; folderId?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: CardState = {
  cards: [],
  folders: [],
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
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        cards: state.cards.map(c => c.id === action.payload ? {...c, isFavorite: !c.isFavorite} : c)
      };
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.payload] };
    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map(f => f.id === action.payload.id ? action.payload : f)
      };
    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(f => f.id !== action.payload),
        cards: state.cards.map(c => c.folderId === action.payload ? {...c, folderId: undefined} : c)
      };
    case 'MOVE_TO_FOLDER':
      return {
        ...state,
        cards: state.cards.map(c => c.id === action.payload.cardId ? {...c, folderId: action.payload.folderId} : c)
      };
    default:
      return state;
  }
};

const CardContext = createContext<{ state: CardState; dispatch: React.Dispatch<CardAction> } | undefined>(undefined);

export const CardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cardReducer, initialState);

  useEffect(() => {
    // Persist state to localStorage whenever cards or folders change
    if(!state.isLoading) {
        storageService.save(state.cards).catch(err => {
            console.error("Failed to save cards:", err);
        });
        storageService.saveFolders(state.folders).catch(err => {
            console.error("Failed to save folders:", err);
        });
    }
  }, [state.cards, state.folders, state.isLoading]);

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
