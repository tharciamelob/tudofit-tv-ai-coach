import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Food {
  id?: string;
  name: string;
  quantity: string;
  portion_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  goal: 'emagrecimento' | 'ganho_massa' | 'manutencao';
  meal_type: 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar' | 'ceia';
  foods: Food[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DailyPlan {
  date: string;
  basePlanName: string;
  goal: 'emagrecimento' | 'ganho_massa' | 'manutencao';
  meals: MealPlan[];
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const useDailyMealPlan = () => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const calculateDailyTotals = (meals: MealPlan[]) => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totals.calories,
      protein: acc.protein + meal.totals.protein,
      carbs: acc.carbs + meal.totals.carbs,
      fat: acc.fat + meal.totals.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const createDailyPlan = async (selectedMeal: MealPlan) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a plan for today
    if (dailyPlan && dailyPlan.date === today) {
      // Ask user if they want to replace
      const confirmReplace = window.confirm(
        'Você já tem um plano para hoje. Deseja substituí-lo por este cardápio?'
      );
      if (!confirmReplace) return;
    }

    const newPlan: DailyPlan = {
      date: today,
      basePlanName: selectedMeal.name,
      goal: selectedMeal.goal,
      meals: [{ ...selectedMeal }],
      dailyTotals: calculateDailyTotals([selectedMeal])
    };

    setDailyPlan(newPlan);

    toast({
      title: "Plano aplicado!",
      description: `${selectedMeal.name} foi adicionado ao seu plano de hoje.`,
    });
  };

  const addMealToPlan = (meal: MealPlan) => {
    if (!dailyPlan) {
      createDailyPlan(meal);
      return;
    }

    // Check if meal type already exists
    const existingMealIndex = dailyPlan.meals.findIndex(m => m.meal_type === meal.meal_type);
    
    if (existingMealIndex !== -1) {
      const confirmReplace = window.confirm(
        `Você já tem um ${meal.meal_type} no plano de hoje. Deseja substituir?`
      );
      if (!confirmReplace) return;

      const updatedMeals = [...dailyPlan.meals];
      updatedMeals[existingMealIndex] = { ...meal };
      
      const updatedPlan = {
        ...dailyPlan,
        meals: updatedMeals,
        dailyTotals: calculateDailyTotals(updatedMeals)
      };

      setDailyPlan(updatedPlan);
    } else {
      const updatedMeals = [...dailyPlan.meals, { ...meal }];
      const updatedPlan = {
        ...dailyPlan,
        meals: updatedMeals,
        dailyTotals: calculateDailyTotals(updatedMeals)
      };

      setDailyPlan(updatedPlan);
    }

    toast({
      title: "Refeição adicionada!",
      description: `${meal.name} foi adicionado ao seu plano de hoje.`,
    });
  };

  const substituteFood = (mealId: string, foodIndex: number, newFood: Food) => {
    if (!dailyPlan) return;

    const updatedMeals = dailyPlan.meals.map(meal => {
      if (meal.id === mealId) {
        const updatedFoods = [...meal.foods];
        const oldFood = updatedFoods[foodIndex];
        updatedFoods[foodIndex] = newFood;

        // Recalculate meal totals
        const mealTotals = updatedFoods.reduce((acc, food) => ({
          calories: acc.calories + food.calories,
          protein: acc.protein + food.protein,
          carbs: acc.carbs + food.carbs,
          fat: acc.fat + food.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // Check if calorie difference is significant (>20%)
        const calorieDiff = Math.abs(newFood.calories - oldFood.calories);
        const percentDiff = (calorieDiff / oldFood.calories) * 100;

        if (percentDiff > 20) {
          const changeType = newFood.calories > oldFood.calories ? 'aumentou' : 'diminuiu';
          toast({
            title: "Aviso",
            description: `Essa substituição ${changeType} bastante as calorias da refeição (${Math.round(percentDiff)}%).`,
            variant: "default",
          });
        }

        return {
          ...meal,
          foods: updatedFoods,
          totals: mealTotals
        };
      }
      return meal;
    });

    const updatedPlan = {
      ...dailyPlan,
      meals: updatedMeals,
      dailyTotals: calculateDailyTotals(updatedMeals)
    };

    setDailyPlan(updatedPlan);

    toast({
      title: "Alimento substituído!",
      description: "Os totais foram recalculados automaticamente.",
    });
  };

  const clearDailyPlan = () => {
    setDailyPlan(null);
    toast({
      title: "Plano limpo",
      description: "Você pode criar um novo plano quando quiser.",
    });
  };

  const removeMealFromPlan = (mealId: string) => {
    if (!dailyPlan) return;

    const updatedMeals = dailyPlan.meals.filter(meal => meal.id !== mealId);
    
    if (updatedMeals.length === 0) {
      clearDailyPlan();
      return;
    }

    const updatedPlan = {
      ...dailyPlan,
      meals: updatedMeals,
      dailyTotals: calculateDailyTotals(updatedMeals)
    };

    setDailyPlan(updatedPlan);

    toast({
      title: "Refeição removida",
      description: "Os totais foram atualizados.",
    });
  };

  return {
    dailyPlan,
    loading,
    createDailyPlan,
    addMealToPlan,
    substituteFood,
    clearDailyPlan,
    removeMealFromPlan
  };
};
