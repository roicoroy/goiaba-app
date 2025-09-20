import { useState } from 'react';

interface ToastState {
  isOpen: boolean;
  message: string;
  color: 'success' | 'warning' | 'danger' | 'primary';
  duration: number;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    color: 'primary',
    duration: 2000,
  });

  const showToast = (
    message: string,
    color: ToastState['color'] = 'primary',
    duration: number = 2000
  ) => {
    setToast({
      isOpen: true,
      message,
      color,
      duration,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (message: string) => showToast(message, 'success');
  const showError = (message: string) => showToast(message, 'danger', 3000);
  const showWarning = (message: string) => showToast(message, 'warning');

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
  };
};