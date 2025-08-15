import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[120px]" role="status" aria-live="polite">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    <span className="sr-only">Loading...</span>
  </div>
);

export default LoadingSpinner;