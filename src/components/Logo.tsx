import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  linkTo = '/',
}) => {
  const sizeClasses = {
    sm: 'text-lg tracking-tight',
    md: 'text-2xl tracking-tighter',
    lg: 'text-3xl tracking-tighter',
    xl: 'text-5xl tracking-tighter',
  };

  const content = (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-space font-bold ${sizeClasses[size]} transition-colors text-black dark:text-white select-none`}
        >
          2KAI
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
      </div>
      {showTagline && (
        <span className="text-[11px] font-inter uppercase tracking-widest text-light-muted dark:text-dark-muted font-medium mt-0.5">
          Your Intelligence. Without Limits.
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block focus:outline-none focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white rounded">
        {content}
      </Link>
    );
  }

  return content;
};

