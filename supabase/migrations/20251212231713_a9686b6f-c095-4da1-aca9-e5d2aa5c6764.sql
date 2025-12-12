-- A) Add has_valid_media column to exercises
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS has_valid_media boolean DEFAULT true;

-- Mark exercises with broken media URLs as invalid
-- Pattern: media_url containing '/gifstudofittv/' returns 404
UPDATE public.exercises
SET has_valid_media = false
WHERE media_url ILIKE '%/gifstudofittv/%';

-- Also mark exercises with NULL or empty media_url as invalid
UPDATE public.exercises
SET has_valid_media = false
WHERE media_url IS NULL OR media_url = '';

-- B) Update series_cards view to only include exercises with valid media
DROP VIEW IF EXISTS public.series_cards;

CREATE VIEW public.series_cards AS
SELECT 
  es.category_slug,
  es.slug,
  es.name,
  es.description,
  COALESCE(
    es.cover_url,
    (
      SELECT e.media_url 
      FROM series_exercises se2
      JOIN exercises e ON e.id = se2.exercise_id
      WHERE se2.series_id = es.id 
        AND e.media_url IS NOT NULL 
        AND e.has_valid_media = true
      ORDER BY se2.position ASC
      LIMIT 1
    )
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
        'sets', se.sets,
        'reps', se.reps,
        'work_seconds', se.work_seconds,
        'rest_seconds', se.rest_seconds
      ) ORDER BY se.position
    )
    FROM series_exercises se
    JOIN exercises e ON e.id = se.exercise_id
    WHERE se.series_id = es.id
      AND e.has_valid_media = true
      AND (
        (SELECT is_no_equipment FROM app_categories WHERE slug = es.category_slug) = false
        OR e.equipment_required = false
      )
  ) AS exercises
FROM exercise_series es;

-- C) Clean up series_exercises: remove exercises with invalid media
DELETE FROM public.series_exercises
WHERE exercise_id IN (
  SELECT id FROM public.exercises WHERE has_valid_media = false
);

-- Backfill series that now have fewer exercises
-- Create function to backfill series with valid exercises
CREATE OR REPLACE FUNCTION public.backfill_series_with_valid_exercises()
RETURNS TABLE(series_slug text, exercises_added int, final_count int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_series RECORD;
  v_exercise RECORD;
  v_current_count INT;
  v_target_count INT := 5;
  v_added INT;
  v_is_no_equipment BOOLEAN;
  v_position INT;
  v_existing_ids UUID[];
BEGIN
  FOR v_series IN 
    SELECT es.id, es.slug, es.category_slug
    FROM exercise_series es
  LOOP
    v_added := 0;
    
    -- Get current exercise count for this series
    SELECT COUNT(*), COALESCE(ARRAY_AGG(exercise_id), ARRAY[]::UUID[])
    INTO v_current_count, v_existing_ids
    FROM series_exercises
    WHERE series_id = v_series.id;
    
    -- Check if category is no-equipment
    SELECT COALESCE(is_no_equipment, false) INTO v_is_no_equipment
    FROM app_categories
    WHERE slug = v_series.category_slug;
    
    -- Get next position
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_position
    FROM series_exercises
    WHERE series_id = v_series.id;
    
    -- Add exercises if needed
    WHILE v_current_count < v_target_count LOOP
      -- Find a valid exercise not already in this series
      SELECT id INTO v_exercise
      FROM exercises e
      WHERE e.has_valid_media = true
        AND e.id != ALL(v_existing_ids)
        AND (NOT v_is_no_equipment OR e.equipment_required = false)
      ORDER BY RANDOM()
      LIMIT 1;
      
      IF v_exercise IS NULL THEN
        EXIT; -- No more valid exercises available
      END IF;
      
      -- Insert into series
      INSERT INTO series_exercises (series_id, exercise_id, position, sets, reps)
      VALUES (v_series.id, v_exercise.id, v_position, 3, 12);
      
      v_existing_ids := array_append(v_existing_ids, v_exercise.id);
      v_position := v_position + 1;
      v_current_count := v_current_count + 1;
      v_added := v_added + 1;
    END LOOP;
    
    IF v_added > 0 THEN
      RETURN QUERY SELECT v_series.slug, v_added, v_current_count;
    END IF;
  END LOOP;
END;
$$;

-- Run the backfill
SELECT * FROM backfill_series_with_valid_exercises();

-- Reorder positions to be sequential (1, 2, 3, ...)
WITH numbered AS (
  SELECT 
    series_id, 
    exercise_id, 
    ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY position) as new_position
  FROM series_exercises
)
UPDATE series_exercises se
SET position = n.new_position
FROM numbered n
WHERE se.series_id = n.series_id 
  AND se.exercise_id = n.exercise_id;