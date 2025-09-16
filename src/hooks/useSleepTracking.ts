import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSleepTracking = () => {
  const [loading, setLoading] = useState(false);
  const [todaySleep, setTodaySleep] = useState<any>(null);
  const [sleepGoal, setSleepGoal] = useState(8); // Meta padrão de 8 horas
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setTodaySleep(data);

      // Buscar meta de sono do perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile && (profile as any).sleep_goal) {
        setSleepGoal((profile as any).sleep_goal);
      }
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
          sleep_quality: sleepData.quality
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

  const updateSleepGoal = async (newGoal: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sleep_goal: newGoal } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      setSleepGoal(newGoal);
      toast({
        title: "Meta atualizada!",
        description: `Nova meta de sono: ${newGoal} horas por noite.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSleepProgress = () => {
    if (!todaySleep?.sleep_duration) return 0;
    
    const match = todaySleep.sleep_duration.match(/(\d+)\s*hours?/);
    const hours = match ? parseInt(match[1]) : 0;
    
    return Math.min((hours / sleepGoal) * 100, 100);
  };

  return {
    todaySleep,
    sleepGoal,
    loading,
    addSleep,
    updateSleepGoal,
    progress: getSleepProgress()
  };
};