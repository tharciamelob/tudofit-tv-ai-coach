import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutExercise {
  id: string;
  name: string;
  repsOrTime: string;
  rest: string;
  equipment: "sem_equipamento" | "com_equipamento";
  sets?: number;
  instructions?: string;
}

export interface WorkoutSeries {
  id: string;
  name: string;
  summary: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  objective: string;
  level: "iniciante" | "intermediario" | "avancado";
  durationMinutes: number;
  type: string;
  createdAt: string;
  series: WorkoutSeries[];
  conversationId?: string;
}

export const useWorkoutPlans = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user's workout plans
  const loadWorkoutPlans = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPlans: WorkoutPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        name: plan.plan_data.plan_name || plan.plan_name,
        objective: plan.plan_data.objective || '',
        level: plan.plan_data.level || 'iniciante',
        durationMinutes: plan.plan_data.duration_minutes || plan.plan_data.durationMinutes || 30,
        type: plan.plan_data.type || 'Sem equipamento',
        createdAt: plan.created_at,
        series: plan.plan_data.series || plan.plan_data.workouts?.map((w: any, idx: number) => ({
          id: `serie-${idx}`,
          name: w.name || w.day,
          summary: `${w.exercises?.length || 0} exercícios`,
          exercises: w.exercises?.map((ex: any, exIdx: number) => ({
            id: `ex-${exIdx}`,
            name: ex.name,
            repsOrTime: ex.reps || ex.time || '12 reps',
            rest: ex.rest || '60s',
            equipment: ex.equipment === 'com_equipamento' ? 'com_equipamento' : 'sem_equipamento',
            sets: ex.sets || 3,
            instructions: ex.instructions
          })) || []
        })) || [],
        conversationId: plan.plan_data.conversation_id
      }));

      setWorkoutPlans(formattedPlans);
    } catch (error: any) {
      console.error('Error loading workout plans:', error);
      toast({
        title: 'Erro ao carregar treinos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save workout plan
  const saveWorkoutPlan = async (plan: any, conversationId?: string) => {
    if (!user) return null;

    try {
      const workoutData = {
        user_id: user.id,
        plan_name: plan.plan_name || plan.name || 'Treino Personalizado',
        plan_data: {
          ...plan,
          conversation_id: conversationId
        },
        questionnaire_id: null
      };

      const { data, error } = await supabase
        .from('workout_plans')
        .insert(workoutData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Treino salvo com sucesso!',
        description: 'Seu plano de treino foi salvo.',
      });

      await loadWorkoutPlans();
      return data;
    } catch (error: any) {
      console.error('Error saving workout plan:', error);
      toast({
        title: 'Erro ao salvar treino',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Delete workout plan
  const deleteWorkoutPlan = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Treino excluído',
        description: 'O plano de treino foi removido.',
      });

      await loadWorkoutPlans();
      if (currentWorkout?.id === planId) {
        setCurrentWorkout(null);
      }
    } catch (error: any) {
      console.error('Error deleting workout plan:', error);
      toast({
        title: 'Erro ao excluir treino',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Select current workout
  const selectWorkout = (workout: WorkoutPlan) => {
    setCurrentWorkout(workout);
  };

  // Clear current workout
  const clearCurrentWorkout = () => {
    setCurrentWorkout(null);
  };

  useEffect(() => {
    if (user) {
      loadWorkoutPlans();
    }
  }, [user]);

  return {
    workoutPlans,
    currentWorkout,
    isLoading,
    loadWorkoutPlans,
    saveWorkoutPlan,
    deleteWorkoutPlan,
    selectWorkout,
    clearCurrentWorkout,
  };
};
