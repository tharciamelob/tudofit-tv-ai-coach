import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  conversation_type: 'personal' | 'nutrition';
  created_at: string;
  updated_at: string;
  messages?: ConversationMessage[];
}

interface ConversationMessage {
  id: string;
  conversation_id: string;
  message_type: 'user' | 'ai';
  content: string;
  created_at: string;
}

interface NewConversation {
  conversation_type: 'personal' | 'nutrition';
  title: string;
}

export const useConversationHistory = (conversationType?: 'personal' | 'nutrition') => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar conversas do usuário
  const loadConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (conversationType) {
        query = query.eq('conversation_type', conversationType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConversations((data || []) as Conversation[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar mensagens de uma conversa específica
  const loadConversationMessages = async (conversationId: string): Promise<ConversationMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as ConversationMessage[];
    } catch (error: any) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  // Criar nova conversa
  const createConversation = async (newConversation: NewConversation): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          conversation_type: newConversation.conversation_type,
          title: newConversation.title,
        })
        .select()
        .single();

      if (error) throw error;

      const conversation = data as Conversation;
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      
      return conversation;
    } catch (error: any) {
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Atualizar título da conversa
  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, title } : conv
        )
      );

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar título",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Deletar conversa
  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }

      toast({
        title: "Conversa deletada",
        description: "A conversa foi removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao deletar conversa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Selecionar conversa atual
  const selectConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      const messages = await loadConversationMessages(conversationId);
      setCurrentConversation({ ...conversation, messages });
    }
  };

  // Limpar conversa atual
  const clearCurrentConversation = () => {
    setCurrentConversation(null);
  };

  // Carregar conversas ao montar o componente
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, conversationType]);

  return {
    conversations,
    currentConversation,
    isLoading,
    loadConversations,
    loadConversationMessages,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    selectConversation,
    clearCurrentConversation,
  };
};