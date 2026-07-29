import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3 my-4">
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-800">Something went wrong</h4>
        <p className="text-sm text-rose-600 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
