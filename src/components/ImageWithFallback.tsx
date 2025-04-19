import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '/images/image-placeholder.jpg',
  ...rest
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const renderFallback = () => {
    // Если есть fallbackSrc, используем его
    if (fallbackSrc) {
      return (
        <Image 
          src={fallbackSrc} 
          alt={alt || 'Изображение недоступно'} 
          {...rest}
          onLoadingComplete={() => setLoaded(true)}
        />
      );
    }
    
    // Иначе показываем стандартный плейсхолдер
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{alt || 'Изображение недоступно'}</p>
        </div>
      </div>
    );
  };

  if (error) {
    return renderFallback();
  }

  return (
    <>
      <Image
        src={src}
        alt={alt || ''}
        {...rest}
        onError={() => setError(true)}
        onLoadingComplete={() => setLoaded(true)}
      />
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <PhotoIcon className="h-12 w-12 text-gray-300" />
        </div>
      )}
    </>
  );
};

export default ImageWithFallback; 