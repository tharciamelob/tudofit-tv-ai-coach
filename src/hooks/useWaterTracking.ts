import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useWaterTracking = () => {
  const [loading, setLoading] = useState(false);
  const [todayWater, setTodayWater] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [weeklyData, setWeeklyData] = useState<Array<{day: string, date: string, progress: number, total: number, entries: any[]}>>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTodayWater = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('water_tracking')
        .select('amount_ml, daily_goal_ml')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;

      const totalWater = data?.reduce((sum, entry) => sum + entry.amount_ml, 0) || 0;
      const goal = data?.[0]?.daily_goal_ml || 2000;
      
      setTodayWater(totalWater);
      setDailyGoal(goal);
    } catch (error: any) {
      console.error('Erro ao buscar dados de hidratação:', error);
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
        .from('water_tracking')
        .select('id, date, amount_ml, daily_goal_ml')
        .eq('user_id', user.id)
        .gte('date', dates[0])
        .lte('date', dates[6])
        .order('date');

      if (error) throw error;

      const weeklyData = dates.map((date, index) => {
        const dayEntries = data?.filter(entry => entry.date === date) || [];
        const total = dayEntries.reduce((sum, entry) => sum + entry.amount_ml, 0);
        const goal = dayEntries[0]?.daily_goal_ml || 2000;
        const progress = Math.min((total / goal) * 100, 100);

        return {
          day: days[index],
          date,
          progress: Math.round(progress),
          total,
          entries: dayEntries
        };
      });

      setWeeklyData(weeklyData);
    } catch (error: any) {
      console.error('Erro ao buscar dados semanais de hidratação:', error);
    }
  };

  const addWater = async (amount: number, date?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('water_tracking')
        .insert({
          user_id: user.id,
          amount_ml: amount,
          daily_goal_ml: dailyGoal,
          date: date || new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      await fetchTodayWater();
      await fetchWeeklyData();
      toast({
        title: "Água registrada!",
        description: `${amount}ml adicionados ao seu consumo diário.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao registrar água",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDailyGoal = async (newGoal: number) => {
    if (!user) return;

    setLoading(true);
    try {
      // Update goal in database by inserting a new record with current date and 0 amount
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('water_tracking')
        .insert({
          user_id: user.id,
          amount_ml: 0,
          daily_goal_ml: newGoal,
          date: today
        });

      if (error) throw error;

      setDailyGoal(newGoal);
      toast({
        title: "Meta atualizada!",
        description: `Sua nova meta diária é ${newGoal}ml.`,
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

  const deleteWaterEntry = async (entryId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('water_tracking')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTodayWater();
      await fetchWeeklyData();
      toast({
        title: "Registro excluído!",
        description: "Registro de água removido com sucesso.",
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

  const deleteAllWaterForDate = async (date: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('water_tracking')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (error) throw error;

      await fetchTodayWater();
      await fetchWeeklyData();
      toast({
        title: "Registros excluídos!",
        description: "Todos os registros de água do dia foram removidos.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir registros",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayWater();
    fetchWeeklyData();
  }, [user]);

  return {
    todayWater,
    dailyGoal,
    weeklyData,
    loading,
    addWater,
    updateDailyGoal,
    deleteWaterEntry,
    deleteAllWaterForDate,
    progress: Math.min((todayWater / dailyGoal) * 100, 100)
  };
};