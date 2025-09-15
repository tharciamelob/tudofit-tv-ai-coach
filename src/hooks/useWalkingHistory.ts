import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WalkingHistoryEntry {
  id: string;
  start_time: string;
  end_time: string | null;
  distance_meters: number;
  calories_burned: number;
  average_pace: number;
  steps: number;
  is_completed: boolean;
  route_data: any;
}

export const useWalkingHistory = () => {
  const [history, setHistory] = useState<WalkingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('walk_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('start_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyWalks = history.filter(walk => 
      new Date(walk.start_time) >= oneWeekAgo
    );

    const totalDistance = weeklyWalks.reduce((sum, walk) => sum + (walk.distance_meters || 0), 0) / 1000; // em km
    const totalCalories = weeklyWalks.reduce((sum, walk) => sum + (walk.calories_burned || 0), 0);
    const totalSteps = weeklyWalks.reduce((sum, walk) => sum + (walk.steps || 0), 0);
    
    // Calcular tempo total em minutos
    const totalTime = weeklyWalks.reduce((sum, walk) => {
      if (walk.start_time && walk.end_time) {
        const start = new Date(walk.start_time);
        const end = new Date(walk.end_time);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60); // em minutos
      }
      return sum;
    }, 0);

    return {
      distance: totalDistance,
      calories: totalCalories,
      steps: totalSteps,
      time: totalTime,
      sessions: weeklyWalks.length
    };
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km.toFixed(1) + ' km';
  };

  const formatDuration = (startTime: string, endTime: string | null): string => {
    if (!endTime) return '0min';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    return `${minutes}min`;
  };

  const formatPace = (pace: number | null): string => {
    if (!pace || pace === 0) return '0:00 /km';
    
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')} /km`;
  };

  return {
    history,
    loading,
    weekStats: getWeeklyStats(),
    formatDistance,
    formatDuration,
    formatPace,
    refetch: fetchHistory
  };
};