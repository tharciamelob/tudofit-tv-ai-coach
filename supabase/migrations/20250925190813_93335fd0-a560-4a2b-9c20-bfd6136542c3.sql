-- Corrigir views com problemas de segurança
-- Remover views existentes e recriar sem SECURITY DEFINER
DROP VIEW IF EXISTS public.category_exercises;
DROP VIEW IF EXISTS public.exercise_tag_map;

-- Recriar view exercise_tag_map sem SECURITY DEFINER
CREATE VIEW public.exercise_tag_map AS
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

-- Recriar view category_exercises sem SECURITY DEFINER
CREATE VIEW public.category_exercises AS
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