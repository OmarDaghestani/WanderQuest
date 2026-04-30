import { useState } from 'react';

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  placeholderText,
  loading = "lazy",
  decoding = "async",
  ...props
}) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const handleError = () => {
    if (!error) {
      // First error - try fallback
      setError(true);
    } else {
      // Fallback also failed
      setFallbackError(true);
    }
  };

  if (fallbackError || (!src && !fallbackSrc)) {
    // Both sources failed or no sources provided
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm font-medium text-center p-2">
          {placeholderText || alt || 'Image unavailable'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt || placeholderText || "Image"}
      className={className}
      onError={handleError}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
} 