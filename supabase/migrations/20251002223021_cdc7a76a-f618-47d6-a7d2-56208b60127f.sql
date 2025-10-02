-- Corrigir warnings de segurança: adicionar search_path às funções

-- Recriar jaccard_similarity com search_path
CREATE OR REPLACE FUNCTION jaccard_similarity(arr1 UUID[], arr2 UUID[])
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  intersection_count INT;
  union_count INT;
BEGIN
  SELECT COUNT(*) INTO intersection_count
  FROM unnest(arr1) e1
  WHERE e1 = ANY(arr2);
  
  SELECT COUNT(DISTINCT e) INTO union_count
  FROM (
    SELECT unnest(arr1) AS e
    UNION
    SELECT unnest(arr2) AS e
  ) combined;
  
  IF union_count = 0 THEN RETURN 0; END IF;
  
  RETURN intersection_count::FLOAT / union_count::FLOAT;
END;
$$;

-- Recriar get_compatible_exercises com search_path
CREATE OR REPLACE FUNCTION get_compatible_exercises(
  required_tags TEXT[],
  category_slug_param TEXT,
  limit_count INT DEFAULT 50
)
RETURNS TABLE(exercise_id UUID, exercise_slug TEXT, tag_match_score INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.slug,
    (
      SELECT COUNT(*)::INT
      FROM exercise_tags et
      WHERE et.exercise_slug = e.slug
      AND et.tag_value = ANY(required_tags)
    ) as match_score
  FROM exercises e
  WHERE EXISTS (
    SELECT 1 FROM exercise_tags et
    WHERE et.exercise_slug = e.slug
    AND et.tag_value = ANY(required_tags)
  )
  ORDER BY match_score DESC, RANDOM()
  LIMIT limit_count;
END;
$$;

-- Recriar ensure_varied_series com search_path
CREATE OR REPLACE FUNCTION ensure_varied_series(
  p_category_slug TEXT,
  p_min_cards INT DEFAULT 15,
  p_exercises_per_card INT DEFAULT 5,
  p_reseed BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  action TEXT,
  series_slug TEXT,
  series_name TEXT,
  exercise_count INT,
  avg_similarity FLOAT
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
  v_similar BOOLEAN;
  v_new_series_id UUID;
  v_position INT;
  v_similarity FLOAT;
  v_max_similarity FLOAT;
  v_series_definitions JSONB;
BEGIN
  -- Definições de séries por categoria com tags coerentes
  v_series_definitions := '{
    "series-para-emagrecer-rapido": [
      {"title": "HIIT Explosivo", "tags": ["hiit", "cardio", "alta_intensidade", "metabolico"], "work": 40, "rest": 20},
      {"title": "Queima Rápida 15min", "tags": ["metabolico", "fullbody", "cardio", "curta_duracao"], "work": 45, "rest": 15},
      {"title": "Tabata Fat Burn", "tags": ["tabata", "hiit", "explosivo", "cardio"], "work": 20, "rest": 10},
      {"title": "Cardio Intenso", "tags": ["cardio", "corrida", "alta_intensidade", "resistencia"], "work": 60, "rest": 30},
      {"title": "Circuit Training", "tags": ["circuito", "metabolico", "fullbody", "resistencia"], "work": 50, "rest": 15},
      {"title": "Sprint Intervals", "tags": ["sprint", "explosivo", "cardio", "velocidade"], "work": 30, "rest": 30},
      {"title": "Metabólico Express", "tags": ["metabolico", "hiit", "curta_duracao", "fullbody"], "work": 45, "rest": 15},
      {"title": "Cardio Power", "tags": ["cardio", "alta_intensidade", "resistencia", "metabolico"], "work": 60, "rest": 20},
      {"title": "Fat Shredder", "tags": ["metabolico", "explosivo", "hiit", "fullbody"], "work": 40, "rest": 20},
      {"title": "Blast Workout", "tags": ["hiit", "explosivo", "cardio", "alta_intensidade"], "work": 35, "rest": 25},
      {"title": "Queima Total", "tags": ["metabolico", "fullbody", "circuito", "resistencia"], "work": 50, "rest": 15},
      {"title": "Cardio Killer", "tags": ["cardio", "hiit", "alta_intensidade", "explosivo"], "work": 40, "rest": 20},
      {"title": "Power Burn 20", "tags": ["metabolico", "hiit", "curta_duracao", "explosivo"], "work": 45, "rest": 15},
      {"title": "Intense Shred", "tags": ["hiit", "alta_intensidade", "metabolico", "cardio"], "work": 40, "rest": 20},
      {"title": "Rapid Fire", "tags": ["explosivo", "velocidade", "hiit", "cardio"], "work": 30, "rest": 20},
      {"title": "Turbo Cardio", "tags": ["cardio", "alta_intensidade", "velocidade", "metabolico"], "work": 50, "rest": 15}
    ],
    "crossfit": [
      {"title": "WOD Completo", "tags": ["crossfit", "wod", "fullbody", "funcional"], "sets": 5, "reps": 10},
      {"title": "AMRAP 20min", "tags": ["amrap", "crossfit", "resistencia", "funcional"], "sets": 1, "reps": 100},
      {"title": "For Time", "tags": ["crossfit", "velocidade", "explosivo", "funcional"], "sets": 3, "reps": 21},
      {"title": "EMOM Power", "tags": ["emom", "crossfit", "forca", "explosivo"], "sets": 10, "reps": 8},
      {"title": "Chipper", "tags": ["crossfit", "resistencia", "fullbody", "metabolico"], "sets": 1, "reps": 150},
      {"title": "Hero WOD", "tags": ["crossfit", "wod", "alta_intensidade", "resistencia"], "sets": 5, "reps": 15},
      {"title": "Benchmark", "tags": ["crossfit", "benchmark", "velocidade", "explosivo"], "sets": 3, "reps": 21},
      {"title": "Girls WOD", "tags": ["crossfit", "wod", "fullbody", "metabolico"], "sets": 5, "reps": 10},
      {"title": "Tactical Fitness", "tags": ["crossfit", "funcional", "forca", "resistencia"], "sets": 4, "reps": 12},
      {"title": "Competitor", "tags": ["crossfit", "alta_intensidade", "explosivo", "forca"], "sets": 5, "reps": 8},
      {"title": "Open Prep", "tags": ["crossfit", "wod", "fullbody", "velocidade"], "sets": 3, "reps": 15},
      {"title": "Strength WOD", "tags": ["crossfit", "forca", "hipertrofia", "funcional"], "sets": 5, "reps": 5},
      {"title": "Metcon Brutal", "tags": ["crossfit", "metabolico", "alta_intensidade", "resistencia"], "sets": 1, "reps": 200},
      {"title": "Power Circuit", "tags": ["crossfit", "circuito", "explosivo", "fullbody"], "sets": 4, "reps": 10},
      {"title": "Elite Training", "tags": ["crossfit", "alta_intensidade", "forca", "explosivo"], "sets": 5, "reps": 8},
      {"title": "Beast Mode", "tags": ["crossfit", "fullbody", "metabolico", "resistencia"], "sets": 3, "reps": 20}
    ],
    "series-de-academia-iniciantes": [
      {"title": "Primeiro Treino", "tags": ["iniciante", "basico", "leve", "adaptacao"], "sets": 2, "reps": 10},
      {"title": "Corpo Inteiro", "tags": ["iniciante", "fullbody", "basico", "adaptacao"], "sets": 2, "reps": 12},
      {"title": "Básico Superior", "tags": ["iniciante", "superior", "basico", "maquina"], "sets": 2, "reps": 12},
      {"title": "Básico Inferior", "tags": ["iniciante", "pernas", "basico", "maquina"], "sets": 2, "reps": 12},
      {"title": "Adaptação Muscular", "tags": ["iniciante", "adaptacao", "leve", "fullbody"], "sets": 2, "reps": 15},
      {"title": "Semana 1", "tags": ["iniciante", "basico", "adaptacao", "maquina"], "sets": 2, "reps": 12},
      {"title": "Força Base", "tags": ["iniciante", "forca", "basico", "fullbody"], "sets": 3, "reps": 10},
      {"title": "Total Body", "tags": ["iniciante", "fullbody", "maquina", "basico"], "sets": 2, "reps": 12},
      {"title": "Iniciação", "tags": ["iniciante", "adaptacao", "leve", "basico"], "sets": 2, "reps": 15},
      {"title": "Fundamentos", "tags": ["iniciante", "basico", "tecnica", "fullbody"], "sets": 2, "reps": 12},
      {"title": "Primeira Fase", "tags": ["iniciante", "adaptacao", "basico", "maquina"], "sets": 2, "reps": 12},
      {"title": "Base Sólida", "tags": ["iniciante", "forca", "basico", "fullbody"], "sets": 3, "reps": 10},
      {"title": "Academia 101", "tags": ["iniciante", "basico", "adaptacao", "maquina"], "sets": 2, "reps": 12},
      {"title": "Evolução 1", "tags": ["iniciante", "progressao", "basico", "fullbody"], "sets": 2, "reps": 12},
      {"title": "Treino Starter", "tags": ["iniciante", "basico", "adaptacao", "leve"], "sets": 2, "reps": 15},
      {"title": "Começo Ideal", "tags": ["iniciante", "basico", "fullbody", "maquina"], "sets": 2, "reps": 12}
    ],
    "series-de-academia-condicionamento": [
      {"title": "Resistência Total", "tags": ["resistencia", "condicionamento", "fullbody", "metabolico"], "work": 45, "rest": 15},
      {"title": "Cardio Força", "tags": ["condicionamento", "cardio", "forca", "hibrido"], "sets": 3, "reps": 15},
      {"title": "Circuit Power", "tags": ["circuito", "condicionamento", "explosivo", "fullbody"], "work": 50, "rest": 20},
      {"title": "Endurance Pro", "tags": ["resistencia", "condicionamento", "alta_intensidade", "metabolico"], "work": 60, "rest": 30},
      {"title": "Athletic Prep", "tags": ["condicionamento", "atletico", "explosivo", "funcional"], "sets": 4, "reps": 12},
      {"title": "Hybrid Training", "tags": ["condicionamento", "hibrido", "forca", "cardio"], "sets": 3, "reps": 15},
      {"title": "Performance", "tags": ["condicionamento", "performance", "atletico", "explosivo"], "work": 45, "rest": 15},
      {"title": "Work Capacity", "tags": ["condicionamento", "capacidade", "resistencia", "metabolico"], "work": 50, "rest": 20},
      {"title": "GPP Total", "tags": ["condicionamento", "gpp", "fullbody", "funcional"], "sets": 3, "reps": 20},
      {"title": "Conditioning Pro", "tags": ["condicionamento", "avancado", "alta_intensidade", "metabolico"], "work": 40, "rest": 20},
      {"title": "Stamina Builder", "tags": ["resistencia", "condicionamento", "capacidade", "metabolico"], "work": 60, "rest": 30},
      {"title": "Energy Systems", "tags": ["condicionamento", "metabolico", "sistemas", "fullbody"], "work": 45, "rest": 15},
      {"title": "Combat Ready", "tags": ["condicionamento", "combate", "explosivo", "funcional"], "sets": 4, "reps": 10},
      {"title": "Functional Fit", "tags": ["condicionamento", "funcional", "fullbody", "atletico"], "sets": 3, "reps": 15},
      {"title": "Power Endurance", "tags": ["condicionamento", "forca", "resistencia", "hibrido"], "sets": 4, "reps": 12},
      {"title": "Elite Conditioning", "tags": ["condicionamento", "avancado", "alta_intensidade", "explosivo"], "work": 40, "rest": 20}
    ],
    "series-de-academia-fisioculturismo": [
      {"title": "Hipertrofia Peitoral", "tags": ["hipertrofia", "peito", "massa", "isolamento"], "sets": 4, "reps": 10},
      {"title": "Costas Massivas", "tags": ["hipertrofia", "costas", "massa", "densidade"], "sets": 4, "reps": 10},
      {"title": "Ombros 3D", "tags": ["hipertrofia", "ombro", "deltoides", "massa"], "sets": 4, "reps": 12},
      {"title": "Braços Completo", "tags": ["hipertrofia", "braco", "biceps", "triceps"], "sets": 4, "reps": 12},
      {"title": "Pernas Volume", "tags": ["hipertrofia", "pernas", "quadriceps", "massa"], "sets": 4, "reps": 10},
      {"title": "Push Day", "tags": ["hipertrofia", "push", "peito", "ombro"], "sets": 4, "reps": 10},
      {"title": "Pull Day", "tags": ["hipertrofia", "pull", "costas", "biceps"], "sets": 4, "reps": 10},
      {"title": "Leg Day", "tags": ["hipertrofia", "pernas", "quadriceps", "posterior"], "sets": 4, "reps": 10},
      {"title": "Upper Body", "tags": ["hipertrofia", "superior", "peito", "costas"], "sets": 4, "reps": 10},
      {"title": "Lower Body", "tags": ["hipertrofia", "inferior", "pernas", "gluteo"], "sets": 4, "reps": 10},
      {"title": "Arnold Split A", "tags": ["hipertrofia", "peito", "costas", "massa"], "sets": 4, "reps": 10},
      {"title": "Arnold Split B", "tags": ["hipertrofia", "ombro", "braco", "massa"], "sets": 4, "reps": 12},
      {"title": "Arnold Split C", "tags": ["hipertrofia", "pernas", "posterior", "massa"], "sets": 4, "reps": 10},
      {"title": "Densidade Muscular", "tags": ["hipertrofia", "densidade", "massa", "fullbody"], "sets": 5, "reps": 8},
      {"title": "Volume Training", "tags": ["hipertrofia", "volume", "massa", "advanced"], "sets": 5, "reps": 10},
      {"title": "Mass Builder", "tags": ["hipertrofia", "massa", "compostos", "forca"], "sets": 4, "reps": 8}
    ],
    "series-para-ganho-de-massa-muscular": [
      {"title": "Força e Massa", "tags": ["massa", "forca", "compostos", "pesado"], "sets": 5, "reps": 5},
      {"title": "Volume Extremo", "tags": ["massa", "volume", "hipertrofia", "advanced"], "sets": 5, "reps": 10},
      {"title": "Crescimento Total", "tags": ["massa", "fullbody", "compostos", "hipertrofia"], "sets": 4, "reps": 8},
      {"title": "Power Building", "tags": ["massa", "forca", "explosivo", "compostos"], "sets": 5, "reps": 5},
      {"title": "Mass Protocol", "tags": ["massa", "protocolo", "hipertrofia", "advanced"], "sets": 4, "reps": 10},
      {"title": "Bulk Phase", "tags": ["massa", "bulking", "volume", "hipertrofia"], "sets": 4, "reps": 10},
      {"title": "Size Maker", "tags": ["massa", "hipertrofia", "tamanho", "volume"], "sets": 5, "reps": 10},
      {"title": "Muscle Factory", "tags": ["massa", "fabrica", "hipertrofia", "compostos"], "sets": 4, "reps": 8},
      {"title": "Growth Phase", "tags": ["massa", "crescimento", "hipertrofia", "volume"], "sets": 4, "reps": 10},
      {"title": "Anabolic Push", "tags": ["massa", "anabolico", "hipertrofia", "forca"], "sets": 5, "reps": 8},
      {"title": "Mass Gain Pro", "tags": ["massa", "ganho", "advanced", "volume"], "sets": 4, "reps": 10},
      {"title": "Hypertrophy Max", "tags": ["massa", "hipertrofia", "maximo", "volume"], "sets": 5, "reps": 10},
      {"title": "Build Muscle", "tags": ["massa", "construcao", "hipertrofia", "compostos"], "sets": 4, "reps": 8},
      {"title": "Size & Strength", "tags": ["massa", "forca", "tamanho", "compostos"], "sets": 5, "reps": 5},
      {"title": "Gain Phase", "tags": ["massa", "ganho", "hipertrofia", "volume"], "sets": 4, "reps": 10},
      {"title": "Mass Maximizer", "tags": ["massa", "maximo", "advanced", "volume"], "sets": 5, "reps": 10}
    ],
    "treinos-em-casa-sem-equipamento": [
      {"title": "Casa Básico", "tags": ["casa", "sem_equipamento", "peso_corporal", "iniciante"], "sets": 3, "reps": 12},
      {"title": "Bodyweight Total", "tags": ["peso_corporal", "fullbody", "casa", "funcional"], "sets": 3, "reps": 15},
      {"title": "Home HIIT", "tags": ["casa", "hiit", "sem_equipamento", "cardio"], "work": 40, "rest": 20},
      {"title": "Calistenia Casa", "tags": ["calistenia", "casa", "peso_corporal", "funcional"], "sets": 3, "reps": 12},
      {"title": "Circuit Home", "tags": ["casa", "circuito", "sem_equipamento", "fullbody"], "work": 45, "rest": 15},
      {"title": "Funcional Home", "tags": ["funcional", "casa", "peso_corporal", "movimento"], "sets": 3, "reps": 15},
      {"title": "No Gym Needed", "tags": ["casa", "sem_equipamento", "completo", "fullbody"], "sets": 3, "reps": 12},
      {"title": "Home Power", "tags": ["casa", "forca", "peso_corporal", "explosivo"], "sets": 4, "reps": 10},
      {"title": "Living Room", "tags": ["casa", "sala", "sem_equipamento", "pratico"], "sets": 3, "reps": 15},
      {"title": "Zero Equipment", "tags": ["sem_equipamento", "casa", "peso_corporal", "basico"], "sets": 3, "reps": 12},
      {"title": "Home Fit", "tags": ["casa", "fitness", "sem_equipamento", "fullbody"], "sets": 3, "reps": 15},
      {"title": "Apartment Workout", "tags": ["casa", "apartamento", "silencioso", "peso_corporal"], "sets": 3, "reps": 12},
      {"title": "Quick Home", "tags": ["casa", "rapido", "sem_equipamento", "curta_duracao"], "work": 30, "rest": 15},
      {"title": "Bodyweight Blast", "tags": ["peso_corporal", "explosivo", "casa", "alta_intensidade"], "work": 40, "rest": 20},
      {"title": "Home Cardio", "tags": ["casa", "cardio", "sem_equipamento", "metabolico"], "work": 45, "rest": 15},
      {"title": "Stay Home Fit", "tags": ["casa", "completo", "sem_equipamento", "fullbody"], "sets": 3, "reps": 12}
    ],
    "treino-de-pilates-sem-equipamentos": [
      {"title": "Pilates Core", "tags": ["pilates", "core", "mat", "estabilidade"], "sets": 3, "reps": 15},
      {"title": "Mat Pilates", "tags": ["pilates", "mat", "colchonete", "controle"], "sets": 3, "reps": 12},
      {"title": "Pilates Flow", "tags": ["pilates", "flow", "fluido", "movimento"], "sets": 2, "reps": 20},
      {"title": "Core Power", "tags": ["core", "pilates", "forca", "centro"], "sets": 3, "reps": 15},
      {"title": "Stability Work", "tags": ["estabilidade", "pilates", "equilibrio", "core"], "sets": 3, "reps": 12},
      {"title": "Pilates Basics", "tags": ["pilates", "basico", "fundamentos", "mat"], "sets": 2, "reps": 15},
      {"title": "Flexibility", "tags": ["flexibilidade", "pilates", "alongamento", "mobilidade"], "sets": 2, "reps": 20},
      {"title": "Posture Fix", "tags": ["postura", "pilates", "correcao", "alinhamento"], "sets": 3, "reps": 12},
      {"title": "Ab Sculptor", "tags": ["abs", "pilates", "core", "definicao"], "sets": 3, "reps": 15},
      {"title": "Mind Body", "tags": ["pilates", "mente_corpo", "consciencia", "controle"], "sets": 2, "reps": 15},
      {"title": "Deep Core", "tags": ["core", "profundo", "pilates", "transverso"], "sets": 3, "reps": 12},
      {"title": "Pilates Strength", "tags": ["pilates", "forca", "resistencia", "controle"], "sets": 3, "reps": 15},
      {"title": "Balance & Core", "tags": ["equilibrio", "core", "pilates", "estabilidade"], "sets": 3, "reps": 12},
      {"title": "Reformer-Style", "tags": ["pilates", "reformer", "mat", "advanced"], "sets": 3, "reps": 10},
      {"title": "Classical Pilates", "tags": ["pilates", "classico", "joseph", "tradicional"], "sets": 2, "reps": 15},
      {"title": "Modern Pilates", "tags": ["pilates", "moderno", "contemporaneo", "hibrido"], "sets": 3, "reps": 12}
    ],
    "funcional-de-15-minutos": [
      {"title": "Quick Functional", "tags": ["funcional", "rapido", "15min", "fullbody"], "work": 45, "rest": 15},
      {"title": "Express Workout", "tags": ["express", "curta_duracao", "funcional", "eficiente"], "work": 40, "rest": 20},
      {"title": "15min Power", "tags": ["15min", "power", "funcional", "intenso"], "work": 50, "rest": 10},
      {"title": "Fast & Effective", "tags": ["rapido", "efetivo", "funcional", "metabolico"], "work": 45, "rest": 15},
      {"title": "Mini HIIT", "tags": ["hiit", "curta_duracao", "15min", "explosivo"], "work": 40, "rest": 20},
      {"title": "Functional Blast", "tags": ["funcional", "blast", "intenso", "curta_duracao"], "work": 45, "rest": 15},
      {"title": "Quarter Hour", "tags": ["15min", "completo", "funcional", "eficiente"], "work": 50, "rest": 10},
      {"title": "Speed Workout", "tags": ["velocidade", "rapido", "funcional", "metabolico"], "work": 40, "rest": 20},
      {"title": "Time Efficient", "tags": ["eficiente", "tempo", "funcional", "curta_duracao"], "work": 45, "rest": 15},
      {"title": "Micro Session", "tags": ["micro", "sessao", "funcional", "15min"], "work": 50, "rest": 10},
      {"title": "Lunch Break", "tags": ["almoco", "rapido", "funcional", "pratico"], "work": 40, "rest": 20},
      {"title": "Morning Boost", "tags": ["manha", "energia", "funcional", "rapido"], "work": 45, "rest": 15},
      {"title": "Quick Fix", "tags": ["rapido", "solucao", "funcional", "eficaz"], "work": 40, "rest": 20},
      {"title": "15 & Done", "tags": ["15min", "pronto", "funcional", "completo"], "work": 45, "rest": 15},
      {"title": "Sprint Session", "tags": ["sprint", "sessao", "funcional", "intenso"], "work": 30, "rest": 30},
      {"title": "Power Quarter", "tags": ["power", "15min", "funcional", "explosivo"], "work": 50, "rest": 10}
    ],
    "calistenia": [
      {"title": "Bodyweight Basics", "tags": ["calistenia", "basico", "peso_corporal", "fundamentos"], "sets": 3, "reps": 12},
      {"title": "Street Workout", "tags": ["calistenia", "rua", "urbano", "skills"], "sets": 3, "reps": 10},
      {"title": "Skills Training", "tags": ["calistenia", "skills", "habilidades", "advanced"], "sets": 4, "reps": 5},
      {"title": "Calisthenics Pro", "tags": ["calistenia", "profissional", "advanced", "skills"], "sets": 4, "reps": 8},
      {"title": "Bar Work", "tags": ["barra", "calistenia", "superior", "pull"], "sets": 4, "reps": 10},
      {"title": "Push Pull Legs", "tags": ["calistenia", "push", "pull", "legs"], "sets": 3, "reps": 12},
      {"title": "Freestyle", "tags": ["calistenia", "freestyle", "criativo", "dinamico"], "sets": 3, "reps": 10},
      {"title": "Static Holds", "tags": ["calistenia", "estatico", "isometrico", "forca"], "work": 30, "rest": 60},
      {"title": "Dynamic Moves", "tags": ["calistenia", "dinamico", "explosivo", "movimento"], "sets": 3, "reps": 8},
      {"title": "Progressions", "tags": ["calistenia", "progressoes", "evolucao", "skills"], "sets": 4, "reps": 6},
      {"title": "Power Calisthenics", "tags": ["calistenia", "power", "forca", "explosivo"], "sets": 4, "reps": 8},
      {"title": "Endurance Flow", "tags": ["calistenia", "resistencia", "flow", "volume"], "sets": 3, "reps": 20},
      {"title": "Athlete Training", "tags": ["calistenia", "atletico", "performance", "funcional"], "sets": 3, "reps": 12},
      {"title": "Urban Fitness", "tags": ["calistenia", "urbano", "outdoor", "parque"], "sets": 3, "reps": 15},
      {"title": "Advanced Skills", "tags": ["calistenia", "advanced", "skills", "tecnico"], "sets": 5, "reps": 5},
      {"title": "Competition Prep", "tags": ["calistenia", "competicao", "performance", "avancado"], "sets": 4, "reps": 8}
    ]
  }'::JSONB;

  -- Limpar séries existentes se reseed=true
  IF p_reseed THEN
    DELETE FROM series_exercises WHERE series_id IN (
      SELECT id FROM exercise_series WHERE category_slug = p_category_slug
    );
    DELETE FROM exercise_series WHERE category_slug = p_category_slug;
  END IF;

  -- Processar cada definição de série para esta categoria
  FOR v_series_config IN 
    SELECT 
      value->>'title' as title,
      value->>'tags' as tags_json,
      COALESCE((value->>'sets')::INT, 3) as default_sets,
      COALESCE((value->>'reps')::INT, 12) as default_reps,
      (value->>'work')::INT as work_sec,
      (value->>'rest')::INT as rest_sec
    FROM jsonb_array_elements(v_series_definitions->p_category_slug)
  LOOP
    -- Verificar se série já existe
    SELECT id INTO v_new_series_id
    FROM exercise_series
    WHERE category_slug = p_category_slug
    AND name = v_series_config.title;

    -- Se não existe, criar
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

    -- Obter exercícios já usados nesta série
    SELECT ARRAY_AGG(exercise_id) INTO v_existing_exercises
    FROM series_exercises
    WHERE series_id = v_new_series_id;

    v_existing_exercises := COALESCE(v_existing_exercises, ARRAY[]::UUID[]);

    -- Se já tem exercícios suficientes, verificar diversidade
    IF array_length(v_existing_exercises, 1) >= p_exercises_per_card THEN
      -- Calcular similaridade média com outras séries
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
        string_to_array(v_series_config.tags_json, ','),
        p_category_slug,
        50
      )
      WHERE exercise_id != ALL(v_existing_exercises)
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

    -- Calcular similaridade com outras séries
    SELECT AVG(jaccard_similarity(
      array_cat(v_existing_exercises, v_selected_exercises),
      (SELECT ARRAY_AGG(exercise_id) FROM series_exercises WHERE series_id = es2.id)
    )) INTO v_max_similarity
    FROM exercise_series es2
    WHERE es2.category_slug = p_category_slug
    AND es2.id != v_new_series_id;

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

