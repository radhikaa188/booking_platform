import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700 ml-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'input-field',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
