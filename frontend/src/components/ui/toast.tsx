'use client';

import { X } from 'lucide-react';
import { useToast } from './use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md',
            'flex items-start gap-3',
            'border border-gray-200 dark:border-gray-700',
            toast.type === 'destructive' && 'border-red-500 dark:border-red-500'
          )}
        >
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {toast.title}
            </h3>
            {toast.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 