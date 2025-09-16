import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MealData {
  meal_type: string;
  food_name: string;
  quantity: number;
  unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  photo_url?: string;
}

interface FoodDiaryEntry {
  id: string;
  created_at: string;
  food_name: string;
  unit: string | null;
  date: string;
  fat: number | null;
  carbs: number | null;
  protein: number | null;
  calories: number | null;
  meal_type: string;
  quantity: number | null;
  user_id: string;
  photo_url: string | null;
}

export const useFoodDiary = () => {
  const [loading, setLoading] = useState(false);
  const [todayMeals, setTodayMeals] = useState<FoodDiaryEntry[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTodayMeals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('food_diary')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTodayMeals(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar refeições:', error);
      toast({
        title: "Erro ao carregar refeições",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async (mealData: MealData) => {
    if (!user) throw new Error('Usuário não logado');

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_diary')
        .insert({
          user_id: user.id,
          meal_type: mealData.meal_type,
          food_name: mealData.food_name,
          quantity: mealData.quantity,
          unit: mealData.unit || 'g',
          calories: mealData.calories || 0,
          protein: mealData.protein || 0,
          carbs: mealData.carbs || 0,
          fat: mealData.fat || 0,
          photo_url: mealData.photo_url || null,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Refeição registrada!",
        description: "Sua refeição foi adicionada ao diário alimentar.",
      });

      // Atualiza a lista de refeições
      await fetchTodayMeals();
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao registrar refeição",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!user) throw new Error('Usuário não logado');

    setLoading(true);
    try {
      const { error } = await supabase
        .from('food_diary')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Refeição excluída",
        description: "A refeição foi removida do seu diário.",
      });

      // Atualiza a lista de refeições
      await fetchTodayMeals();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir refeição",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyTotals = () => {
    return todayMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.calories || 0),
        protein: totals.protein + (meal.protein || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fat: totals.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getMealsByType = (mealType: string) => {
    return todayMeals.filter(meal => meal.meal_type === mealType);
  };

  useEffect(() => {
    fetchTodayMeals();
  }, [user]);

  return {
    todayMeals,
    loading,
    addMeal,
    deleteMeal,
    fetchTodayMeals,
    calculateDailyTotals,
    getMealsByType,
  };
};