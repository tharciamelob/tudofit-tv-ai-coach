-- Criar tabela para conversas das IAs
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('personal', 'nutrition')),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para mensagens das conversas
CREATE TABLE public.ai_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies para ai_conversations
CREATE POLICY "Users can manage own conversations" 
ON public.ai_conversations 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies para ai_messages (através da conversation)
CREATE POLICY "Users can manage own messages" 
ON public.ai_messages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.ai_conversations 
    WHERE ai_conversations.id = ai_messages.conversation_id 
    AND ai_conversations.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at em ai_conversations
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();