-- Recriar audit_series_diversity com search_path
CREATE OR REPLACE FUNCTION audit_series_diversity(p_category_slug TEXT DEFAULT NULL)
RETURNS TABLE(
  category TEXT,
  total_series INT,
  avg_exercises_per_series FLOAT,
  series_with_duplicates INT,
  max_similarity FLOAT,
  avg_similarity FLOAT,
  top_exercises JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH category_stats AS (
    SELECT 
      es.category_slug,
      COUNT(DISTINCT es.id) as series_count,
      AVG((SELECT COUNT(*) FROM series_exercises se WHERE se.series_id = es.id))::FLOAT as avg_ex,
      COUNT(DISTINCT CASE 
        WHEN (
          SELECT COUNT(*) != COUNT(DISTINCT exercise_id) 
          FROM series_exercises se 
          WHERE se.series_id = es.id
        ) THEN es.id 
      END) as dupes,
      MAX((
        SELECT MAX(jaccard_similarity(
          (SELECT ARRAY_AGG(se1.exercise_id) FROM series_exercises se1 WHERE se1.series_id = es1.id),
          (SELECT ARRAY_AGG(se2.exercise_id) FROM series_exercises se2 WHERE se2.series_id = es2.id)
        ))
        FROM exercise_series es1, exercise_series es2
        WHERE es1.category_slug = es.category_slug
        AND es2.category_slug = es.category_slug
        AND es1.id < es2.id
      )) as max_sim,
      AVG((
        SELECT AVG(jaccard_similarity(
          (SELECT ARRAY_AGG(se1.exercise_id) FROM series_exercises se1 WHERE se1.series_id = es1.id),
          (SELECT ARRAY_AGG(se2.exercise_id) FROM series_exercises se2 WHERE se2.series_id = es2.id)
        ))
        FROM exercise_series es2
        WHERE es2.category_slug = es.category_slug
        AND es2.id != es1.id
      )) as avg_sim,
      (
        SELECT jsonb_agg(jsonb_build_object('slug', e.slug, 'count', cnt))
        FROM (
          SELECT e2.slug, COUNT(*) as cnt
          FROM series_exercises se
          JOIN exercises e2 ON e2.id = se.exercise_id
          WHERE se.series_id IN (SELECT id FROM exercise_series WHERE category_slug = es.category_slug)
          GROUP BY e2.slug
          ORDER BY cnt DESC
          LIMIT 5
        ) e
      ) as top_ex
    FROM exercise_series es
    WHERE (p_category_slug IS NULL OR es.category_slug = p_category_slug)
    GROUP BY es.category_slug
  )
  SELECT 
    cs.category_slug,
    cs.series_count,
    cs.avg_ex,
    cs.dupes,
    COALESCE(cs.max_sim, 0.0),
    COALESCE(cs.avg_sim, 0.0),
    cs.top_ex
  FROM category_stats cs
  ORDER BY cs.category_slug;
END;
$$;