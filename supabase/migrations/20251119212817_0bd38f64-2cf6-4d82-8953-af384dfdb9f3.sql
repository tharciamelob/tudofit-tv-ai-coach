
-- Limpeza final: remover os últimos exercícios com equipamento

DELETE FROM series_exercises
WHERE series_id IN (
  SELECT id FROM exercise_series 
  WHERE category_slug IN (
    'treino-de-pilates-sem-equipamentos',
    'treinos-em-casa-sem-equipamento',
    'funcional-de-15-minutos',
    'calistenia'
  )
)
AND exercise_id IN (
  SELECT id FROM exercises
  WHERE 
    name ILIKE '%bola suiça%'
    OR name ILIKE '%bola de exercício%'
    OR name ILIKE '%bola na parede%'
    OR name ILIKE '%rolamento de espuma%'
    OR name ILIKE '%foam roller%'
    OR name ILIKE '%rolo de%'
    OR name ILIKE '%rolando como uma bola%'
    OR name ILIKE '%arremesso de bola%'
    OR name ILIKE '%v-up com bola%'
    OR name ILIKE '%com bola%'
    OR name ILIKE '%com faixa%'
    OR name ILIKE '%dumbbell%'
);

-- Repopular as séries que ficaram com menos de 5 exercícios
DO $$
DECLARE
  v_series RECORD;
  v_exercise RECORD;
  v_current_count INT;
  v_target_count INT := 5;
  v_position INT;
  v_existing_exercises UUID[];
BEGIN
  FOR v_series IN 
    SELECT id, slug, category_slug, name
    FROM exercise_series
    WHERE category_slug IN (
      'treino-de-pilates-sem-equipamentos',
      'treinos-em-casa-sem-equipamento',
      'funcional-de-15-minutos',
      'calistenia'
    )
  LOOP
    SELECT COUNT(*), COALESCE(ARRAY_AGG(exercise_id), ARRAY[]::UUID[])
    INTO v_current_count, v_existing_exercises
    FROM series_exercises
    WHERE series_id = v_series.id;
    
    IF v_current_count < v_target_count THEN
      v_position := COALESCE((
        SELECT MAX(position) FROM series_exercises WHERE series_id = v_series.id
      ), 0) + 1;
      
      FOR v_exercise IN
        SELECT e.id
        FROM exercises e
        WHERE 
          e.id != ALL(v_existing_exercises)
          AND (e.equipment IS NULL OR e.equipment = '' OR e.equipment ILIKE '%corpo%' OR e.equipment ILIKE '%body%')
          AND NOT (
            e.name ILIKE '%halter%' OR e.name ILIKE '%barra fixa%' OR e.name ILIKE '%barra de%'
            OR e.name ILIKE '%kettlebell%' OR e.name ILIKE '%anilha%' OR e.name ILIKE '%máquina%'
            OR e.name ILIKE '%maquina%' OR e.name ILIKE '%cabo%' OR e.name ILIKE '%polia%'
            OR e.name ILIKE '%smith%' OR e.name ILIKE '%aparelho%' OR e.name ILIKE '%faixa%'
            OR e.name ILIKE '%bola%' OR e.name ILIKE '%caixa%' OR e.name ILIKE '%banco%'
            OR e.name ILIKE '%trx%' OR e.name ILIKE '%rolo%' OR e.name ILIKE '%espuma%'
            OR e.name ILIKE '%roller%' OR e.name ILIKE '%dumbbell%' OR e.name ILIKE '%leg press%'
          )
          AND (
            EXISTS (
              SELECT 1 FROM exercise_tags et
              WHERE et.exercise_slug = e.slug
              AND et.tag_key = 'equipamento'
              AND et.tag_value = 'peso_corporal'
            )
            OR NOT EXISTS (
              SELECT 1 FROM exercise_tags et
              WHERE et.exercise_slug = e.slug
              AND et.tag_key = 'equipamento'
              AND et.tag_value != 'peso_corporal'
            )
          )
        ORDER BY RANDOM()
        LIMIT (v_target_count - v_current_count)
      LOOP
        INSERT INTO series_exercises (series_id, exercise_id, position, sets, reps)
        VALUES (v_series.id, v_exercise.id, v_position, 3, 12)
        ON CONFLICT (series_id, exercise_id) DO NOTHING;
        
        v_position := v_position + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;
