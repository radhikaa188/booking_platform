import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-200 shadow-sm',
    outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'btn',
        variants[variant],
        sizes[size],
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
