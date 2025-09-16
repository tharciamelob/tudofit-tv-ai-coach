-- Adicionar coluna sleep_goal à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN sleep_goal integer DEFAULT 8;