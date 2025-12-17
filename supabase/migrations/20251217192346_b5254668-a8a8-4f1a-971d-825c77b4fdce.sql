
-- Corrigir views restantes com SECURITY INVOKER

-- 1) category_exercises
DROP VIEW IF EXISTS public.category_exercises;

CREATE VIEW public.category_exercises 
WITH (security_invoker = on)
AS
WITH scored AS (
  SELECT 
    c.slug AS category_slug,
    e.id,
    e.slug,
    e.name,
    e.media_url,
    e.media_type,
    e.modality,
    e.level,
    e.equipment,
    e.primary_muscle,
    e.reps,
    e.sets,
    e.duration_seconds,
    e.source_category,
    e.source_subdir,
    COALESCE(sum(
      CASE
        WHEN ((t.tag_key = r.tag_key) AND (t.tag_value = r.tag_value)) THEN r.weight
        ELSE 0
      END), 0::bigint) AS score
  FROM app_categories c
  CROSS JOIN exercises e
  LEFT JOIN category_rules r ON r.category_slug = c.slug
  LEFT JOIN exercise_tags t ON t.exercise_slug = e.slug
  GROUP BY c.slug, e.id, e.slug, e.name, e.media_url, e.media_type, e.modality, e.level, e.equipment, e.primary_muscle, e.reps, e.sets, e.duration_seconds, e.source_category, e.source_subdir
)
SELECT 
  category_slug,
  id,
  slug,
  name,
  media_url,
  media_type,
  modality,
  level,
  equipment,
  primary_muscle,
  reps,
  sets,
  duration_seconds,
  source_category,
  source_subdir,
  score
FROM scored
ORDER BY category_slug, score DESC, COALESCE(NULLIF(name, ''), slug);

-- 2) exercise_tag_map
DROP VIEW IF EXISTS public.exercise_tag_map;

CREATE VIEW public.exercise_tag_map
WITH (security_invoker = on)
AS
SELECT 
  exercise_slug,
  jsonb_object_agg(tag_key, vals ORDER BY tag_key) AS tags
FROM (
  SELECT 
    exercise_tags.exercise_slug,
    exercise_tags.tag_key,
    jsonb_agg(lower(exercise_tags.tag_value) ORDER BY lower(exercise_tags.tag_value)) AS vals
  FROM exercise_tags
  GROUP BY exercise_tags.exercise_slug, exercise_tags.tag_key
) s
GROUP BY exercise_slug;
