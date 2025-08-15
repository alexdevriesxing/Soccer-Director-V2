import React, { useState, ReactElement } from 'react';
import { FaImage } from 'react-icons/fa';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  className?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallback,
  className = '',
  ...props
}): ReactElement => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    console.error(`Failed to load image: ${src}`);
  };

  if (hasError || !src) {
    return (
      fallback || (
        <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
          <FaImage className="text-gray-400 text-xl" />
        </div>
      )
    ) as ReactElement;
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default SafeImage;
