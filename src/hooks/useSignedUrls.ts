import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

const cache: SignedUrlCache = {};

// Helper to force invalidate cache for a specific key
export const invalidateSignedUrlCache = (bucket: string, path: string) => {
  const cacheKey = `${bucket}/${path}`;
  delete cache[cacheKey];
};

// Core fetch function (reusable)
const fetchSignedUrl = async (bucket: string, path: string, ttl: number): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No active session');
  }

  const { data, error } = await supabase.functions.invoke('get-signed-url', {
    body: { bucket, path, expiresIn: ttl },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) throw error;
  if (!data?.signedUrl) throw new Error('No signed URL returned');

  // Update cache
  const cacheKey = `${bucket}/${path}`;
  cache[cacheKey] = {
    url: data.signedUrl,
    expiresAt: Date.now() + (ttl * 1000 * 0.9)
  };

  return data.signedUrl;
};

export const useSignedUrl = (bucket: string, path: string | null, ttl = 3600) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Revalidate function - call this when media fails to load
  const revalidate = useCallback(() => {
    if (path) {
      invalidateSignedUrlCache(bucket, path);
      setRefreshCount(c => c + 1);
    }
  }, [bucket, path]);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    const cacheKey = `${bucket}/${path}`;
    const now = Date.now();

    // Check cache first
    if (cache[cacheKey] && cache[cacheKey].expiresAt > now) {
      setUrl(cache[cacheKey].url);
      return;
    }

    const getUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        const signedUrl = await fetchSignedUrl(bucket, path, ttl);
        setUrl(signedUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get signed URL');
        setUrl(null);
      } finally {
        setLoading(false);
      }
    };

    getUrl();
  }, [bucket, path, ttl, refreshCount]);

  return { url, loading, error, revalidate };
};

// Batch fetch function - single request for multiple URLs
const fetchSignedUrlsBatch = async (
  items: Array<{ bucket: string; path: string; expiresIn?: number }>
): Promise<Array<{ index: number; signedUrl: string | null; error?: string }>> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No active session');
  }

  const { data, error } = await supabase.functions.invoke('get-signed-url', {
    body: { items },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) throw error;
  return data?.results || [];
};

export const useSignedUrls = (items: Array<{ bucket: string; path: string | null }>, ttl = 3600) => {
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revalidate a specific index (still uses single fetch for simplicity)
  const revalidateIndex = useCallback(async (index: number) => {
    const item = items[index];
    if (!item?.path) return;

    try {
      invalidateSignedUrlCache(item.bucket, item.path);
      const newUrl = await fetchSignedUrl(item.bucket, item.path, ttl);
      setUrls(prev => ({ ...prev, [index]: newUrl }));
    } catch (err) {
      console.warn(`[useSignedUrls] Failed to revalidate index ${index}:`, err);
    }
  }, [items, ttl]);

  useEffect(() => {
    if (!items.length) {
      setUrls({});
      return;
    }

    const getSignedUrls = async () => {
      setLoading(true);
      setError(null);
      const newUrls: { [key: string]: string } = {};
      const now = Date.now();

      // Separate cached vs uncached items
      const uncachedItems: Array<{ index: number; bucket: string; path: string }> = [];
      
      items.forEach((item, index) => {
        if (!item.path) return;
        
        const cacheKey = `${item.bucket}/${item.path}`;
        if (cache[cacheKey] && cache[cacheKey].expiresAt > now) {
          newUrls[index] = cache[cacheKey].url;
        } else {
          uncachedItems.push({ index, bucket: item.bucket, path: item.path });
        }
      });

      // If all cached, we're done
      if (uncachedItems.length === 0) {
        setUrls(newUrls);
        setLoading(false);
        return;
      }

      try {
        // Batch fetch uncached items in a single request
        const batchItems = uncachedItems.map(item => ({
          bucket: item.bucket,
          path: item.path,
          expiresIn: ttl
        }));

        console.log(`[useSignedUrls] Batch fetching ${batchItems.length} URLs`);
        const results = await fetchSignedUrlsBatch(batchItems);

        // Map results back to original indices
        results.forEach((result, resultIndex) => {
          const originalItem = uncachedItems[resultIndex];
          if (result.signedUrl) {
            const cacheKey = `${originalItem.bucket}/${originalItem.path}`;
            cache[cacheKey] = {
              url: result.signedUrl,
              expiresAt: now + (ttl * 1000 * 0.9)
            };
            newUrls[originalItem.index] = result.signedUrl;
          }
        });

        setUrls(newUrls);
      } catch (err) {
        console.error('[useSignedUrls] Batch fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to get signed URLs');
      } finally {
        setLoading(false);
      }
    };

    getSignedUrls();
  }, [items, ttl]);

  return { urls, loading, error, revalidateIndex };
};