
-- Corrigir aviso de segurança: recriar view com SECURITY INVOKER
DROP VIEW IF EXISTS public.series_cards;

CREATE VIEW public.series_cards 
WITH (security_invoker = on)
AS
SELECT
  es.slug,
  es.category_slug,
  es.name,
  es.description,
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
  (
    SELECT json_agg(
      json_build_object(
        'slug', e.slug,
        'name', e.name,
        'media_url', e.media_url,
        'media_type', e.media_type,
        'equipment', e.equipment,
        'equipment_required', e.equipment_required,
        'has_valid_media', e.has_valid_media,
        'sets', COALESCE(se.sets, e.sets, 3),
        'reps', COALESCE(se.reps, e.reps, 12),
        'work_seconds', se.work_seconds,
        'rest_seconds', se.rest_seconds
      ) ORDER BY se.position
    )
    FROM public.series_exercises se
    JOIN public.exercises e ON e.id = se.exercise_id
    WHERE se.series_id = es.id
      AND e.has_valid_media = true
  ) AS exercises
FROM public.exercise_series es;
