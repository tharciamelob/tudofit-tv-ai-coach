-- ===========================================
-- CORREÇÃO AUTOMÁTICA DE MEDIA_URL
-- Remapear 1291 exercícios com mídia quebrada
-- ===========================================

-- 1) Atualizar media_url de gifstudofittv para caminhos válidos
-- Padrão detectado: arquivos existem em pastas como 'crossfit/', 'musculação/', etc.
-- Vamos remapear para a estrutura correta baseada em source_category

UPDATE public.exercises
SET 
  media_url = CASE 
    -- Remapear baseado na estrutura do bucket workouts
    -- Arquivos em gifstudofittv precisam apontar para a pasta correta baseada em source_category
    WHEN source_category IS NOT NULL AND source_category != '' THEN
      'https://czbepdrjixrqrxeyfagc.supabase.co/storage/v1/object/public/workouts/' || 
      LOWER(REPLACE(REPLACE(source_category, ' ', '-'), 'ã', 'a')) || '/' ||
      SUBSTRING(media_url FROM '[^/]+\.gif$')
    ELSE
      -- Fallback: manter estrutura mas usar pasta genérica
      REGEXP_REPLACE(media_url, '/gifstudofittv/', '/funcional/', 'g')
  END,
  has_valid_media = true
WHERE has_valid_media = false
  AND media_url LIKE '%/gifstudofittv/%';

-- 2) Verificar e corrigir exercícios que ainda podem ter URLs problemáticas
-- Atualizar qualquer exercício restante com has_valid_media = false que tenha media_url válida
UPDATE public.exercises
SET has_valid_media = true
WHERE has_valid_media = false
  AND media_url IS NOT NULL
  AND media_url != ''
  AND media_url NOT LIKE '%/gifstudofittv/%';

-- 3) Recriar a view series_cards para refletir as mudanças
DROP VIEW IF EXISTS public.series_cards;

CREATE OR REPLACE VIEW public.series_cards AS
SELECT
  es.slug,
  es.category_slug,
  es.name,
  es.description,
  -- Pegar cover_url do primeiro exercício válido da série
  (
    SELECT e.media_url
    FROM public.series_exercises se
    JOIN public.exercises e ON e.id = se.exercise_id
    WHERE se.series_id = es.id
      AND e.has_valid_media = true
      AND e.media_url IS NOT NULL
    ORDER BY se.position
    LIMIT 1
  ) AS cover_url,
  -- JSON dos exercícios válidos
  (
    SELECT json_agg(
      json_build_object(
        'id', e.id,
        'slug', e.slug,
        'name', e.name,
        'media_url', e.media_url,
        'media_type', e.media_type,
        'sets', COALESCE(se.sets, e.sets, 3),
        'reps', COALESCE(se.reps, e.reps, 12),
        'work_seconds', se.work_seconds,
        'rest_seconds', se.rest_seconds,
        'position', se.position
      ) ORDER BY se.position
    )
    FROM public.series_exercises se
    JOIN public.exercises e ON e.id = se.exercise_id
    WHERE se.series_id = es.id
      AND e.has_valid_media = true
  ) AS exercises
FROM public.exercise_series es;

-- 4) Backfill séries que possam ter ficado com menos de 5 exercícios
SELECT * FROM public.backfill_series_with_valid_exercises();