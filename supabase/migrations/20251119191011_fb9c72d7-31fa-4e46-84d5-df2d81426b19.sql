-- FASE 3: Criar função ensure_varied_series() para popular séries variadas

CREATE OR REPLACE FUNCTION public.ensure_varied_series(
  p_category_slug text,
  p_min_cards integer DEFAULT 15,
  p_exercises_per_card integer DEFAULT 5,
  p_reseed boolean DEFAULT false
)
RETURNS TABLE(
  action text,
  series_slug text,
  series_name text,
  exercise_count integer,
  avg_similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_series_config RECORD;
  v_exercise RECORD;
  v_existing_exercises UUID[];
  v_selected_exercises UUID[];
  v_new_series_id UUID;
  v_position INT;
  v_max_similarity FLOAT;
  v_series_definitions JSONB;
  v_compatible_pool INT;
  v_tags_array text[];
BEGIN
  -- Definições expandidas por categoria
  v_series_definitions := '{
    "series-para-emagrecer-rapido": [
      {"title": "HIIT Explosivo", "tags": ["explosivo", "pliometrico", "cardio", "metabolico"], "work": 40, "rest": 20},
      {"title": "Queima Rápida 15min", "tags": ["metabolico", "cardio", "funcional"], "work": 45, "rest": 15},
      {"title": "Tabata Fat Burn", "tags": ["explosivo", "cardio", "alta_intensidade"], "work": 20, "rest": 10},
      {"title": "Cardio Intenso", "tags": ["cardio", "resistencia"], "work": 60, "rest": 30},
      {"title": "Circuit Training", "tags": ["metabolico", "funcional", "circuito"], "work": 50, "rest": 15},
      {"title": "Sprint Intervals", "tags": ["explosivo", "cardio", "velocidade"], "work": 30, "rest": 30},
      {"title": "Metabólico Express", "tags": ["metabolico", "funcional"], "work": 45, "rest": 15},
      {"title": "Cardio Power", "tags": ["cardio", "resistencia", "metabolico"], "work": 60, "rest": 20},
      {"title": "Fat Shredder", "tags": ["metabolico", "explosivo", "funcional"], "work": 40, "rest": 20},
      {"title": "Blast Workout", "tags": ["explosivo", "cardio", "alta_intensidade"], "work": 35, "rest": 25},
      {"title": "Queima Total", "tags": ["metabolico", "funcional", "resistencia"], "work": 50, "rest": 15},
      {"title": "Cardio Killer", "tags": ["cardio", "alta_intensidade", "explosivo"], "work": 40, "rest": 20},
      {"title": "Power Burn 20", "tags": ["metabolico", "explosivo"], "work": 45, "rest": 15},
      {"title": "Intense Shred", "tags": ["alta_intensidade", "metabolico", "cardio"], "work": 40, "rest": 20},
      {"title": "Rapid Fire", "tags": ["explosivo", "velocidade", "cardio"], "work": 30, "rest": 20},
      {"title": "Turbo Cardio", "tags": ["cardio", "velocidade", "metabolico"], "work": 50, "rest": 15}
    ],
    "crossfit": [
      {"title": "WOD Completo", "tags": ["crossfit", "funcional"], "sets": 5, "reps": 10},
      {"title": "AMRAP 20min", "tags": ["crossfit", "resistencia", "funcional"], "sets": 1, "reps": 100},
      {"title": "For Time", "tags": ["crossfit", "velocidade", "explosivo"], "sets": 3, "reps": 21},
      {"title": "EMOM Power", "tags": ["crossfit", "explosivo"], "sets": 10, "reps": 8},
      {"title": "Chipper", "tags": ["crossfit", "resistencia", "metabolico"], "sets": 1, "reps": 150},
      {"title": "Hero WOD", "tags": ["crossfit", "alta_intensidade", "resistencia"], "sets": 5, "reps": 15},
      {"title": "Benchmark", "tags": ["crossfit", "velocidade", "explosivo"], "sets": 3, "reps": 21},
      {"title": "Girls WOD", "tags": ["crossfit", "metabolico"], "sets": 5, "reps": 10},
      {"title": "Tactical Fitness", "tags": ["crossfit", "funcional", "resistencia"], "sets": 4, "reps": 12},
      {"title": "Competitor", "tags": ["crossfit", "alta_intensidade", "explosivo"], "sets": 5, "reps": 8},
      {"title": "Open Prep", "tags": ["crossfit", "velocidade"], "sets": 3, "reps": 15},
      {"title": "Strength WOD", "tags": ["crossfit"], "sets": 5, "reps": 5},
      {"title": "Metcon Brutal", "tags": ["crossfit", "metabolico", "alta_intensidade"], "sets": 1, "reps": 200},
      {"title": "Power Circuit", "tags": ["crossfit", "explosivo"], "sets": 4, "reps": 10},
      {"title": "Elite Training", "tags": ["crossfit", "alta_intensidade", "explosivo"], "sets": 5, "reps": 8},
      {"title": "Beast Mode", "tags": ["crossfit", "metabolico", "resistencia"], "sets": 3, "reps": 20}
    ],
    "series-de-academia-iniciantes": [
      {"title": "Primeiro Treino", "tags": ["peito", "costas"], "sets": 2, "reps": 10},
      {"title": "Corpo Inteiro A", "tags": ["pernas", "core"], "sets": 2, "reps": 12},
      {"title": "Básico Superior", "tags": ["peito", "ombro", "triceps"], "sets": 2, "reps": 12},
      {"title": "Básico Inferior", "tags": ["pernas", "gluteo"], "sets": 2, "reps": 12},
      {"title": "Força Base A", "tags": ["costas", "biceps"], "sets": 3, "reps": 10},
      {"title": "Corpo Inteiro B", "tags": ["pernas", "ombro"], "sets": 2, "reps": 12},
      {"title": "Superior Push", "tags": ["peito", "ombro", "triceps"], "sets": 2, "reps": 12},
      {"title": "Superior Pull", "tags": ["costas", "biceps", "trapezio"], "sets": 2, "reps": 12},
      {"title": "Inferior Completo", "tags": ["pernas", "gluteo", "panturrilha"], "sets": 2, "reps": 15},
      {"title": "Core e Braços", "tags": ["core", "biceps", "triceps"], "sets": 3, "reps": 12},
      {"title": "Peito e Costas", "tags": ["peito", "costas"], "sets": 2, "reps": 10},
      {"title": "Pernas e Ombros", "tags": ["pernas", "ombro"], "sets": 2, "reps": 12},
      {"title": "Total Body A", "tags": ["peito", "pernas", "core"], "sets": 2, "reps": 12},
      {"title": "Total Body B", "tags": ["costas", "pernas", "ombro"], "sets": 2, "reps": 12},
      {"title": "Força Funcional", "tags": ["funcional", "core"], "sets": 3, "reps": 10},
      {"title": "Base Sólida", "tags": ["agachamento", "flexao", "prancha"], "sets": 2, "reps": 12}
    ],
    "series-de-academia-condicionamento": [
      {"title": "Resistência Total", "tags": ["resistencia", "metabolico", "funcional"], "work": 45, "rest": 15},
      {"title": "Cardio Força", "tags": ["cardio", "funcional"], "sets": 3, "reps": 15},
      {"title": "Circuit Power", "tags": ["explosivo", "funcional"], "work": 50, "rest": 20},
      {"title": "Endurance Pro", "tags": ["resistencia", "alta_intensidade", "metabolico"], "work": 60, "rest": 30},
      {"title": "Athletic Prep", "tags": ["atletico", "explosivo", "funcional"], "sets": 4, "reps": 12},
      {"title": "Hybrid Training", "tags": ["funcional", "cardio"], "sets": 3, "reps": 15},
      {"title": "Performance", "tags": ["atletico", "explosivo"], "work": 45, "rest": 15},
      {"title": "Work Capacity", "tags": ["resistencia", "metabolico"], "work": 50, "rest": 20},
      {"title": "GPP Total", "tags": ["funcional"], "sets": 3, "reps": 20},
      {"title": "Conditioning Pro", "tags": ["alta_intensidade", "metabolico"], "work": 40, "rest": 20},
      {"title": "Stamina Builder", "tags": ["resistencia", "metabolico"], "work": 60, "rest": 30},
      {"title": "Energy Systems", "tags": ["metabolico", "funcional"], "work": 45, "rest": 15},
      {"title": "Combat Ready", "tags": ["explosivo", "funcional"], "sets": 4, "reps": 10},
      {"title": "Functional Fit", "tags": ["funcional", "atletico"], "sets": 3, "reps": 15},
      {"title": "Power Endurance", "tags": ["resistencia"], "sets": 4, "reps": 12},
      {"title": "Elite Conditioning", "tags": ["alta_intensidade", "explosivo"], "work": 40, "rest": 20}
    ],
    "series-de-academia-fisioculturismo": [
      {"title": "Hipertrofia Peitoral", "tags": ["peito"], "sets": 4, "reps": 10},
      {"title": "Costas Massivas", "tags": ["costas"], "sets": 4, "reps": 10},
      {"title": "Ombros 3D", "tags": ["ombro"], "sets": 4, "reps": 12},
      {"title": "Braços Completo", "tags": ["biceps", "triceps"], "sets": 4, "reps": 12},
      {"title": "Pernas Volume", "tags": ["pernas", "quadriceps"], "sets": 4, "reps": 10},
      {"title": "Push Day", "tags": ["peito", "ombro", "triceps"], "sets": 4, "reps": 10},
      {"title": "Pull Day", "tags": ["costas", "biceps", "trapezio"], "sets": 4, "reps": 10},
      {"title": "Leg Day", "tags": ["pernas", "gluteo"], "sets": 4, "reps": 10},
      {"title": "Upper Body", "tags": ["peito", "costas", "ombro"], "sets": 4, "reps": 10},
      {"title": "Lower Body", "tags": ["pernas", "gluteo", "panturrilha"], "sets": 4, "reps": 10},
      {"title": "Peito e Tríceps", "tags": ["peito", "triceps"], "sets": 4, "reps": 10},
      {"title": "Costas e Bíceps", "tags": ["costas", "biceps"], "sets": 4, "reps": 10},
      {"title": "Ombros e Trapézio", "tags": ["ombro", "trapezio"], "sets": 4, "reps": 12},
      {"title": "Pernas Posterior", "tags": ["pernas", "gluteo"], "sets": 4, "reps": 10},
      {"title": "Densidade Muscular", "tags": ["peito", "costas"], "sets": 5, "reps": 8},
      {"title": "Volume Training", "tags": ["pernas", "ombro"], "sets": 5, "reps": 10}
    ],
    "series-para-ganho-de-massa-muscular": [
      {"title": "Força Peitoral", "tags": ["peito"], "sets": 5, "reps": 5},
      {"title": "Costas Grandes", "tags": ["costas"], "sets": 5, "reps": 5},
      {"title": "Pernas Potência", "tags": ["pernas", "agachamento"], "sets": 5, "reps": 5},
      {"title": "Ombros Força", "tags": ["ombro"], "sets": 4, "reps": 8},
      {"title": "Volume Pernas", "tags": ["pernas", "gluteo"], "sets": 4, "reps": 10},
      {"title": "Push Power", "tags": ["peito", "ombro", "triceps"], "sets": 5, "reps": 5},
      {"title": "Pull Power", "tags": ["costas", "biceps"], "sets": 5, "reps": 5},
      {"title": "Leg Power", "tags": ["pernas", "agachamento", "afundo"], "sets": 5, "reps": 5},
      {"title": "Upper Volume", "tags": ["peito", "costas", "ombro"], "sets": 4, "reps": 10},
      {"title": "Lower Volume", "tags": ["pernas", "gluteo", "panturrilha"], "sets": 4, "reps": 10},
      {"title": "Peito Massa", "tags": ["peito", "flexao"], "sets": 5, "reps": 8},
      {"title": "Costas Massa", "tags": ["costas", "trapezio"], "sets": 5, "reps": 8},
      {"title": "Pernas Massa", "tags": ["pernas", "agachamento"], "sets": 4, "reps": 10},
      {"title": "Ombros Volume", "tags": ["ombro"], "sets": 4, "reps": 10},
      {"title": "Braços Massa", "tags": ["biceps", "triceps"], "sets": 5, "reps": 8},
      {"title": "Total Massa", "tags": ["peito", "costas", "pernas"], "sets": 4, "reps": 8}
    ],
    "treinos-em-casa-sem-equipamento": [
      {"title": "Casa Básico", "tags": ["peso_corporal", "calistenia"], "sets": 3, "reps": 12},
      {"title": "Bodyweight Total", "tags": ["peso_corporal", "funcional"], "sets": 3, "reps": 15},
      {"title": "Home HIIT", "tags": ["peso_corporal", "cardio", "metabolico"], "work": 40, "rest": 20},
      {"title": "Calistenia Casa", "tags": ["calistenia", "peso_corporal"], "sets": 3, "reps": 12},
      {"title": "Circuit Home", "tags": ["peso_corporal", "funcional"], "work": 45, "rest": 15},
      {"title": "Funcional Home", "tags": ["funcional", "peso_corporal"], "sets": 3, "reps": 15},
      {"title": "No Gym Needed", "tags": ["peso_corporal", "calistenia"], "sets": 3, "reps": 12},
      {"title": "Home Power", "tags": ["peso_corporal", "explosivo"], "sets": 4, "reps": 10},
      {"title": "Living Room", "tags": ["peso_corporal", "funcional"], "sets": 3, "reps": 15},
      {"title": "Zero Equipment", "tags": ["peso_corporal", "calistenia"], "sets": 3, "reps": 12},
      {"title": "Home Fit", "tags": ["peso_corporal", "funcional"], "sets": 3, "reps": 15},
      {"title": "Apartment Workout", "tags": ["peso_corporal", "funcional"], "sets": 3, "reps": 12},
      {"title": "Quick Home", "tags": ["peso_corporal", "metabolico"], "work": 30, "rest": 15},
      {"title": "Bodyweight Blast", "tags": ["peso_corporal", "explosivo"], "work": 40, "rest": 20},
      {"title": "Home Cardio", "tags": ["peso_corporal", "cardio", "metabolico"], "work": 45, "rest": 15},
      {"title": "Stay Home Fit", "tags": ["peso_corporal", "funcional", "calistenia"], "sets": 3, "reps": 12}
    ],
    "treino-de-pilates-sem-equipamentos": [
      {"title": "Pilates Core", "tags": ["core", "isometrico"], "sets": 3, "reps": 15},
      {"title": "Mat Pilates", "tags": ["core", "alongamento"], "sets": 3, "reps": 12},
      {"title": "Pilates Flow", "tags": ["alongamento", "core"], "sets": 2, "reps": 20},
      {"title": "Core Power", "tags": ["core", "prancha"], "sets": 3, "reps": 15},
      {"title": "Stability Work", "tags": ["core", "isometrico"], "sets": 3, "reps": 12},
      {"title": "Pilates Basics", "tags": ["core", "alongamento"], "sets": 2, "reps": 15},
      {"title": "Flexibility", "tags": ["alongamento"], "sets": 2, "reps": 20},
      {"title": "Posture Fix", "tags": ["core", "alongamento"], "sets": 3, "reps": 12},
      {"title": "Ab Sculptor", "tags": ["core"], "sets": 3, "reps": 15},
      {"title": "Mind Body", "tags": ["core", "alongamento"], "sets": 2, "reps": 15},
      {"title": "Deep Core", "tags": ["core", "isometrico"], "sets": 3, "reps": 12},
      {"title": "Pilates Strength", "tags": ["core"], "sets": 3, "reps": 15},
      {"title": "Balance & Core", "tags": ["core", "isometrico"], "sets": 3, "reps": 12},
      {"title": "Reformer-Style", "tags": ["core", "prancha"], "sets": 3, "reps": 10},
      {"title": "Classical Pilates", "tags": ["core", "alongamento"], "sets": 2, "reps": 15},
      {"title": "Modern Pilates", "tags": ["core", "funcional"], "sets": 3, "reps": 12}
    ],
    "funcional-de-15-minutos": [
      {"title": "Quick Functional", "tags": ["funcional", "metabolico"], "work": 45, "rest": 15},
      {"title": "Express Workout", "tags": ["funcional", "metabolico"], "work": 40, "rest": 20},
      {"title": "15min Power", "tags": ["funcional", "explosivo"], "work": 50, "rest": 10},
      {"title": "Fast & Effective", "tags": ["funcional", "metabolico"], "work": 45, "rest": 15},
      {"title": "Mini HIIT", "tags": ["explosivo", "metabolico"], "work": 40, "rest": 20},
      {"title": "Functional Blast", "tags": ["funcional", "explosivo"], "work": 45, "rest": 15},
      {"title": "Quarter Hour", "tags": ["funcional", "metabolico"], "work": 50, "rest": 10},
      {"title": "Speed Workout", "tags": ["funcional", "velocidade"], "work": 40, "rest": 20},
      {"title": "Time Efficient", "tags": ["funcional", "metabolico"], "work": 45, "rest": 15},
      {"title": "Micro Session", "tags": ["funcional", "explosivo"], "work": 50, "rest": 10},
      {"title": "Lunch Break", "tags": ["funcional", "metabolico"], "work": 40, "rest": 20},
      {"title": "Morning Boost", "tags": ["funcional", "energia"], "work": 45, "rest": 15},
      {"title": "Quick Fix", "tags": ["funcional", "metabolico"], "work": 40, "rest": 20},
      {"title": "15 & Done", "tags": ["funcional", "completo"], "work": 45, "rest": 15},
      {"title": "Sprint Session", "tags": ["explosivo", "velocidade"], "work": 30, "rest": 30},
      {"title": "Power Quarter", "tags": ["funcional", "explosivo"], "work": 50, "rest": 10}
    ],
    "calistenia": [
      {"title": "Bodyweight Basics", "tags": ["calistenia", "peso_corporal"], "sets": 3, "reps": 12},
      {"title": "Street Workout", "tags": ["calistenia", "peso_corporal"], "sets": 3, "reps": 10},
      {"title": "Skills Training", "tags": ["calistenia", "isometrico"], "sets": 4, "reps": 5},
      {"title": "Calisthenics Pro", "tags": ["calistenia", "peso_corporal"], "sets": 4, "reps": 8},
      {"title": "Bar Work", "tags": ["calistenia", "costas"], "sets": 4, "reps": 10},
      {"title": "Push Pull Legs", "tags": ["calistenia", "peso_corporal"], "sets": 3, "reps": 12},
      {"title": "Freestyle", "tags": ["calistenia", "explosivo"], "sets": 3, "reps": 10},
      {"title": "Static Holds", "tags": ["calistenia", "isometrico"], "work": 30, "rest": 60},
      {"title": "Dynamic Moves", "tags": ["calistenia", "explosivo"], "sets": 3, "reps": 8},
      {"title": "Progressions", "tags": ["calistenia", "peso_corporal"], "sets": 4, "reps": 6},
      {"title": "Power Calisthenics", "tags": ["calistenia", "explosivo"], "sets": 4, "reps": 8},
      {"title": "Endurance Flow", "tags": ["calistenia", "resistencia"], "sets": 3, "reps": 20},
      {"title": "Athlete Training", "tags": ["calistenia", "funcional"], "sets": 3, "reps": 12},
      {"title": "Urban Fitness", "tags": ["calistenia", "peso_corporal"], "sets": 3, "reps": 15},
      {"title": "Advanced Skills", "tags": ["calistenia", "isometrico"], "sets": 5, "reps": 5},
      {"title": "Competition Prep", "tags": ["calistenia", "explosivo"], "sets": 4, "reps": 8}
    ]
  }'::JSONB;

  -- Limpar se reseed=true
  IF p_reseed THEN
    DELETE FROM series_exercises WHERE series_id IN (
      SELECT id FROM exercise_series WHERE category_slug = p_category_slug
    );
    DELETE FROM exercise_series WHERE category_slug = p_category_slug;
  END IF;

  -- Processar cada série
  FOR v_series_config IN 
    SELECT 
      value->>'title' as title,
      value->'tags' as tags_json,
      COALESCE((value->>'sets')::INT, 3) as default_sets,
      COALESCE((value->>'reps')::INT, 12) as default_reps,
      (value->>'work')::INT as work_sec,
      (value->>'rest')::INT as rest_sec
    FROM jsonb_array_elements(v_series_definitions->p_category_slug)
  LOOP
    -- Converter tags JSONB para array text
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_series_config.tags_json))
    INTO v_tags_array;
    
    -- Verificar pool compatível ANTES de criar série
    SELECT COUNT(*) INTO v_compatible_pool
    FROM get_compatible_exercises(
      v_tags_array,
      p_category_slug,
      200,
      ARRAY[]::UUID[]
    );
    
    -- Se não houver pool suficiente, logar e pular
    IF v_compatible_pool < p_exercises_per_card THEN
      RAISE NOTICE 'SKIPPED: % - Pool insuficiente (% exercícios compatíveis)', 
        v_series_config.title, v_compatible_pool;
      CONTINUE;
    END IF;
    
    -- Verificar se série já existe
    SELECT id INTO v_new_series_id
    FROM exercise_series
    WHERE category_slug = p_category_slug
    AND name = v_series_config.title;

    -- Criar série se não existe
    IF v_new_series_id IS NULL THEN
      v_new_series_id := gen_random_uuid();
      
      INSERT INTO exercise_series (id, slug, category_slug, name, description)
      VALUES (
        v_new_series_id,
        p_category_slug || '-' || lower(regexp_replace(v_series_config.title, '[^a-zA-Z0-9]+', '-', 'g')),
        p_category_slug,
        v_series_config.title,
        'Treino focado em ' || v_series_config.title
      );
    END IF;

    -- Buscar exercícios já na série
    SELECT COALESCE(ARRAY_AGG(exercise_id), ARRAY[]::UUID[]) 
    INTO v_existing_exercises
    FROM series_exercises
    WHERE series_id = v_new_series_id;

    -- Se já tem suficientes, pular
    IF array_length(v_existing_exercises, 1) >= p_exercises_per_card THEN
      SELECT AVG(jaccard_similarity(
        v_existing_exercises,
        (SELECT ARRAY_AGG(exercise_id) FROM series_exercises WHERE series_id = es2.id)
      )) INTO v_max_similarity
      FROM exercise_series es2
      WHERE es2.category_slug = p_category_slug
      AND es2.id != v_new_series_id;

      RETURN QUERY SELECT 
        'KEPT'::TEXT,
        (SELECT slug FROM exercise_series WHERE id = v_new_series_id),
        v_series_config.title,
        array_length(v_existing_exercises, 1),
        COALESCE(v_max_similarity, 0.0);
      
      CONTINUE;
    END IF;

    -- Selecionar exercícios compatíveis
    v_selected_exercises := ARRAY[]::UUID[];
    v_position := COALESCE(array_length(v_existing_exercises, 1), 0) + 1;

    FOR v_exercise IN
      SELECT * FROM get_compatible_exercises(
        v_tags_array,
        p_category_slug,
        200,
        v_existing_exercises
      )
      LIMIT (p_exercises_per_card - COALESCE(array_length(v_existing_exercises, 1), 0))
    LOOP
      -- Inserir exercício na série
      INSERT INTO series_exercises (series_id, exercise_id, position, sets, reps, work_seconds, rest_seconds)
      VALUES (
        v_new_series_id,
        v_exercise.exercise_id,
        v_position,
        v_series_config.default_sets,
        v_series_config.default_reps,
        v_series_config.work_sec,
        v_series_config.rest_sec
      )
      ON CONFLICT (series_id, exercise_id) DO NOTHING;

      v_selected_exercises := array_append(v_selected_exercises, v_exercise.exercise_id);
      v_position := v_position + 1;
    END LOOP;

    -- Calcular similaridade
    SELECT AVG(jaccard_similarity(
      array_cat(v_existing_exercises, v_selected_exercises),
      (SELECT ARRAY_AGG(exercise_id) FROM series_exercises WHERE series_id = es2.id)
    )) INTO v_max_similarity
    FROM exercise_series es2
    WHERE es2.category_slug = p_category_slug
    AND es2.id != v_new_series_id;

    -- Avisar se similaridade alta
    IF v_max_similarity > 0.6 THEN
      RAISE NOTICE 'WARNING: % tem similaridade %.2f (>0.6)', 
        v_series_config.title, v_max_similarity;
    END IF;

    RETURN QUERY SELECT 
      CASE 
        WHEN array_length(v_existing_exercises, 1) > 0 THEN 'UPDATED'
        ELSE 'CREATED'
      END::TEXT,
      (SELECT slug FROM exercise_series WHERE id = v_new_series_id),
      v_series_config.title,
      array_length(v_selected_exercises, 1) + COALESCE(array_length(v_existing_exercises, 1), 0),
      COALESCE(v_max_similarity, 0.0);
  END LOOP;
END;
$$;

-- Executar para todas as categorias (reseed=true para limpar e repopular)
SELECT ensure_varied_series('series-para-emagrecer-rapido', 15, 5, true);
SELECT ensure_varied_series('crossfit', 15, 5, true);
SELECT ensure_varied_series('series-de-academia-iniciantes', 15, 5, true);
SELECT ensure_varied_series('series-de-academia-condicionamento', 15, 5, true);
SELECT ensure_varied_series('series-de-academia-fisioculturismo', 15, 5, true);
SELECT ensure_varied_series('series-para-ganho-de-massa-muscular', 15, 5, true);
SELECT ensure_varied_series('treinos-em-casa-sem-equipamento', 15, 5, true);
SELECT ensure_varied_series('treino-de-pilates-sem-equipamentos', 15, 5, true);
SELECT ensure_varied_series('funcional-de-15-minutos', 15, 5, true);
SELECT ensure_varied_series('calistenia', 15, 5, true);