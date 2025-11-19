
-- Limpar exercícios incompatíveis e repopular séries sem equipamento

-- 1. Remover exercícios com equipamento das categorias sem equipamento
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
    -- Equipamento definido diferente de corpo/body
    (equipment IS NOT NULL AND equipment != '' AND equipment NOT ILIKE '%corpo%' AND equipment NOT ILIKE '%body%')
    OR
    -- Nome contém palavras proibidas
    (
      name ILIKE '%halter%'
      OR name ILIKE '%barra fixa%'
      OR name ILIKE '%barra de%'
      OR name ILIKE '%kettlebell%'
      OR name ILIKE '%anilha%'
      OR name ILIKE '%máquina%'
      OR name ILIKE '%maquina%'
      OR name ILIKE '%cabo%'
      OR name ILIKE '%polia%'
      OR name ILIKE '%smith%'
      OR name ILIKE '%leg press%'
      OR name ILIKE '%aparelho%'
      OR name ILIKE '%faixa elástic%'
      OR name ILIKE '%faixa de resistência%'
      OR name ILIKE '%banda de%'
      OR name ILIKE '%band elástic%'
      OR name ILIKE '%bola medicinal%'
      OR name ILIKE '%medicine ball%'
      OR name ILIKE '%slam ball%'
      OR name ILIKE '%wall ball%'
      OR name ILIKE '%caixa%'
      OR name ILIKE '%box jump%'
      OR name ILIKE '%step%'
      OR name ILIKE '%banco%'
      OR name ILIKE '%bench%'
      OR name ILIKE '%rope%'
      OR name ILIKE '%corda de pular%'
      OR name ILIKE '%anel%'
      OR name ILIKE '%ring%'
      OR name ILIKE '%trx%'
      OR name ILIKE '%suspensão%'
      OR name ILIKE '%rolo de espuma%'
      OR name ILIKE '%foam roller%'
      OR name ILIKE '%roller%'
    )
);

-- 2. Função para repopular séries com poucos exercícios
CREATE OR REPLACE FUNCTION repopulate_series_exercises()
RETURNS void
LANGUAGE plpgsql
AS $$
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
      v_position := v_current_count + 1;
      
      FOR v_exercise IN
        SELECT e.id, e.slug
        FROM exercises e
        WHERE 
          e.id != ALL(v_existing_exercises)
          AND (e.equipment IS NULL OR e.equipment = '' OR e.equipment ILIKE '%corpo%' OR e.equipment ILIKE '%body%')
          AND NOT (
            e.name ILIKE '%halter%'
            OR e.name ILIKE '%barra fixa%'
            OR e.name ILIKE '%barra de%'
            OR e.name ILIKE '%kettlebell%'
            OR e.name ILIKE '%anilha%'
            OR e.name ILIKE '%máquina%'
            OR e.name ILIKE '%maquina%'
            OR e.name ILIKE '%cabo%'
            OR e.name ILIKE '%polia%'
            OR e.name ILIKE '%smith%'
            OR e.name ILIKE '%leg press%'
            OR e.name ILIKE '%aparelho%'
            OR e.name ILIKE '%faixa elástic%'
            OR e.name ILIKE '%faixa de resistência%'
            OR e.name ILIKE '%banda de%'
            OR e.name ILIKE '%band elástic%'
            OR e.name ILIKE '%bola medicinal%'
            OR e.name ILIKE '%medicine ball%'
            OR e.name ILIKE '%slam ball%'
            OR e.name ILIKE '%wall ball%'
            OR e.name ILIKE '%caixa%'
            OR e.name ILIKE '%box jump%'
            OR e.name ILIKE '%step%'
            OR e.name ILIKE '%banco%'
            OR e.name ILIKE '%bench%'
            OR e.name ILIKE '%rope%'
            OR e.name ILIKE '%corda de pular%'
            OR e.name ILIKE '%anel%'
            OR e.name ILIKE '%ring%'
            OR e.name ILIKE '%trx%'
            OR e.name ILIKE '%suspensão%'
            OR e.name ILIKE '%rolo de espuma%'
            OR e.name ILIKE '%foam roller%'
            OR e.name ILIKE '%roller%'
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
      
      RAISE NOTICE 'Série % completada', v_series.slug;
    END IF;
  END LOOP;
END;
$$;

-- 3. Executar a repopulação
SELECT repopulate_series_exercises();

-- 4. Limpar função temporária
DROP FUNCTION IF EXISTS repopulate_series_exercises();
