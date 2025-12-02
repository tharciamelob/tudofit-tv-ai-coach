import { useState, useEffect, useMemo, useCallback } from 'react';
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

  const fetchSummary = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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
          .select('weight, fitness_goal, sleep_goal')
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
          .select('date, sleep_duration')
          .eq('user_id', user.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth),
        
        // Walking sessions for current month
        supabase
          .from('walk_sessions')
          .select('start_time, distance_meters')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .gte('start_time', startOfMonth)
          .lte('start_time', `${endOfMonth}T23:59:59`),
      ]);

      // Extract profile data
      const lastWeight = profileResult.data?.weight ?? null;
      const mainGoal = profileResult.data?.fitness_goal ?? null;
      const sleepGoal = profileResult.data?.sleep_goal ?? 8;

      // Calculate unique active days from all sources
      // A day is "active" if there's ANY record, regardless of meeting goals
      const activeDaysSet = new Set<string>();

      // Add water tracking days (any record counts)
      waterResult.data?.forEach(entry => {
        if (entry.date && entry.amount_ml > 0) {
          activeDaysSet.add(entry.date);
        }
      });

      // Add sleep tracking days (any record counts)
      sleepResult.data?.forEach(entry => {
        if (entry.date) {
          activeDaysSet.add(entry.date);
        }
      });

      // Add walking session days (any completed session counts)
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

      // Calculate water completion rate (partial progress counts)
      const daysSoFar = Math.min(new Date().getDate(), daysInMonth);
      
      // Water: average of daily progress (capped at 100% per day)
      let waterTotalProgress = 0;
      let waterDaysWithData = 0;
      waterByDate.forEach(({ total, goal }) => {
        waterDaysWithData++;
        waterTotalProgress += Math.min((total / goal) * 100, 100);
      });
      const waterCompletionRate = waterDaysWithData > 0 ? waterTotalProgress / waterDaysWithData : 0;

      // Sleep: average of daily progress
      let sleepTotalProgress = 0;
      let sleepDaysWithData = 0;
      sleepResult.data?.forEach(entry => {
        if (entry.sleep_duration) {
          sleepDaysWithData++;
          const duration = entry.sleep_duration;
          let hours = 0;
          
          if (typeof duration === 'string') {
            // Handle time format (HH:MM:SS)
            const timeMatch = duration.match(/^(\d{2}):(\d{2}):(\d{2})$/);
            if (timeMatch) {
              hours = parseInt(timeMatch[1]) + parseInt(timeMatch[2]) / 60;
            }
          }
          
          sleepTotalProgress += Math.min((hours / sleepGoal) * 100, 100);
        }
      });
      const sleepCompletionRate = sleepDaysWithData > 0 ? sleepTotalProgress / sleepDaysWithData : 0;
      
      // Walking: count days with walks as completion
      const walkDaysSet = new Set(walkResult.data?.map(w => w.start_time?.split('T')[0]));
      const walkDaysWithData = walkDaysSet.size;
      // Consider 3 walks per week as 100% - so ~12 per month
      const walkCompletionRate = daysSoFar > 0 ? Math.min((walkDaysWithData / Math.ceil(daysSoFar * 3 / 7)) * 100, 100) : 0;

      // Average of completion rates (only count metrics that have data)
      const rates: number[] = [];
      if (waterDaysWithData > 0) rates.push(waterCompletionRate);
      if (sleepDaysWithData > 0) rates.push(sleepCompletionRate);
      if (walkDaysWithData > 0) rates.push(walkCompletionRate);
      
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
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  }, [user, startOfMonth, endOfMonth, daysInMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Set up real-time listeners to auto-update when data changes
  useEffect(() => {
    if (!user) return;

    // Listen for water tracking changes
    const waterChannel = supabase
      .channel('user-summary-water')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_tracking',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('User summary: water data changed, refetching...');
          fetchSummary();
        }
      )
      .subscribe();

    // Listen for sleep tracking changes
    const sleepChannel = supabase
      .channel('user-summary-sleep')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleep_tracking',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('User summary: sleep data changed, refetching...');
          fetchSummary();
        }
      )
      .subscribe();

    // Listen for walk session changes
    const walkChannel = supabase
      .channel('user-summary-walk')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'walk_sessions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('User summary: walk data changed, refetching...');
          fetchSummary();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(waterChannel);
      supabase.removeChannel(sleepChannel);
      supabase.removeChannel(walkChannel);
    };
  }, [user, fetchSummary]);

  const getGoalLabel = (goal: string | null): string => {
    if (!goal) return 'Não informado';
    return FITNESS_GOAL_LABELS[goal] || goal;
  };

  return {
    summary,
    loading,
    getGoalLabel,
    refetch: fetchSummary,
  };
};
