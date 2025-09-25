import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        {/* Outer ring */}
        <div className={`animate-spin ${sizeClasses[size]}`}>
          <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>

        {/* Inner pulse */}
        <div className={`absolute inset-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse opacity-20`}></div>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
        </div>
      </div>

      {text && (
        <div className="mt-8 text-center">
          <p className={`font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            {text}
          </p>
          <div className="mt-2 flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
};