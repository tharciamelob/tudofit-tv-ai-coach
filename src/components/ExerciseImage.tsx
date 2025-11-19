import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface ExerciseImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  isVideo?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

/**
 * Component that handles exercise images/videos with fallback for broken URLs
 */
export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  isVideo = false,
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
}) => {
  const [hasError, setHasError] = useState(false);

  // Show placeholder if no src or error occurred
  if (!src || hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ${className}`}>
        <Play className="w-12 h-12 text-muted-foreground/60" />
      </div>
    );
  }

  const handleError = () => {
    setHasError(true);
  };

  if (isVideo) {
    return (
      <video
        src={src}
        className={className}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        onError={handleError}
      >
        Seu navegador não suporta reprodução de vídeo.
      </video>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
};
