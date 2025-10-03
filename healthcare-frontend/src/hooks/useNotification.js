import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 5000);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification({ message: '', type: '' });
  }, []);

  return {
    notification,
    showNotification,
    clearNotification
  };
};
