import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MonthlyStats {
  waterIntake: {
    total: number;
    daysWithGoal: number;
    avgDaily: number;
  };
  sleep: {
    avgHours: number;
    daysWithGoal: number;
    totalNights: number;
  };
  walking: {
    totalDistance: number;
    totalSessions: number;
    totalCalories: number;
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
  const [stats, setStats] = useState<MonthlyStats>({
    waterIntake: { total: 0, daysWithGoal: 0, avgDaily: 0 },
    sleep: { avgHours: 0, daysWithGoal: 0, totalNights: 0 },
    walking: { totalDistance: 0, totalSessions: 0, totalCalories: 0 },
    foodDiary: { totalEntries: 0, activeDays: 0 },
    workouts: { totalWorkouts: 0, activeDays: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMonthlyStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get current month range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      // Fetch water data
      const { data: waterData } = await supabase
        .from('water_tracking')
        .select('amount_ml, daily_goal_ml, date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Fetch sleep data
      const { data: sleepData } = await supabase
        .from('sleep_tracking')
        .select('sleep_duration, date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Fetch walking data
      const { data: walkingData } = await supabase
        .from('walk_sessions')
        .select('distance_meters, calories_burned, start_time')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString());

      // Fetch food diary data
      const { data: foodData } = await supabase
        .from('food_diary')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Fetch meal plans data (as proxy for workouts)
      const { data: workoutData } = await supabase
        .from('meal_plans')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      // Process water stats
      const waterByDay = waterData?.reduce((acc, entry) => {
        const date = entry.date;
        if (!acc[date]) acc[date] = { total: 0, goal: entry.daily_goal_ml };
        acc[date].total += entry.amount_ml;
        return acc;
      }, {} as Record<string, { total: number; goal: number }>) || {};

      const totalWater = Object.values(waterByDay).reduce((sum, day) => sum + day.total, 0);
      const daysWithWaterGoal = Object.values(waterByDay).filter(day => day.total >= day.goal).length;
      const avgDailyWater = Object.keys(waterByDay).length > 0 ? totalWater / Object.keys(waterByDay).length : 0;

      // Process sleep stats
      const sleepHours = sleepData?.map(entry => {
        if (!entry.sleep_duration) return 0;
        
        // Parse duration in HH:MM:SS format
        const durationStr = String(entry.sleep_duration);
        const timeMatch = durationStr.match(/^(\d{2}):(\d{2}):(\d{2})$/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          return hours + minutes / 60;
        }
        return 0;
      }) || [];

      const avgSleepHours = sleepHours.length > 0 ? sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length : 0;
      const daysWithSleepGoal = sleepHours.filter(hours => hours >= 8).length; // Assuming 8h goal

      // Process walking stats
      const totalWalkingDistance = walkingData?.reduce((sum, walk) => sum + (walk.distance_meters || 0), 0) || 0;
      const totalWalkingCalories = walkingData?.reduce((sum, walk) => sum + (walk.calories_burned || 0), 0) || 0;

      // Process food diary stats
      const uniqueFoodDays = new Set(foodData?.map(entry => entry.date) || []).size;

      // Process workout stats (using meal plans as proxy)
      const uniqueWorkoutDays = new Set(
        workoutData?.map(entry => entry.created_at.split('T')[0]) || []
      ).size;

      setStats({
        waterIntake: {
          total: Math.round(totalWater / 1000), // Convert to liters
          daysWithGoal: daysWithWaterGoal,
          avgDaily: Math.round(avgDailyWater)
        },
        sleep: {
          avgHours: Math.round(avgSleepHours * 10) / 10,
          daysWithGoal: daysWithSleepGoal,
          totalNights: sleepHours.length
        },
        walking: {
          totalDistance: Math.round(totalWalkingDistance / 1000 * 10) / 10, // Convert to km
          totalSessions: walkingData?.length || 0,
          totalCalories: totalWalkingCalories
        },
        foodDiary: {
          totalEntries: foodData?.length || 0,
          activeDays: uniqueFoodDays
        },
        workouts: {
          totalWorkouts: workoutData?.length || 0,
          activeDays: uniqueWorkoutDays
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  useEffect(() => {
    fetchMonthlyStats();
  }, [user]);

  return {
    stats,
    loading,
    monthName: getMonthName(),
    getProgressPercentage,
    refetch: fetchMonthlyStats
  };
};