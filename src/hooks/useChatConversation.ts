import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  shouldGeneratePlan: boolean;
  planData?: any;
  shouldOfferPDF?: boolean;
  conversationId?: string;
}

interface UseChatConversationProps {
  chatType: 'personal' | 'nutrition';
  conversationId?: string;
}

export const useChatConversation = ({ chatType, conversationId }: UseChatConversationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendMessage = async (message: string, conversationHistory: Message[]): Promise<ChatResponse> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-conversation', {
        body: {
          message,
          conversationHistory: conversationHistory.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          chatType,
          userId: user?.id,
          conversationId
        }
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Erro no chat:', error);
      toast({
        title: "Erro na conversa",
        description: error.message || 'Ocorreu um erro na conversa',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
};