import { useState } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (toast: Toast) => {
    // Simple console-based toast for now
    console.log(`[${toast.variant || 'default'}] ${toast.title}${toast.description ? ': ' + toast.description : ''}`);
    
    // You can enhance this with a proper toast UI library later
    if (toast.variant === 'destructive') {
      alert(`Error: ${toast.title}\n${toast.description || ''}`);
    } else {
      alert(`${toast.title}\n${toast.description || ''}`);
    }
    
    setToasts([...toasts, toast]);
  };

  return { toast, toasts };
}
