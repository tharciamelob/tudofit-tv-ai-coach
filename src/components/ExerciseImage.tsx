import React, { useState, useEffect, useCallback } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMediaQueue } from '@/utils/mediaLoadQueue';

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
  onExpiredUrl?: () => void;
  /** Unique ID for queue management (defaults to src) */
  mediaId?: string;
  /** Loading priority for queue */
  priority?: 'high' | 'normal' | 'low';
  /** Use fetchpriority="high" for above-the-fold content */
  fetchPriorityHigh?: boolean;
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
  return src.includes('token=') || src.includes('sign');
};

// Timeout before showing retry button (ms)
const RETRY_TIMEOUT = 3000;

/**
 * Component that handles exercise images/videos with:
 * - Skeleton loading state with "Carregando..." label
 * - Concurrency-controlled loading via mediaLoadQueue
 * - Retry button after timeout
 * - Retry with cache-buster on error
 * - Auto-revalidation callback for expired signed URLs
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
  mediaId,
  priority = 'normal',
  fetchPriorityHigh = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [revalidationRequested, setRevalidationRequested] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  const maxRetries = 2;

  // Use queue to control concurrent downloads
  const queueId = mediaId || src || '';
  const { canLoad, markComplete } = useMediaQueue({
    id: queueId,
    priority,
    enabled: !!src && !hasError,
  });

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(src);
    setRevalidationRequested(false);
    setShowRetryButton(false);
    setLoadStartTime(null);
  }, [src]);

  // Track load start time and show retry button after timeout
  useEffect(() => {
    if (canLoad && isLoading && !hasError && src) {
      setLoadStartTime(Date.now());
      const timer = setTimeout(() => {
        if (isLoading && !hasError) {
          setShowRetryButton(true);
        }
      }, RETRY_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [canLoad, isLoading, hasError, src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setRevalidationRequested(false);
    setShowRetryButton(false);
    markComplete();
  }, [markComplete]);

  const handleError = useCallback(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      markComplete();
      return;
    }

    logMediaError(src, `Attempt ${retryCount + 1} failed`);

    // First failure on a signed URL - request revalidation
    if (retryCount === 0 && isLikelyExpiredUrl(src) && onExpiredUrl && !revalidationRequested) {
      logMediaError(src, 'Requesting URL revalidation (likely expired)');
      setRevalidationRequested(true);
      onExpiredUrl();
      return;
    }

    if (retryCount < maxRetries) {
      const cacheBuster = `cb=${Date.now()}`;
      const separator = currentSrc?.includes('?') ? '&' : '?';
      const newSrc = `${currentSrc}${separator}${cacheBuster}`;
      
      setRetryCount(prev => prev + 1);
      setCurrentSrc(newSrc);
      setIsLoading(true);
    } else {
      logMediaError(src, 'All retries exhausted');
      setIsLoading(false);
      setHasError(true);
      markComplete();
    }
  }, [src, currentSrc, retryCount, onExpiredUrl, revalidationRequested, markComplete]);

  const handleRetryClick = useCallback(() => {
    const cacheBuster = `cb=${Date.now()}`;
    const separator = currentSrc?.includes('?') ? '&' : '?';
    const newSrc = `${currentSrc}${separator}${cacheBuster}`;
    
    setRetryCount(0);
    setCurrentSrc(newSrc);
    setIsLoading(true);
    setHasError(false);
    setShowRetryButton(false);
    setLoadStartTime(Date.now());
  }, [currentSrc]);

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
        <span className="text-xs text-muted-foreground/60 mb-2">Mídia indisponível</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetryClick}
          className="text-xs h-7 px-2"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Waiting in queue - show skeleton
  if (!canLoad) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <Skeleton className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-muted-foreground/70 bg-background/50 px-2 py-1 rounded">
            Aguardando...
          </span>
        </div>
      </div>
    );
  }

  // Determine if we should use video or img
  const shouldUseVideo = forceVideo ?? (currentSrc ? isVideoUrl(currentSrc) && !isGifUrl(currentSrc) : false);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Skeleton while loading */}
      {isLoading && (
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground/70 bg-background/50 px-2 py-1 rounded mb-2">
              Carregando...
            </span>
            {showRetryButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetryClick}
                className="text-xs h-7 px-2"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar novamente
              </Button>
            )}
          </div>
        </div>
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
          // @ts-ignore - fetchpriority is valid but not in React types yet
          fetchpriority={fetchPriorityHigh ? 'high' : undefined}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};
