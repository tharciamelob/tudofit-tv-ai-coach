import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PDFSuggestion {
  shouldSuggest: boolean;
  reason: string;
  suggestion: string;
}

export const usePDFSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const getSuggestion = async (contentType: 'workout' | 'nutrition', content: any): Promise<PDFSuggestion> => {
    if (!user) {
      return {
        shouldSuggest: false,
        reason: 'Usuário não autenticado',
        suggestion: 'Faça login para obter sugestões personalizadas.'
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pdf-suggestions', {
        body: {
          userId: user.id,
          contentType,
          content
        }
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Erro ao obter sugestão de PDF:', error);
      return {
        shouldSuggest: true,
        reason: 'Erro na análise, mas recomendamos salvar',
        suggestion: 'Recomendamos gerar um PDF do seu plano para ter acesso offline e poder imprimir quando necessário.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { getSuggestion, isLoading };
};