import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSleepTracking = () => {
  const [loading, setLoading] = useState(false);
  const [todaySleep, setTodaySleep] = useState<any>(null);
  const [sleepGoal, setSleepGoal] = useState(8); // Meta padrão de 8 horas
  const [weeklyData, setWeeklyData] = useState<Array<{day: string, date: string, hours: string, quality: number, progress: number, data: any}>>([]);
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
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      
      // Calcular os dias da semana atual (segunda a domingo)
      const today = new Date();
      const currentDay = today.getDay(); // 0 = domingo, 1 = segunda, etc.
      const mondayOffset = currentDay === 0 ? -6 : -(currentDay - 1); // Offset para segunda-feira
      
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + mondayOffset + i);
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
        
        // Handle time format (HH:MM:SS)
        const timeMatch = duration.match(/^(\d{2}):(\d{2}):(\d{2})$/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          return `${hours}h ${minutes}m`;
        }
        
        // Handle text format (X hours Y minutes)
        const textMatch = duration.match(/(\d+)\s*hours?\s*(\d+)\s*minutes?/);
        if (textMatch) {
          return `${textMatch[1]}h ${textMatch[2]}m`;
        }
        
        return duration;
      };

      const parseDurationToHours = (duration: string): number => {
        if (!duration) return 0;
        
        // Handle time format (HH:MM:SS)
        const timeMatch = duration.match(/^(\d{2}):(\d{2}):(\d{2})$/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          return hours + (minutes / 60);
        }
        
        // Handle text format (X hours Y minutes)
        const textMatch = duration.match(/(\d+)\s*hours?\s*(\d+)\s*minutes?/);
        if (textMatch) {
          const hours = parseInt(textMatch[1]);
          const minutes = parseInt(textMatch[2]);
          return hours + (minutes / 60);
        }
        
        return 0;
      };

      const weeklyData = dates.map((date, index) => {
        const dayData = data?.find(entry => entry.date === date);
        
        let progressPercent = 0;
        if (dayData?.sleep_duration) {
          // Calcular progresso baseado na duração vs meta
          const duration = dayData.sleep_duration;
          if (typeof duration === 'string') {
            const totalHours = parseDurationToHours(duration);
            progressPercent = Math.min((totalHours / sleepGoal) * 100, 100);
          }
        }

        return {
          day: days[index],
          date,
          hours: dayData ? formatSleepDuration(dayData.sleep_duration?.toString() || "") : "0h 0m",
          quality: dayData?.sleep_quality || 0,
          progress: Math.round(progressPercent),
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
    date?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Registrando sono:', sleepData); // Debug log

      const bedtime = new Date(sleepData.bedtime);
      const wakeTime = new Date(sleepData.wakeTime);
      
      // Calcular duração do sono com lógica inteligente
      let duration;
      if (bedtime.getTime() > wakeTime.getTime()) {
        // Se bedtime > wakeTime, significa que acordou no dia seguinte
        duration = wakeTime.getTime() - bedtime.getTime() + (24 * 60 * 60 * 1000);
      } else {
        // Caso normal: mesmo dia
        duration = wakeTime.getTime() - bedtime.getTime();
      }

      // Se a duração for negativa ou muito pequena, assumir que cruzou a meia-noite
      if (duration < 0 || duration < 2 * 60 * 60 * 1000) { // Menos de 2 horas
        duration = duration + (24 * 60 * 60 * 1000);
      }

      const { error } = await supabase
        .from('sleep_tracking')
        .insert({
          user_id: user.id,
          bedtime: bedtime.toISOString(),
          wake_time: wakeTime.toISOString(),
          sleep_quality: sleepData.quality,
          date: sleepData.date || new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.error('Erro ao inserir sono:', error); // Debug log
        throw error;
      }

      // Atualizar dados em tempo real
      await Promise.all([fetchTodaySleep(), fetchWeeklyData()]);
      
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

  const parseDurationToHours = (duration: string): number => {
    if (!duration) return 0;
    
    // Handle time format (HH:MM:SS)
    const timeMatch = duration.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return hours + (minutes / 60);
    }
    
    // Handle text format (X hours Y minutes)
    const textMatch = duration.match(/(\d+)\s*hours?\s*(\d+)\s*minutes?/);
    if (textMatch) {
      const hours = parseInt(textMatch[1]);
      const minutes = parseInt(textMatch[2]);
      return hours + (minutes / 60);
    }
    
    return 0;
  };

  const getSleepProgress = () => {
    if (!todaySleep?.sleep_duration) return 0;
    
    // Converter duration para horas decimais
    const duration = todaySleep.sleep_duration;
    if (typeof duration === 'string') {
      const totalHours = parseDurationToHours(duration);
      return Math.min((totalHours / sleepGoal) * 100, 100);
    }
    
    // Se for um objeto interval do PostgreSQL
    if (duration && typeof duration === 'object') {
      const milliseconds = duration.milliseconds || 0;
      const totalHours = milliseconds / (1000 * 60 * 60);
      return Math.min((totalHours / sleepGoal) * 100, 100);
    }
    
    return 0;
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
    if (!user) return;
    
    fetchTodaySleep();
    fetchWeeklyData();

    // Set up real-time listener for sleep tracking
    const channel = supabase
      .channel('sleep-tracking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleep_tracking',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Sleep tracking real-time update:', payload);
          // Refresh data when changes occur
          fetchTodaySleep();
          fetchWeeklyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Format sleep duration helper function
  const formatSleepDuration = (duration: string) => {
    if (!duration) return "0h 0m";
    
    // Handle time format (HH:MM:SS)
    const timeMatch = duration.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return `${hours}h ${minutes}m`;
    }
    
    // Handle text format (X hours Y minutes)
    const textMatch = duration.match(/(\d+)\s*hours?\s*(\d+)\s*minutes?/);
    if (textMatch) {
      return `${textMatch[1]}h ${textMatch[2]}m`;
    }
    
    return duration;
  };

  return {
    todaySleep,
    sleepGoal,
    weeklyData,
    loading,
    addSleep,
    updateSleepGoal,
    deleteSleepEntry,
    deleteSleepByDate,
    formatSleepDuration,
    progress: getSleepProgress()
  };
};