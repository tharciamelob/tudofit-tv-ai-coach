import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSleepTracking = () => {
  const [loading, setLoading] = useState(false);
  const [todaySleep, setTodaySleep] = useState<any>(null);
  const [sleepGoal, setSleepGoal] = useState(8); // Meta padrão de 8 horas
  const [weeklyData, setWeeklyData] = useState<Array<{day: string, date: string, hours: string, quality: number, data: any}>>([]);
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

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const { data, error } = await supabase
        .from('sleep_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dates[0])
        .lte('date', dates[6])
        .order('date');

      if (error) throw error;

      const formatSleepDuration = (duration: string) => {
        if (!duration) return "0h 0m";
        const match = duration.match(/(\d+)\s*hours?\s*(\d+)\s*minutes?/);
        if (match) {
          return `${match[1]}h ${match[2]}m`;
        }
        return duration;
      };

      const weeklyData = dates.map((date, index) => {
        const dayData = data?.find(entry => entry.date === date);

        return {
          day: days[index],
          date,
          hours: dayData ? formatSleepDuration(dayData.sleep_duration?.toString() || "") : "0h 0m",
          quality: dayData?.sleep_quality || 0,
          data: dayData
        };
      });

      setWeeklyData(weeklyData);
    } catch (error: any) {
      console.error('Erro ao buscar dados semanais de sono:', error);
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
      console.log('Registrando sono:', sleepData); // Debug log

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

      if (error) {
        console.error('Erro ao inserir sono:', error); // Debug log
        throw error;
      }

      await fetchTodaySleep();
      await fetchWeeklyData();
      toast({
        title: "Sono registrado!",
        description: "Seus dados de sono foram salvos com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro completo:', error); // Debug log
      toast({
        title: "Erro ao registrar sono",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const deleteSleepEntry = async () => {
    if (!user || !todaySleep) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sleep_tracking')
        .delete()
        .eq('id', todaySleep.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTodaySleep();
      await fetchWeeklyData();
      toast({
        title: "Registro excluído!",
        description: "Registro de sono removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSleepByDate = async (date: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sleep_tracking')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (error) throw error;

      await fetchTodaySleep();
      await fetchWeeklyData();
      toast({
        title: "Registro excluído!",
        description: "Registro de sono removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySleep();
    fetchWeeklyData();
  }, [user]);

  return {
    todaySleep,
    sleepGoal,
    weeklyData,
    loading,
    addSleep,
    updateSleepGoal,
    deleteSleepEntry,
    deleteSleepByDate,
    progress: getSleepProgress()
  };
};