
-- CORREÇÃO DEFINITIVA: Categorias sem equipamento e Alongamento/Mobilidade

-- =============================================================================
-- PASSO 1: Atualizar equipment_required com critérios MUITO mais rigorosos
-- =============================================================================

UPDATE exercises SET equipment_required = true
WHERE equipment_required = false
AND (
  -- Equipamentos explícitos
  equipment IS NOT NULL AND equipment != '' AND equipment NOT ILIKE '%corpo%' AND equipment NOT ILIKE '%body%' AND equipment NOT ILIKE '%none%' AND equipment NOT ILIKE '%sem%'
  
  -- OU nome contém equipamento (lista expandida)
  OR name ILIKE '%barra%'
  OR name ILIKE '%halter%'
  OR name ILIKE '%haltere%'
  OR name ILIKE '%dumbbell%'
  OR name ILIKE '%banco%'
  OR name ILIKE '%bench%'
  OR name ILIKE '%máquina%'
  OR name ILIKE '%maquina%'
  OR name ILIKE '%machine%'
  OR name ILIKE '%cabo%'
  OR name ILIKE '%cable%'
  OR name ILIKE '%polia%'
  OR name ILIKE '%pulley%'
  OR name ILIKE '%kettlebell%'
  OR name ILIKE '%kb%'
  OR name ILIKE '%smith%'
  OR name ILIKE '%hack%'
  OR name ILIKE '%leg press%'
  OR name ILIKE '%faixa%'
  OR name ILIKE '%elástico%'
  OR name ILIKE '%elastico%'
  OR name ILIKE '%band%'
  OR name ILIKE '%bola%'
  OR name ILIKE '%ball%'
  OR name ILIKE '%roda%'
  OR name ILIKE '%wheel%'
  OR name ILIKE '%corda%'
  OR name ILIKE '%rope%'
  OR name ILIKE '%anilha%'
  OR name ILIKE '%plate%'
  OR name ILIKE '%medicine%'
  OR name ILIKE '%trx%'
  OR name ILIKE '%suspension%'
  OR name ILIKE '%bosu%'
  OR name ILIKE '%step%'
  OR name ILIKE '%box%'
  OR name ILIKE '%caixa%'
  
  -- Estruturas fixas (calistenia com barra/paralela)
  OR name ILIKE '%paralela%'
  OR name ILIKE '%parallel%'
  OR name ILIKE '%dip%'
  OR name ILIKE '%pull up%'
  OR name ILIKE '%pullup%'
  OR name ILIKE '%pull-up%'
  OR name ILIKE '%chin up%'
  OR name ILIKE '%chinup%'
  OR name ILIKE '%chin-up%'
  OR name ILIKE '%muscle up%'
  OR name ILIKE '%muscleup%'
  OR name ILIKE '%muscle-up%'
  OR name ILIKE '%argola%'
  OR name ILIKE '%ring%'
  OR name ILIKE '%fixa%'
  OR name ILIKE '%fixed bar%'
  
  -- Exercícios de academia típicos
  OR name ILIKE '%supino%'
  OR name ILIKE '%bench press%'
  OR name ILIKE '%remada%'
  OR name ILIKE '%row%'
  OR name ILIKE '%rosca%'
  OR name ILIKE '%curl%'
  OR name ILIKE '%crucifixo%'
  OR name ILIKE '%fly%'
  OR name ILIKE '%desenvolvimento%'
  OR name ILIKE '%press%'
  OR name ILIKE '%levantamento terra%'
  OR name ILIKE '%deadlift%'
  OR name ILIKE '%zercher%'
  OR name ILIKE '%front squat%'
  OR name ILIKE '%back squat%'
  OR name ILIKE '%overhead%'
  OR name ILIKE '%militar%'
  OR name ILIKE '%stiff%'
  OR name ILIKE '%good morning%'
  OR name ILIKE '%thruster%'
  OR name ILIKE '%snatch%'
  OR name ILIKE '%clean%'
  OR name ILIKE '%jerk%'
  
  -- Mergulho em estruturas
  OR (name ILIKE '%mergulho%' AND name NOT ILIKE '%solo%' AND name NOT ILIKE '%chão%')
  OR name ILIKE '%dips%'
);

-- =============================================================================
-- PASSO 2: Limpar TODAS as séries das 3 categorias afetadas
-- =============================================================================

DELETE FROM series_exercises 
WHERE series_id IN (
  SELECT id FROM exercise_series 
  WHERE category_slug IN ('treinos-em-casa-sem-equipamento', 'calistenia', 'alongamento-e-mobilidade')
);

-- =============================================================================
-- PASSO 3: Criar função temporária para popular séries com exercícios válidos
-- =============================================================================

CREATE OR REPLACE FUNCTION temp_populate_no_equipment_series()
RETURNS TABLE(category text, series_name text, exercises_added int)
LANGUAGE plpgsql AS $$
DECLARE
  v_series RECORD;
  v_exercise RECORD;
  v_position INT;
  v_added INT;
  v_used_ids UUID[];
  v_is_stretching BOOLEAN;
