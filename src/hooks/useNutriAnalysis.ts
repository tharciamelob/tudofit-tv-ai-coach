import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NutritionResult {
  ok: boolean;
  meal_type: string;
  nutrition: {
    item_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
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
    try {
      const { data, error } = await supabase.functions.invoke('generate-nutrition', {
        body: { 
          text: text.trim(),
          meal_type: mealType || 'lanche'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data.ok) {
        throw new Error(data.error || 'Erro na análise nutricional');
      }

      setResult(data);
      toast({
        title: "Análise concluída!",
        description: `Encontrado: ${data.nutrition.item_name}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error analyzing text:', error);
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
    try {
      // Upload photo to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${photoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(fileName, photoFile);

      if (uploadError) {
        throw new Error('Erro no upload da foto: ' + uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('food-photos')
        .getPublicUrl(uploadData.path);

      if (!urlData.publicUrl) {
        throw new Error('Erro ao obter URL da foto');
      }

      // Analyze photo
      const { data, error } = await supabase.functions.invoke('generate-nutrition', {
        body: { 
          image_url: urlData.publicUrl,
          meal_type: mealType || 'lanche'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data.ok) {
        throw new Error(data.error || 'Erro na análise nutricional');
      }

      // Add photo URL to result
      const resultWithPhoto = {
        ...data,
        photo_url: urlData.publicUrl
      };

      setResult(resultWithPhoto);
      toast({
        title: "Análise concluída!",
        description: `Encontrado: ${data.nutrition.item_name}`,
      });

      return resultWithPhoto;
    } catch (error: any) {
      console.error('Error analyzing photo:', error);
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
      const { error } = await supabase
        .from('food_diary')
        .insert({
          user_id: user.id,
          meal_type: nutritionData.meal_type,
          item_name: nutritionData.nutrition.item_name,
          food_name: nutritionData.nutrition.item_name, // Compatibilidade
          calories: nutritionData.nutrition.calories,
          protein: nutritionData.nutrition.protein_g,
          carbs: nutritionData.nutrition.carbs_g,
          fat: nutritionData.nutrition.fat_g,
          photo_url: nutritionData.photo_url || null,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        throw new Error('Erro ao salvar no diário: ' + error.message);
      }

      toast({
        title: "Salvo no diário!",
        description: "Refeição adicionada ao seu diário alimentar",
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
    clearResult
  };
};