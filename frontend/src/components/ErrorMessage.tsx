import React from 'react';

interface ErrorMessageProps {
  message: string;
  details?: string | React.ReactNode;
  children?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, details, children }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center my-4" role="alert">
    <span className="block sm:inline font-semibold">{message}</span>
    {details && process.env.NODE_ENV === 'development' && (
      <pre className="mt-2 text-xs text-left whitespace-pre-wrap text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto">{details}</pre>
    )}
    {children && <div className="mt-2">{children}</div>}
  </div>
);

export default ErrorMessage; 