import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, ...props }) => {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-100', className)} {...props}>
      {children}
    </div>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-6 py-4 bg-slate-50 border-t border-slate-100', className)} {...props}>
      {children}
    </div>
  );
};
