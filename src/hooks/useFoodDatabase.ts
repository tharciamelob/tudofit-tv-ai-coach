import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FoodItem {
  id: string;
  name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  source: string;
}

export const useFoodDatabase = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchFoods = async (searchTerm: string): Promise<FoodItem[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching foods:', error);
      toast({
        title: "Erro ao buscar alimentos",
        description: "Não foi possível buscar na base de dados.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchOrCreateFood = async (foodName: string): Promise<FoodItem | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nutri-ai', {
        body: {
          action: 'search_or_create_food',
          foodName: foodName
        }
      });

      if (error) throw error;

      if (data.found && data.foods?.length > 0) {
        return data.foods[0];
      } else if (data.created && data.food) {
        toast({
          title: "Alimento criado!",
          description: `${data.food.name} foi adicionado à base de dados com informações estimadas pela IA.`,
        });
        return data.food;
      }

      return null;
    } catch (error) {
      console.error('Error searching/creating food:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar ou criar o alimento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFoodsByCategory = async (category: string): Promise<FoodItem[]> => {
    setLoading(true);
    try {
      // This is a simplified version - in production you'd have a category field
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .limit(50);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting foods by category:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    searchFoods,
    searchOrCreateFood,
    getFoodsByCategory
  };
};