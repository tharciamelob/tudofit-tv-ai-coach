
-- ============================================
-- A) ADD equipment_required COLUMN TO exercises
-- ============================================
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS equipment_required boolean DEFAULT false;

-- ============================================
-- B) ADD is_no_equipment COLUMN TO app_categories
-- ============================================
ALTER TABLE public.app_categories 
ADD COLUMN IF NOT EXISTS is_no_equipment boolean DEFAULT false;

-- ============================================
-- C) POPULATE equipment_required BASED ON NAME KEYWORDS
-- ============================================
UPDATE public.exercises
SET equipment_required = true
WHERE 
  -- If equipment field is filled
  (equipment IS NOT NULL AND equipment != '' AND equipment NOT ILIKE '%corpo%' AND equipment NOT ILIKE '%body%')
  OR
  -- If name contains equipment keywords
  name ILIKE '%halter%' OR name ILIKE '%dumbbell%'
  OR name ILIKE '%barra%' OR name ILIKE '%kettlebell%'
  OR name ILIKE '%elástic%' OR name ILIKE '%faixa%'
  OR name ILIKE '%máquina%' OR name ILIKE '%polia%'
  OR name ILIKE '%bola%' OR name ILIKE '%banco%'
  OR name ILIKE '%step%' OR name ILIKE '%caneleira%'
  OR name ILIKE '%anilha%' OR name ILIKE '%corda%'
  OR name ILIKE '%aparelho%' OR name ILIKE '%TRX%'
  OR name ILIKE '%cabo%' OR name ILIKE '%smith%'
  OR name ILIKE '%leg press%' OR name ILIKE '%band%'
  OR name ILIKE '%ball%' OR name ILIKE '%box%'
  OR name ILIKE '%bench%' OR name ILIKE '%rope%'
  OR name ILIKE '%anel%' OR name ILIKE '%ring%'
  OR name ILIKE '%suspens%' OR name ILIKE '%gymstick%'
  OR name ILIKE '%caixa%' OR name ILIKE '%medicine%'
  OR name ILIKE '%slam%' OR name ILIKE '%wall ball%';

-- ============================================
-- D) MARK NO-EQUIPMENT CATEGORIES
-- ============================================
UPDATE public.app_categories
SET is_no_equipment = true
WHERE slug IN (
  'treinos-em-casa-sem-equipamento',
  'treino-de-pilates-sem-equipamentos',
  'funcional-de-15-minutos',
  'calistenia'
);

-- ============================================
-- E) DROP AND RECREATE series_cards VIEW
-- ============================================
DROP VIEW IF EXISTS public.series_cards;

CREATE VIEW public.series_cards AS
SELECT 
  s.category_slug,
  s.slug,
  s.name,
  s.description,
  -- Use cover_url if exists, otherwise first exercise's media_url
  COALESCE(
    s.cover_url,
    (
      SELECT e2.media_url 
      FROM series_exercises se2 
      JOIN exercises e2 ON e2.id = se2.exercise_id 
      WHERE se2.series_id = s.id 
      ORDER BY se2.position ASC NULLS LAST, e2.name ASC 
      LIMIT 1
    )
  ) AS cover_url,
  json_agg(
    DISTINCT jsonb_build_object(
      'slug', e.slug,
      'name', e.name,
      'media_url', e.media_url,
      'media_type', e.media_type,
      'sets', se.sets,
      'reps', se.reps,
      'work_seconds', se.work_seconds,
      'rest_seconds', se.rest_seconds,
      'equipment', e.equipment,
      'equipment_required', e.equipment_required
    )
    ORDER BY jsonb_build_object(
      'slug', e.slug,
      'name', e.name,
      'media_url', e.media_url,
      'media_type', e.media_type,
      'sets', se.sets,
      'reps', se.reps,
      'work_seconds', se.work_seconds,
      'rest_seconds', se.rest_seconds,
      'equipment', e.equipment,
      'equipment_required', e.equipment_required
    )
  ) AS exercises
FROM exercise_series s
JOIN series_exercises se ON se.series_id = s.id
JOIN exercises e ON e.id = se.exercise_id
JOIN app_categories ac ON ac.slug = s.category_slug
WHERE 
  -- For no-equipment categories, only include bodyweight exercises
  CASE 
    WHEN ac.is_no_equipment = true THEN e.equipment_required = false
    ELSE true
  END
GROUP BY s.category_slug, s.slug, s.name, s.description, s.cover_url, s.id;

-- ============================================
-- F) CLEANUP: REMOVE EQUIPMENT EXERCISES FROM NO-EQUIPMENT SERIES
-- ============================================
DELETE FROM public.series_exercises
WHERE series_id IN (
  SELECT es.id 
  FROM exercise_series es
  JOIN app_categories ac ON ac.slug = es.category_slug
  WHERE ac.is_no_equipment = true
)
AND exercise_id IN (
  SELECT id FROM exercises WHERE equipment_required = true
);

-- ============================================
-- G) GRANT SELECT ON NEW VIEW
-- ============================================
GRANT SELECT ON public.series_cards TO anon, authenticated;
