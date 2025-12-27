import React, { useState, useEffect, useCallback } from 'react';
import { Play, ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

// Helper to detect if URL is a video format
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Helper to detect if URL is a GIF
const isGifUrl = (url: string): boolean => {
  return url.toLowerCase().includes('.gif');
};

// Development-only logger
const logMediaError = (src: string, error: string) => {
  if (import.meta.env.DEV) {
    console.warn(`[ExerciseImage] Failed to load: ${src}`, error);
  }
};

/**
 * Component that handles exercise images/videos with:
 * - Skeleton loading state
 * - Retry with cache-buster on error
 * - Informative placeholder on final failure
 * - Auto-detection of GIF vs video
 */
export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  isVideo: forceVideo,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  const maxRetries = 1;

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    logMediaError(src, `Attempt ${retryCount + 1} failed`);

    if (retryCount < maxRetries) {
      // Retry with cache-buster
      const cacheBuster = `cb=${Date.now()}`;
      const separator = src.includes('?') ? '&' : '?';
      const newSrc = `${src}${separator}${cacheBuster}`;
      
      setRetryCount(prev => prev + 1);
      setCurrentSrc(newSrc);
      setIsLoading(true);
    } else {
      // Final failure
      logMediaError(src, 'All retries exhausted');
      setIsLoading(false);
      setHasError(true);
    }
  }, [src, retryCount]);

  // No source provided - show placeholder immediately
  if (!src) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center ${className}`}>
        <ImageOff className="w-10 h-10 text-muted-foreground/40 mb-2" />
        <span className="text-xs text-muted-foreground/60">Sem mídia</span>
      </div>
    );
  }

  // Final error state - show informative placeholder
  if (hasError && !isLoading) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center ${className}`}>
        <ImageOff className="w-10 h-10 text-muted-foreground/40 mb-2" />
        <span className="text-xs text-muted-foreground/60">Mídia indisponível</span>
      </div>
    );
  }

  // Determine if we should use video or img
  // Priority: forceVideo prop > detect video extension > detect gif > default to img
  const shouldUseVideo = forceVideo ?? (currentSrc ? isVideoUrl(currentSrc) && !isGifUrl(currentSrc) : false);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Skeleton while loading */}
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {shouldUseVideo ? (
        <video
          src={currentSrc || undefined}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          onLoadedData={handleLoad}
          onError={handleError}
        >
          Seu navegador não suporta reprodução de vídeo.
        </video>
      ) : (
        <img
          src={currentSrc || undefined}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};
