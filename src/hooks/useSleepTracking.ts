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
    if (!user) return;

    setLoading(true);
    try {
      const bedtime = new Date(sleepData.bedtime);
      const wakeTime = new Date(sleepData.wakeTime);
      
      // Calcular duração do sono
      let duration = wakeTime.getTime() - bedtime.getTime();
      if (duration < 0) {
        // Se acordou no dia seguinte
        duration += 24 * 60 * 60 * 1000;
      }

      const { error } = await supabase
        .from('sleep_tracking')
        .insert({
          user_id: user.id,
          bedtime: bedtime.toISOString(),
          wake_time: wakeTime.toISOString(),
          sleep_quality: sleepData.quality,
          sleep_duration: `${Math.floor(duration / (1000 * 60 * 60))} hours ${Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))} minutes`
        });

      if (error) throw error;

      await fetchTodaySleep();
      toast({
        title: "Sono registrado!",
        description: "Seus dados de sono foram salvos com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao registrar sono",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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