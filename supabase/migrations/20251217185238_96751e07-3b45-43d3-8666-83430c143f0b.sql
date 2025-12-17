
-- ===========================================
-- CORREÇÃO DE CATEGORIAS SEM EQUIPAMENTO
-- ===========================================

-- 1) Atualizar equipment_required baseado no nome do exercício
UPDATE exercises
SET equipment_required = true
WHERE 
  LOWER(name) LIKE '%halter%' OR
  LOWER(name) LIKE '%barra %' OR
  LOWER(name) LIKE '% barra%' OR
  LOWER(name) LIKE '%máquina%' OR
  LOWER(name) LIKE '%maquina%' OR
  LOWER(name) LIKE '%cabo%' OR
  LOWER(name) LIKE '%polia%' OR
  LOWER(name) LIKE '%kettlebell%' OR
  LOWER(name) LIKE '%faixa%' OR
  LOWER(name) LIKE '%elástic%' OR
  LOWER(name) LIKE '%elastic%' OR
  LOWER(name) LIKE '%banco%' OR
  LOWER(name) LIKE '%bola%' OR
  LOWER(name) LIKE '%anilha%' OR
  LOWER(name) LIKE '%smith%' OR
  LOWER(name) LIKE '%crossover%' OR
  LOWER(name) LIKE '%leg press%' OR
  LOWER(name) LIKE '%hack%' OR
  LOWER(name) LIKE '%com peso%' OR
  LOWER(name) LIKE '%dumbbell%' OR
  LOWER(name) LIKE '%barbell%';

-- 2) Garantir que exercícios sem equipamento estejam marcados corretamente
UPDATE exercises
SET equipment_required = false
WHERE equipment_required IS NULL OR equipment_required = false;

-- 3) Renomear categoria pilates para "Alongamento e Mobilidade"
UPDATE app_categories
SET title = 'Alongamento e Mobilidade', slug = 'alongamento-e-mobilidade'
WHERE slug = 'treino-de-pilates-sem-equipamentos';

-- Atualizar exercise_series para o novo slug
UPDATE exercise_series
SET category_slug = 'alongamento-e-mobilidade'
WHERE category_slug = 'treino-de-pilates-sem-equipamentos';

-- 4) Remover exercícios com equipamento das séries de categorias sem equipamento
DELETE FROM series_exercises
WHERE series_id IN (
  SELECT es.id FROM exercise_series es
  WHERE es.category_slug IN ('treinos-em-casa-sem-equipamento', 'calistenia', 'alongamento-e-mobilidade')
)
AND exercise_id IN (
  SELECT id FROM exercises WHERE equipment_required = true
);

-- 5) Criar função temporária para backfill inteligente
CREATE OR REPLACE FUNCTION temp_backfill_no_equipment_series()
RETURNS TABLE(series_slug text, exercises_added integer, final_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_series RECORD;
  v_exercise RECORD;
  v_current_count INT;
  v_target_count INT := 5;
  v_added INT;
  v_position INT;
  v_existing_ids UUID[];
  v_category_type TEXT;
BEGIN
  FOR v_series IN 
    SELECT es.id, es.slug, es.category_slug
    FROM exercise_series es
    WHERE es.category_slug IN ('treinos-em-casa-sem-equipamento', 'calistenia', 'alongamento-e-mobilidade')
  LOOP
    v_added := 0;
    
    -- Get current exercise count
    SELECT COUNT(*), COALESCE(ARRAY_AGG(exercise_id), ARRAY[]::UUID[])
    INTO v_current_count, v_existing_ids
    FROM series_exercises
    WHERE series_id = v_series.id;
    
    -- Get next position
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_position
    FROM series_exercises
    WHERE series_id = v_series.id;
    
    -- Determine category type for exercise selection
    v_category_type := v_series.category_slug;
    
    -- Add exercises if needed
    WHILE v_current_count < v_target_count LOOP
      -- Find valid exercise based on category
      SELECT id INTO v_exercise
      FROM exercises e
      WHERE e.has_valid_media = true
        AND e.equipment_required = false
        AND e.id != ALL(v_existing_ids)
        AND (
          CASE 
            WHEN v_category_type = 'calistenia' THEN
              LOWER(e.source_category) LIKE '%calistenia%' OR
              LOWER(e.source_category) LIKE '%funcional%' OR
              LOWER(e.source_category) LIKE '%hiit%'
            WHEN v_category_type = 'alongamento-e-mobilidade' THEN
              LOWER(e.source_category) LIKE '%alongamento%' OR
              LOWER(e.source_category) LIKE '%mobilidade%' OR
              LOWER(e.source_category) LIKE '%yoga%' OR
              LOWER(e.name) LIKE '%alongamento%' OR
              LOWER(e.name) LIKE '%stretch%'
            ELSE
              LOWER(e.source_category) LIKE '%funcional%' OR
              LOWER(e.source_category) LIKE '%hiit%' OR
              LOWER(e.source_category) LIKE '%calistenia%' OR
              LOWER(e.source_category) LIKE '%abdominal%'
          END
        )
      ORDER BY RANDOM()
      LIMIT 1;
      
      -- Fallback to any bodyweight exercise
      IF v_exercise IS NULL THEN
        SELECT id INTO v_exercise
        FROM exercises e
        WHERE e.has_valid_media = true
          AND e.equipment_required = false
          AND e.id != ALL(v_existing_ids)
        ORDER BY RANDOM()
        LIMIT 1;
      END IF;
      
      IF v_exercise IS NULL THEN
        EXIT;
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

-- 6) Executar backfill
SELECT * FROM temp_backfill_no_equipment_series();

-- 7) Limpar função temporária
DROP FUNCTION IF EXISTS temp_backfill_no_equipment_series();

-- 8) Recriar view series_cards
DROP VIEW IF EXISTS public.series_cards;

CREATE OR REPLACE VIEW public.series_cards AS
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
