import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/auth', { replace: true });
      }
    };

    checkAuth();
  }, [user, loading, navigate]);

  return { user, loading };
};