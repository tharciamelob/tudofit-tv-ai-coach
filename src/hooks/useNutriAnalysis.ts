import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionResult {
  ok: boolean;
  meal_type: string;
  foods: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const useNutriAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const analyzeText = async (text: string, mealType?: string) => {
    if (!text.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma descrição da refeição",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      console.log('Enviando análise de texto:', { text: text.trim(), meal_type: mealType || 'lanche' });
      
      const { data, error } = await supabase.functions.invoke('generate-nutrition', {
        body: { 
          text: text.trim(),
          meal_type: mealType || 'lanche'
        }
      });

      console.log('Resposta da função Supabase:', { data, error });

      if (error) {
        console.error('Erro da função Supabase:', error);
        throw new Error(error.message || 'Erro na chamada da função');
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da análise');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.ok) {
        throw new Error(data.error || 'Erro na análise nutricional');
      }

      console.log('Análise bem-sucedida:', data);
      
      setResult(data);
      toast({
        title: "Análise concluída!",
        description: `Identificados ${data.foods.length} alimento(s)`,
      });

      return data;
    } catch (error: any) {
      console.error('Erro na análise de texto:', error);
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar a refeição",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzePhoto = async (photoFile: File, mealType?: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      console.log('Iniciando upload de foto para análise...');
      
      // Upload photo to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${photoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(fileName, photoFile);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error('Erro no upload da foto: ' + uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('food-photos')
        .getPublicUrl(uploadData.path);

      if (!urlData.publicUrl) {
        throw new Error('Erro ao obter URL da foto');
      }

      console.log('Foto enviada, analisando com URL:', urlData.publicUrl);
      console.log('Enviando análise de foto:', { image_url: urlData.publicUrl, meal_type: mealType || 'lanche' });

      // Analyze photo
      const { data, error } = await supabase.functions.invoke('generate-nutrition', {
        body: { 
          image_url: urlData.publicUrl,
          meal_type: mealType || 'lanche'
        }
      });

      console.log('Resposta da função Supabase para foto:', { data, error });

      if (error) {
        console.error('Erro da função Supabase:', error);
        throw new Error(error.message || 'Erro na chamada da função');
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da análise da foto');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.ok) {
        throw new Error(data.error || 'Erro na análise nutricional da foto');
      }

      // Add photo URL to result
      const resultWithPhoto = {
        ...data,
        photo_url: urlData.publicUrl
      };

      console.log('Análise de foto bem-sucedida:', resultWithPhoto);

      setResult(resultWithPhoto);
      toast({
        title: "Análise concluída!",
        description: `Identificados ${data.foods.length} alimento(s) na foto`,
      });

      return resultWithPhoto;
    } catch (error: any) {
      console.error('Erro na análise de foto:', error);
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar a foto",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveToDiary = async (nutritionData: NutritionResult & { photo_url?: string }) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Salvar cada alimento individualmente
      const foodEntries = nutritionData.foods.map(food => ({
        user_id: user.id,
        meal_type: nutritionData.meal_type,
        item_name: food.name,
        food_name: food.name, // Compatibilidade
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        quantity: parseFloat(food.quantity.replace(/[^\d.,]/g, '').replace(',', '.')) || 1,
        photo_url: nutritionData.photo_url || null,
        date: new Date().toISOString().split('T')[0]
      }));

      const { error } = await supabase
        .from('food_diary')
        .insert(foodEntries);

      if (error) {
        throw new Error('Erro ao salvar no diário: ' + error.message);
      }

      toast({
        title: "Salvo no diário!",
        description: `${nutritionData.foods.length} alimento(s) adicionado(s) ao seu diário`,
      });

      return true;
    } catch (error: any) {
      console.error('Error saving to diary:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar no diário",
        variant: "destructive",
      });
      throw error;
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return {
    loading,
    result,
    analyzeText,
    analyzePhoto,
    saveToDiary,
    clearResult,
    setResult // Expose setResult for ready meal plans
  };
};