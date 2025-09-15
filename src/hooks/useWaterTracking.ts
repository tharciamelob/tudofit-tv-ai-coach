import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useWaterTracking = () => {
  const [loading, setLoading] = useState(false);
  const [todayWater, setTodayWater] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
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

  const addWater = async (amount: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('water_tracking')
        .insert({
          user_id: user.id,
          amount_ml: amount,
          daily_goal_ml: dailyGoal
        });

      if (error) throw error;

      setTodayWater(prev => prev + amount);
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

  useEffect(() => {
    fetchTodayWater();
  }, [user]);

  return {
    todayWater,
    dailyGoal,
    loading,
    addWater,
    updateDailyGoal,
    progress: Math.min((todayWater / dailyGoal) * 100, 100)
  };
};