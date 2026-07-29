import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-primary-600 ${sizeClasses[size] || sizeClasses.md}`}
      ></div>
      {message && <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
