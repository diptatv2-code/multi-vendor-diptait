'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let globalToasts: Toast[] = [];
let globalSetToasts: ((toasts: Toast[]) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  globalSetToasts = setToasts;

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    const newToast = { ...toast, id };
    globalToasts = [...globalToasts, newToast];
    setToasts([...globalToasts]);

    setTimeout(() => {
      globalToasts = globalToasts.filter((t) => t.id !== id);
      if (globalSetToasts) globalSetToasts([...globalToasts]);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    setToasts([...globalToasts]);
  }, []);

  return { toasts, addToast, removeToast };
}

export function toast(options: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2);
  const newToast = { ...options, id };
  globalToasts = [...globalToasts, newToast];
  if (globalSetToasts) globalSetToasts([...globalToasts]);

  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    if (globalSetToasts) globalSetToasts([...globalToasts]);
  }, 5000);
}
