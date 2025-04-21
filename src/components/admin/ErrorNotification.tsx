import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface ErrorNotificationProps {
  error: string | null;
  onDismiss?: () => void;
}

export default function ErrorNotification({ error, onDismiss }: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (error) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [error]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-4 left-0 right-0 mx-auto max-w-3xl z-50 transform transition-all duration-300 ease-in-out">
      <div className="bg-red-50 border border-red-300 rounded-lg shadow-lg px-4 py-3">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
            <div className="mt-1 text-sm text-red-700">
              {error}
            </div>
          </div>
          {onDismiss && (
            <button 
              className="ml-auto flex-shrink-0 -mt-1 -mr-1 p-1 text-red-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300);
              }}
              aria-label="Закрыть"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 