-- Remove a CHECK constraint antiga do fitness_goal
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_fitness_goal_check;

-- Adiciona nova CHECK constraint com os valores corretos (incluindo os novos)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_fitness_goal_check 
CHECK (fitness_goal = ANY (ARRAY['emagrecer'::text, 'manter_peso'::text, 'ganhar_massa'::text, 'definir'::text, 'perder_peso'::text, 'melhorar_condicionamento'::text]));

-- Garante que user_id tenha constraint UNIQUE (já existe, mas por segurança)
-- profiles_user_id_key já existe