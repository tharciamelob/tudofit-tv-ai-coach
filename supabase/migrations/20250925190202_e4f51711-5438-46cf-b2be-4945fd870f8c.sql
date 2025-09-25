-- Adicionar colunas faltantes na tabela exercises
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'gif',
ADD COLUMN IF NOT EXISTS modality text,
ADD COLUMN IF NOT EXISTS level text,
ADD COLUMN IF NOT EXISTS primary_muscle text,
ADD COLUMN IF NOT EXISTS reps int,
ADD COLUMN IF NOT EXISTS sets int,
ADD COLUMN IF NOT EXISTS source_category text,
ADD COLUMN IF NOT EXISTS source_subdir text;

-- Criar tabelas adicionais se não existirem
CREATE TABLE IF NOT EXISTS public.exercise_tags (
  exercise_slug text not null,
  tag_key text not null,
  tag_value text not null,
  primary key (exercise_slug, tag_key, tag_value)
);

CREATE TABLE IF NOT EXISTS public.app_categories (
  slug text primary key,
  title text not null
);

CREATE TABLE IF NOT EXISTS public.category_rules (
  category_slug text not null,
  rule_id bigserial primary key,
  require_modality text[],
  require_level text[],
  require_equipment text[],
  require_tags jsonb
);

-- Inserir categorias (slugs estáveis)
INSERT INTO public.app_categories (slug, title) VALUES
('series-para-emagrecer-rapido','Séries para emagrecer rápido'),
('crossfit','Crossfit'),
('series-de-academia-iniciantes','Séries de academia - iniciantes'),
('series-de-academia-condicionamento','Séries de academia - condicionamento'),
('series-de-academia-fisioculturismo','Séries de academia - fisioculturismo'),
('series-para-ganho-de-massa-muscular','Séries para ganho de massa muscular'),
('treinos-em-casa-sem-equipamento','Treinos em casa - sem equipamento'),
('treino-de-pilates-sem-equipamentos','Treino de pilates - sem equipamentos'),
('treinos-yoga','Treinos yoga'),
('funcional-de-15-minutos','Funcional de 15 minutos'),
('calistenia','Calistenia')
ON CONFLICT (slug) DO NOTHING;

-- Inserir regras padrão
INSERT INTO public.category_rules (category_slug, require_modality, require_tags) VALUES
('series-para-emagrecer-rapido', ARRAY['hiit','cardio','funcional'], '{"goal":["emagrecimento","perda-de-gordura"]}'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_slug, require_modality) VALUES
('crossfit', ARRAY['crossfit']),
('treinos-yoga', ARRAY['yoga']),
('calistenia', ARRAY['calistenia'])
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_slug, require_level) VALUES
('series-de-academia-iniciantes', ARRAY['iniciante'])
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_slug, require_equipment) VALUES
('treinos-em-casa-sem-equipamento', ARRAY['nenhum'])
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_slug, require_modality, require_equipment) VALUES
('treino-de-pilates-sem-equipamentos', ARRAY['pilates'], ARRAY['nenhum'])
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_slug, require_modality, require_tags) VALUES
('series-de-academia-condicionamento', ARRAY['cardio','funcional'], '{"goal":["condicionamento","resistencia"]}'::jsonb),
('series-de-academia-fisioculturismo', ARRAY['bodybuilding'], '{"goal":["hipertrofia","isolamento"]}'::jsonb),
('funcional-de-15-minutos', ARRAY['funcional'], '{"tempo":["15"]}'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO public.category_rules (category_slug, require_tags) VALUES
('series-para-ganho-de-massa-muscular', '{"goal":["hipertrofia","ganho-de-massa"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- Habilitar RLS nas tabelas novas
ALTER TABLE public.exercise_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;

-- Criar políticas de leitura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'exercise_tags' 
    AND policyname = 'exercise_tags public read'
  ) THEN
    CREATE POLICY "exercise_tags public read" ON public.exercise_tags FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'app_categories' 
    AND policyname = 'app_categories public read'
  ) THEN
    CREATE POLICY "app_categories public read" ON public.app_categories FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'category_rules' 
    AND policyname = 'category_rules public read'
  ) THEN
    CREATE POLICY "category_rules public read" ON public.category_rules FOR SELECT USING (true);
  END IF;
END$$;

-- Criar views
DROP VIEW IF EXISTS public.category_exercises;
DROP VIEW IF EXISTS public.exercise_tag_map;

CREATE OR REPLACE VIEW public.exercise_tag_map AS
SELECT exercise_slug,
       jsonb_object_agg(tag_key, vals ORDER BY tag_key) as tags
FROM (
  SELECT exercise_slug,
         tag_key,
         jsonb_agg(lower(tag_value) ORDER BY lower(tag_value)) as vals
  FROM public.exercise_tags
  GROUP BY exercise_slug, tag_key
) s
GROUP BY exercise_slug;

CREATE OR REPLACE VIEW public.category_exercises AS
WITH e AS (
  SELECT *,
         lower(coalesce(modality,''))  as m,
         lower(coalesce(level,''))     as lvl,
         lower(coalesce(equipment,'')) as eqp
  FROM public.exercises
)
SELECT ar.category_slug, ex.*
FROM public.category_rules ar
JOIN e ex ON true
LEFT JOIN public.exercise_tag_map t ON t.exercise_slug = ex.slug
WHERE
  (ar.require_modality IS NULL OR ex.m = ANY (ar.require_modality))
  AND (ar.require_level IS NULL OR ex.lvl = ANY (ar.require_level))
  AND (ar.require_equipment IS NULL OR ex.eqp = ANY (ar.require_equipment))
  AND (
    ar.require_tags IS NULL
    OR (
      NOT EXISTS (
        SELECT 1
        FROM jsonb_each(ar.require_tags) AS r(key, val)
        WHERE NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(coalesce(t.tags -> r.key, '[]'::jsonb)) tv
          JOIN jsonb_array_elements_text(r.val) rv
            ON tv.value = lower(rv.value)
          LIMIT 1
        )
      )
    )
  );