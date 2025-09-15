import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWorkoutGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateWorkout = async (questionnaireData: any) => {
    setLoading(true);
    try {
      // Primeiro, salvar o questionário
      const { data: questionnaire, error: qError } = await supabase
        .from('personal_questionnaire')
        .insert(questionnaireData)
        .select()
        .single();

      if (qError) throw qError;

      // Depois, gerar o treino via edge function
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: { questionnaireId: questionnaire.id }
      });

      if (error) throw error;

      toast({
        title: "Treino gerado com sucesso!",
        description: "Seu plano personalizado está pronto.",
      });

      return data.plan;
    } catch (error: any) {
      toast({
        title: "Erro ao gerar treino",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { generateWorkout, loading };
};