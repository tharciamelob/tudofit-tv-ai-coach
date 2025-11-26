-- Criar tabela de alimentos
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kcal_per_100g NUMERIC NOT NULL,
  protein_per_100g NUMERIC NOT NULL,
  carbs_per_100g NUMERIC NOT NULL,
  fat_per_100g NUMERIC NOT NULL,
  source TEXT NOT NULL DEFAULT 'base' CHECK (source IN ('base', 'user_custom', 'ai_estimated')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para busca por nome
CREATE INDEX idx_foods_name ON public.foods USING gin(to_tsvector('portuguese', name));

-- Enable RLS
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Foods são visíveis para todos"
  ON public.foods FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar alimentos"
  ON public.foods FOR INSERT
  WITH CHECK (auth.uid() = created_by OR source = 'ai_estimated');

CREATE POLICY "Usuários podem atualizar próprios alimentos"
  ON public.foods FOR UPDATE
  USING (auth.uid() = created_by);

-- Inserir alimentos base
INSERT INTO public.foods (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, source) VALUES
-- Proteínas
('Peito de frango grelhado', 165, 31, 0, 4, 'base'),
('Filé de tilápia', 96, 20, 0, 2, 'base'),
('Atum em lata', 116, 26, 0, 1, 'base'),
('Ovos cozidos', 155, 13, 1, 11, 'base'),
('Whey protein', 400, 80, 7, 3, 'base'),
-- Carboidratos
('Arroz integral cozido', 111, 3, 23, 1, 'base'),
('Batata doce', 86, 2, 20, 0, 'base'),
('Aveia', 380, 14, 64, 6, 'base'),
('Pão integral', 246, 9, 46, 3, 'base'),
('Quinoa cozida', 120, 4, 21, 2, 'base'),
-- Frutas
('Banana', 89, 1, 23, 0, 'base'),
('Maçã', 52, 0, 14, 0, 'base'),
('Morango', 32, 1, 8, 0, 'base'),
('Abacate', 160, 2, 9, 15, 'base'),
('Mamão', 43, 0, 11, 0, 'base'),
-- Gorduras
('Azeite extra virgem', 884, 0, 0, 100, 'base'),
('Pasta de amendoim', 588, 25, 20, 50, 'base'),
('Castanha do Pará', 656, 14, 12, 66, 'base'),
('Nozes', 654, 15, 14, 65, 'base'),
('Amêndoas', 579, 21, 22, 50, 'base'),
-- Laticínios
('Iogurte grego natural', 59, 10, 4, 0, 'base'),
('Queijo cottage', 98, 11, 3, 4, 'base'),
('Leite desnatado', 34, 3, 5, 0, 'base'),
('Queijo minas', 264, 18, 4, 20, 'base'),
-- Vegetais
('Brócolis', 35, 3, 7, 0, 'base'),
('Salada verde mista', 15, 1, 3, 0, 'base'),
('Cenoura', 41, 1, 10, 0, 'base'),
('Aspargos', 20, 2, 4, 0, 'base'),
('Tomate', 18, 1, 4, 0, 'base'),
('Pepino', 15, 1, 4, 0, 'base');