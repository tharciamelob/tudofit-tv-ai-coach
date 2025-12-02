import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyStats {
  waterIntake: {
    total: number;
    daysWithGoal: number;
    avgDaily: number;
    progressPercent: number;
  };
  sleep: {
    avgHours: number;
    daysWithGoal: number;
    totalNights: number;
    progressPercent: number;
  };
  walking: {
    totalDistance: number;
    totalSessions: number;
    totalCalories: number;
    progressPercent: number;
  };
  foodDiary: {
    totalEntries: number;
    activeDays: number;
  };
  workouts: {
    totalWorkouts: number;
    activeDays: number;
  };
}

export const useMonthlyStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MonthlyStats>({
    waterIntake: { total: 0, daysWithGoal: 0, avgDaily: 0, progressPercent: 0 },
    sleep: { avgHours: 0, daysWithGoal: 0, totalNights: 0, progressPercent: 0 },
    walking: { totalDistance: 0, totalSessions: 0, totalCalories: 0, progressPercent: 0 },
    foodDiary: { totalEntries: 0, activeDays: 0 },
    workouts: { totalWorkouts: 0, activeDays: 0 }
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

  const monthName = useMemo(() => {
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, []);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [
        profileResult,
        waterResult,
        sleepResult,
        walkResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('sleep_goal')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('water_tracking')
          .select('date, amount_ml, daily_goal_ml')
          .eq('user_id', user.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth),
        supabase
          .from('sleep_tracking')
          .select('date, sleep_duration, sleep_quality')
          .eq('user_id', user.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth),
        supabase
          .from('walk_sessions')
          .select('start_time, distance_meters, calories_burned')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .gte('start_time', startOfMonth)
          .lte('start_time', `${endOfMonth}T23:59:59`),
      ]);

      const sleepGoal = profileResult.data?.sleep_goal ?? 8;
      const daysSoFar = Math.min(new Date().getDate(), daysInMonth);

      // Water stats
      const waterByDate = new Map<string, { total: number; goal: number }>();
      let totalWater = 0;
      waterResult.data?.forEach(entry => {
        if (!entry.date) return;
        const existing = waterByDate.get(entry.date) || { total: 0, goal: entry.daily_goal_ml || 2000 };
        existing.total += entry.amount_ml || 0;
        existing.goal = entry.daily_goal_ml || existing.goal;
        waterByDate.set(entry.date, existing);
        totalWater += entry.amount_ml || 0;
      });

      let waterGoalDays = 0;
      let waterTotalProgress = 0;
      waterByDate.forEach(({ total, goal }) => {
        if (total >= goal) waterGoalDays++;
        waterTotalProgress += Math.min((total / goal) * 100, 100);
      });
      const waterProgressPercent = waterByDate.size > 0 ? Math.round(waterTotalProgress / waterByDate.size) : 0;
      const avgDailyWater = waterByDate.size > 0 ? Math.round(totalWater / waterByDate.size) : 0;

      // Sleep stats
      let totalSleepHours = 0;
      let sleepGoalDays = 0;
      let sleepTotalProgress = 0;
      sleepResult.data?.forEach(entry => {
        if (entry.sleep_duration) {
          const duration = entry.sleep_duration;
          let hours = 0;
          
          if (typeof duration === 'string') {
            const timeMatch = duration.match(/^(\d{2}):(\d{2}):(\d{2})$/);
            if (timeMatch) {
              hours = parseInt(timeMatch[1]) + parseInt(timeMatch[2]) / 60;
            }
          }
          
          totalSleepHours += hours;
          if (hours >= sleepGoal) sleepGoalDays++;
          sleepTotalProgress += Math.min((hours / sleepGoal) * 100, 100);
        }
      });
      const totalNights = sleepResult.data?.length || 0;
      const avgSleepHours = totalNights > 0 ? totalSleepHours / totalNights : 0;
      const sleepProgressPercent = totalNights > 0 ? Math.round(sleepTotalProgress / totalNights) : 0;

      // Walking stats
      let totalDistance = 0;
      let totalCalories = 0;
      const walkDaysSet = new Set<string>();
      walkResult.data?.forEach(entry => {
        totalDistance += entry.distance_meters || 0;
        totalCalories += entry.calories_burned || 0;
        if (entry.start_time) {
          walkDaysSet.add(entry.start_time.split('T')[0]);
        }
      });
      const totalSessions = walkResult.data?.length || 0;
      // Consider 3 walks per week as 100%
      const expectedWalks = Math.ceil(daysSoFar * 3 / 7);
      const walkProgressPercent = expectedWalks > 0 ? Math.min(Math.round((walkDaysSet.size / expectedWalks) * 100), 100) : 0;

      setStats({
        waterIntake: {
          total: totalWater,
          daysWithGoal: waterGoalDays,
          avgDaily: avgDailyWater,
          progressPercent: waterProgressPercent,
        },
        sleep: {
          avgHours: Math.round(avgSleepHours * 10) / 10,
          daysWithGoal: sleepGoalDays,
          totalNights,
          progressPercent: sleepProgressPercent,
        },
        walking: {
          totalDistance: Math.round(totalDistance / 10) / 100, // Convert to km with 2 decimals
          totalSessions,
          totalCalories,
          progressPercent: walkProgressPercent,
        },
        foodDiary: { totalEntries: 0, activeDays: 0 },
        workouts: { totalWorkouts: 0, activeDays: 0 },
      });
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, startOfMonth, endOfMonth, daysInMonth]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;

    const waterChannel = supabase
      .channel('monthly-stats-water')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'water_tracking', filter: `user_id=eq.${user.id}` },
        () => fetchStats()
      )
      .subscribe();

    const sleepChannel = supabase
      .channel('monthly-stats-sleep')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sleep_tracking', filter: `user_id=eq.${user.id}` },
        () => fetchStats()
      )
      .subscribe();

    const walkChannel = supabase
      .channel('monthly-stats-walk')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'walk_sessions', filter: `user_id=eq.${user.id}` },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(waterChannel);
      supabase.removeChannel(sleepChannel);
      supabase.removeChannel(walkChannel);
    };
  }, [user, fetchStats]);

  const getProgressPercentage = (current: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return {
    stats,
    loading,
    monthName,
    getProgressPercentage,
    refetch: fetchStats,
  };
};
