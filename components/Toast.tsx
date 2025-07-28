
import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import Icon from './Icon';

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: <Icon name="correct" className="w-5 h-5 text-green-500" />,
    style: 'bg-green-50 dark:bg-green-900/50 border-green-400 dark:border-green-600',
  },
  error: {
    icon: <Icon name="wrong" className="w-5 h-5 text-red-500" />,
    style: 'bg-red-50 dark:bg-red-900/50 border-red-400 dark:border-red-600',
  },
  info: {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    style: 'bg-blue-50 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600',
  },
};

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(message.id), 500); // Wait for animation
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [message.id, onDismiss]);

  const config = toastConfig[message.type];

  return (
    <div
      className={`relative flex items-start gap-3 w-full p-4 rounded-lg shadow-lg border-l-4 ${config.style} ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
        {message.message}
      </div>
      <button onClick={() => onDismiss(message.id)} className="p-1 rounded-full hover:bg-gray-500/10" aria-label="Dismiss">
        <Icon name="close" className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default Toast;
