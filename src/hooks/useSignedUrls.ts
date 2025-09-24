import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

const cache: SignedUrlCache = {};

export const useSignedUrl = (bucket: string, path: string | null, ttl = 3600) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const getSignedUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No active session');
        }

        // Call our edge function instead of direct storage
        const { data, error } = await supabase.functions.invoke('get-signed-url', {
          body: {
            bucket,
            path,
            expiresIn: ttl
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        if (data?.signedUrl) {
          // Cache the URL with 90% of TTL to ensure refresh before expiry
          cache[cacheKey] = {
            url: data.signedUrl,
            expiresAt: now + (ttl * 1000 * 0.9)
          };
          setUrl(data.signedUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get signed URL');
        setUrl(null);
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [bucket, path, ttl]);

  return { url, loading, error };
};

export const useSignedUrls = (items: Array<{ bucket: string; path: string | null }>, ttl = 3600) => {
  const [urls, setUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      try {
        await Promise.all(
          items.map(async (item, index) => {
            if (!item.path) return;

            const cacheKey = `${item.bucket}/${item.path}`;
            
            // Check cache first
            if (cache[cacheKey] && cache[cacheKey].expiresAt > now) {
              newUrls[index] = cache[cacheKey].url;
              return;
            }

            // Get current session for authentication
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.access_token) {
              throw new Error('No active session');
            }

            // Call our edge function instead of direct storage
            const { data, error } = await supabase.functions.invoke('get-signed-url', {
              body: {
                bucket: item.bucket,
                path: item.path,
                expiresIn: ttl
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (error) throw error;

            if (data?.signedUrl) {
              cache[cacheKey] = {
                url: data.signedUrl,
                expiresAt: now + (ttl * 1000 * 0.9)
              };
              newUrls[index] = data.signedUrl;
            }
          })
        );

        setUrls(newUrls);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get signed URLs');
      } finally {
        setLoading(false);
      }
    };

    getSignedUrls();
  }, [items, ttl]);

  return { urls, loading, error };
};