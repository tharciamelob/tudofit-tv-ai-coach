import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSleepTracking = () => {
  const [loading, setLoading] = useState(false);
  const [todaySleep, setTodaySleep] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTodaySleep = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('sleep_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setTodaySleep(data);
    } catch (error: any) {
      console.error('Erro ao buscar dados de sono:', error);
    }
  };

  const addSleep = async (sleepData: {
    bedtime: string;
    wakeTime: string;
    quality: number;
  }) => {
    // Funcionalidade desabilitada - inserção manual no Supabase
    toast({
      title: "Inserção manual habilitada",
      description: "Insira os dados diretamente na tabela sleep_tracking do Supabase.",
    });
  };

  useEffect(() => {
    fetchTodaySleep();
  }, [user]);

  return {
    todaySleep,
    loading,
    addSleep
  };
};