BEGIN
  FOR v_series IN 
    SELECT es.id, es.slug, es.name, es.category_slug
    FROM exercise_series es
    WHERE es.category_slug IN ('treinos-em-casa-sem-equipamento', 'calistenia', 'alongamento-e-mobilidade')
    ORDER BY es.category_slug, es.name
  LOOP
    v_position := 1;
    v_added := 0;
    v_used_ids := ARRAY[]::UUID[];
    v_is_stretching := (v_series.category_slug = 'alongamento-e-mobilidade');
    
    -- Para cada série, adicionar 5 exercícios válidos
    FOR v_exercise IN 
      SELECT e.id
      FROM exercises e
      WHERE e.has_valid_media = true
        AND e.equipment_required = false
        AND (e.equipment IS NULL OR e.equipment = '' OR e.equipment ILIKE '%corpo%' OR e.equipment ILIKE '%body%')
        -- Filtros específicos por categoria
        AND CASE 
          WHEN v_is_stretching THEN 
            -- Apenas alongamento/mobilidade
            (
              e.source_category ILIKE '%alongamento%' OR 
              e.source_category ILIKE '%mobilidade%' OR
              e.source_category ILIKE '%yoga%' OR
              e.name ILIKE '%alongamento%' OR
              e.name ILIKE '%stretch%' OR
              e.name ILIKE '%mobilidade%' OR
              e.name ILIKE '%mobility%' OR
              e.name ILIKE '%relaxamento%' OR
              e.name ILIKE '%flexibilidade%' OR
              e.name ILIKE '%flexibility%' OR
              e.name ILIKE '%postura%' OR
              e.name ILIKE '%posture%'
            )
            -- E NÃO exercícios de força
            AND e.name NOT ILIKE '%agachamento%'
            AND e.name NOT ILIKE '%squat%'
            AND e.name NOT ILIKE '%flexão%'
            AND e.name NOT ILIKE '%flexao%'
            AND e.name NOT ILIKE '%push%'
            AND e.name NOT ILIKE '%burpee%'
            AND e.name NOT ILIKE '%jump%'
            AND e.name NOT ILIKE '%salto%'
            AND e.name NOT ILIKE '%abdominal%'
            AND e.name NOT ILIKE '%crunch%'
            AND e.name NOT ILIKE '%plank%'
            AND e.name NOT ILIKE '%prancha%'
          ELSE 
            -- Para casa/calistenia: peso corporal funcional
            (
              e.source_category ILIKE '%funcional%' OR
              e.source_category ILIKE '%hiit%' OR
              e.source_category ILIKE '%calistenia%' OR
              e.source_category ILIKE '%corpo%' OR
              e.modality ILIKE '%funcional%' OR
              e.modality ILIKE '%calistenia%'
            )
        END
        AND e.id != ALL(v_used_ids)
      ORDER BY RANDOM()
      LIMIT 5
    LOOP
      INSERT INTO series_exercises (series_id, exercise_id, position, sets, reps)
      VALUES (v_series.id, v_exercise.id, v_position, 3, 12);
      
      v_used_ids := array_append(v_used_ids, v_exercise.id);
      v_position := v_position + 1;
      v_added := v_added + 1;
    END LOOP;
    
    -- Se não conseguiu 5, completar com exercícios genéricos sem equipamento
    IF v_added < 5 THEN
      FOR v_exercise IN 
        SELECT e.id
        FROM exercises e
        WHERE e.has_valid_media = true
          AND e.equipment_required = false
          AND (e.equipment IS NULL OR e.equipment = '' OR e.equipment ILIKE '%corpo%' OR e.equipment ILIKE '%body%')
          AND e.id != ALL(v_used_ids)
          AND CASE 
            WHEN v_is_stretching THEN
              -- Fallback: qualquer exercício leve sem equipamento
              e.name NOT ILIKE '%agachamento%'
              AND e.name NOT ILIKE '%flexão%'
              AND e.name NOT ILIKE '%burpee%'
              AND e.name NOT ILIKE '%jump%'
            ELSE TRUE
          END
        ORDER BY RANDOM()
        LIMIT (5 - v_added)
      LOOP
        INSERT INTO series_exercises (series_id, exercise_id, position, sets, reps)
        VALUES (v_series.id, v_exercise.id, v_position, 3, 12);
        
        v_position := v_position + 1;
        v_added := v_added + 1;
      END LOOP;
    END IF;
    
    RETURN QUERY SELECT v_series.category_slug::text, v_series.name::text, v_added;
  END LOOP;
END;
$$;

-- Executar a população
SELECT * FROM temp_populate_no_equipment_series();

-- Limpar função temporária
DROP FUNCTION IF EXISTS temp_populate_no_equipment_series();

-- =============================================================================
-- PASSO 4: Verificação final
-- =============================================================================

-- Criar view temporária para verificação
DO $$
DECLARE
  v_count INT;
BEGIN
  -- Contar exercícios com equipamento nas categorias
  SELECT COUNT(*) INTO v_count
  FROM series_exercises se
  JOIN exercise_series es ON es.id = se.series_id
  JOIN exercises e ON e.id = se.exercise_id
  WHERE es.category_slug IN ('treinos-em-casa-sem-equipamento', 'calistenia', 'alongamento-e-mobilidade')
  AND (
    e.equipment_required = true
    OR e.name ILIKE '%barra%'
    OR e.name ILIKE '%halter%'
    OR e.name ILIKE '%banco%'
    OR e.name ILIKE '%máquina%'
    OR e.name ILIKE '%cabo%'
    OR e.name ILIKE '%polia%'
    OR e.name ILIKE '%paralela%'
    OR e.name ILIKE '%pull up%'
    OR e.name ILIKE '%supino%'
    OR e.name ILIKE '%remada%'
    OR e.name ILIKE '%mergulho%'
  );
  
  IF v_count > 0 THEN
    RAISE WARNING 'ATENÇÃO: Ainda existem % exercícios com equipamento nas categorias sem equipamento!', v_count;
  ELSE
    RAISE NOTICE 'SUCESSO: 0 exercícios com equipamento nas categorias sem equipamento';
  END IF;
END $$;
