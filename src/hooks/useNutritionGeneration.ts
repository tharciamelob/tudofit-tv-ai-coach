import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNutritionGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateNutrition = async (questionnaireData: any) => {
    setLoading(true);
    try {
      // Primeiro, salvar o questionário
      const { data: questionnaire, error: qError } = await supabase
        .from('nutrition_questionnaire')
        .insert(questionnaireData)
        .select()
        .single();

      if (qError) throw qError;

      // Depois, gerar o plano nutricional via edge function
      const { data, error } = await supabase.functions.invoke('generate-nutrition', {
        body: { questionnaireId: questionnaire.id }
      });

      if (error) throw error;

      toast({
        title: "Plano nutricional gerado!",
        description: "Seu cardápio personalizado está pronto.",
      });

      return data.plan;
    } catch (error: any) {
      toast({
        title: "Erro ao gerar plano nutricional",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { generateNutrition, loading };
};