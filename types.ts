
export interface Card {
  id: string;
  front: string;
  back: string;
  correct: number;
  wrong: number;
  createdAt: number;
  isFavorite: boolean;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export type View = 'upload' | 'list' | 'study';

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};
