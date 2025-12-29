import React, { useState, useEffect, useCallback } from 'react';
import { ImageOff } from 'lucide-react';
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
  onExpiredUrl?: () => void; // Callback when URL appears expired (401/403)
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

// Check if error likely indicates expired signed URL
const isLikelyExpiredUrl = (src: string): boolean => {
  // Signed URLs from Supabase contain token parameter
  return src.includes('token=') || src.includes('sign');
};

/**
 * Component that handles exercise images/videos with:
 * - Skeleton loading state
 * - Retry with cache-buster on error
 * - Auto-revalidation callback for expired signed URLs
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
  onExpiredUrl,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [revalidationRequested, setRevalidationRequested] = useState(false);

  const maxRetries = 2; // Increased to allow for revalidation attempt

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(src);
    setRevalidationRequested(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setRevalidationRequested(false);
  }, []);

  const handleError = useCallback(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    logMediaError(src, `Attempt ${retryCount + 1} failed`);

    // First failure on a signed URL - request revalidation
    if (retryCount === 0 && isLikelyExpiredUrl(src) && onExpiredUrl && !revalidationRequested) {
      logMediaError(src, 'Requesting URL revalidation (likely expired)');
      setRevalidationRequested(true);
      onExpiredUrl();
      // Don't increment retry yet - wait for new URL from parent
      return;
    }

    if (retryCount < maxRetries) {
      // Retry with cache-buster
      const cacheBuster = `cb=${Date.now()}`;
      const separator = currentSrc?.includes('?') ? '&' : '?';
      const newSrc = `${currentSrc}${separator}${cacheBuster}`;
      
      setRetryCount(prev => prev + 1);
      setCurrentSrc(newSrc);
      setIsLoading(true);
    } else {
      // Final failure
      logMediaError(src, 'All retries exhausted');
      setIsLoading(false);
      setHasError(true);
    }
  }, [src, currentSrc, retryCount, onExpiredUrl, revalidationRequested]);

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
