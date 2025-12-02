import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserSummary {
  activeDays: number;
  lastWeight: number | null;
  mainGoal: string | null;
  waterGoalDays: number;
  overallCompletionRate: number;
}

const FITNESS_GOAL_LABELS: Record<string, string> = {
  'emagrecer': 'Emagrecer',
  'perder_peso': 'Perder peso',
  'ganhar_massa': 'Ganhar massa',
  'manter_peso': 'Manter peso',
  'definir': 'Definir',
  'melhorar_condicionamento': 'Melhorar condicionamento',
};

export const useUserSummary = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<UserSummary>({
    activeDays: 0,
    lastWeight: null,
    mainGoal: null,
    waterGoalDays: 0,
    overallCompletionRate: 0,
  });

  // Get current month boundaries
  const { startOfMonth, endOfMonth, daysInMonth } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startOfMonth: start.toISOString().split('T')[0],
      endOfMonth: end.toISOString().split('T')[0],
      daysInMonth: end.getDate(),
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [
          profileResult,
          waterResult,
          sleepResult,
          walkResult,
        ] = await Promise.all([
          // Profile data (for weight and goal)
          supabase
            .from('profiles')
            .select('weight, fitness_goal')
            .eq('user_id', user.id)
            .maybeSingle(),
          
          // Water tracking for current month
          supabase
            .from('water_tracking')
            .select('date, amount_ml, daily_goal_ml')
            .eq('user_id', user.id)
            .gte('date', startOfMonth)
            .lte('date', endOfMonth),
          
          // Sleep tracking for current month
          supabase
            .from('sleep_tracking')
            .select('date')
            .eq('user_id', user.id)
            .gte('date', startOfMonth)
            .lte('date', endOfMonth),
          
          // Walking sessions for current month
          supabase
            .from('walk_sessions')
            .select('start_time')
            .eq('user_id', user.id)
            .eq('is_completed', true)
            .gte('start_time', startOfMonth)
            .lte('start_time', `${endOfMonth}T23:59:59`),
        ]);

        // Extract profile data
        const lastWeight = profileResult.data?.weight ?? null;
        const mainGoal = profileResult.data?.fitness_goal ?? null;

        // Calculate unique active days from all sources
        const activeDaysSet = new Set<string>();

        // Add water tracking days
        waterResult.data?.forEach(entry => {
          if (entry.date) activeDaysSet.add(entry.date);
        });

        // Add sleep tracking days
        sleepResult.data?.forEach(entry => {
          if (entry.date) activeDaysSet.add(entry.date);
        });

        // Add walking session days
        walkResult.data?.forEach(entry => {
          if (entry.start_time) {
            const date = entry.start_time.split('T')[0];
            activeDaysSet.add(date);
          }
        });

        const activeDays = activeDaysSet.size;

        // Calculate water goal days (days where total >= daily_goal)
        const waterByDate = new Map<string, { total: number; goal: number }>();
        waterResult.data?.forEach(entry => {
          if (!entry.date) return;
          const existing = waterByDate.get(entry.date) || { total: 0, goal: entry.daily_goal_ml || 2000 };
          existing.total += entry.amount_ml || 0;
          existing.goal = entry.daily_goal_ml || existing.goal;
          waterByDate.set(entry.date, existing);
        });

        let waterGoalDays = 0;
        waterByDate.forEach(({ total, goal }) => {
          if (total >= goal) waterGoalDays++;
        });

        // Calculate overall completion rate
        // We'll use a simple average of:
        // - Water: % of days with goal met
        // - Sleep: % of days with sleep logged
        // - Walking: % of days with at least one walk
        const daysSoFar = Math.min(new Date().getDate(), daysInMonth);
        
        const waterCompletionRate = daysSoFar > 0 ? (waterGoalDays / daysSoFar) * 100 : 0;
        const sleepCompletionRate = daysSoFar > 0 ? ((sleepResult.data?.length || 0) / daysSoFar) * 100 : 0;
        
        const walkDays = new Set(walkResult.data?.map(w => w.start_time?.split('T')[0])).size;
        const walkCompletionRate = daysSoFar > 0 ? (walkDays / daysSoFar) * 100 : 0;

        // Average of completion rates (only count metrics that have data)
        const rates = [waterCompletionRate, sleepCompletionRate, walkCompletionRate].filter(r => r >= 0);
        const overallCompletionRate = rates.length > 0 
          ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) 
          : 0;

        setSummary({
          activeDays,
          lastWeight,
          mainGoal,
          waterGoalDays,
          overallCompletionRate,
        });
      } catch (error) {
        console.error('Error fetching user summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user, startOfMonth, endOfMonth, daysInMonth]);

  const getGoalLabel = (goal: string | null): string => {
    if (!goal) return '—';
    return FITNESS_GOAL_LABELS[goal] || goal;
  };

  return {
    summary,
    loading,
    getGoalLabel,
  };
};
