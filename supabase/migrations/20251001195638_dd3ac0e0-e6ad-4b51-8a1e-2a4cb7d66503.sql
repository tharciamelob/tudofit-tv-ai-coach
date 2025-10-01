-- Popular todas as séries restantes com exercícios reais e coerentes (batch completo)
-- Usando exercícios que realmente existem na base

-- ACADEMIA INICIANTES (completar as 10 séries com 5-10 exercícios cada)
-- Musculação Básica (já tem 5)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'musculacao-basica'), id, ROW_NUMBER() OVER() + 5
FROM exercises WHERE slug IN ('abdominal-1', 'cardio-1') LIMIT 2;

-- Iniciante Corpo Todo (já tem 6)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-corpo-todo'), id, ROW_NUMBER() OVER() + 6
FROM exercises WHERE slug IN ('cardio-2', '123-gifs-de-calistenia-elevacao-de-quadril-com-peso-corporal') LIMIT 2;

-- Primeiros Passos Gym (já tem 5)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'primeiros-passos-gym'), id, ROW_NUMBER() OVER() + 5
FROM exercises WHERE slug IN ('cardio-3', 'abdominal-8') LIMIT 2;

-- Upper Body Basics (0, adicionar 7)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-upper-body'), id, ROW_NUMBER() OVER()
FROM exercises WHERE slug IN (
  '123-gifs-de-calistenia-flexao',
  '123-gifs-de-calistenia-dips-na-cadeira',
  '123-gifs-de-calistenia-elevacao-lateral-com-toalha-na-parede',
  'abdominal-9',
  '123-gifs-de-calistenia-extensao-de-triceps',
  'abdominal-10',
  '123-gifs-de-calistenia-crucifixo-com-trx'
) LIMIT 7;

-- Lower Body Foundation (0, adicionar 6)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-lower-body'), id, ROW_NUMBER() OVER()
FROM exercises WHERE slug IN (
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-afundo',
  '123-gifs-de-calistenia-elevacao-de-panturrilha-em-pe',
  '123-gifs-de-calistenia-elevacao-de-quadril-com-peso-corporal',
  'abdominal-11',
  'cardio-4'
) LIMIT 6;

-- Core & Stability (0, adicionar 8)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-core-stability'), id, ROW_NUMBER() OVER()
FROM exercises WHERE slug IN (
  'abdominal-1', 'abdominal-2', 'abdominal-3', 'abdominal-4',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-prancha-lateral',
  'abdominal-5',
  '123-gifs-de-calistenia-elevacao-pelvica-declinado'
) LIMIT 8;

-- Flexibility & Strength (0, adicionar 6)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-flexibility-strength'), id, ROW_NUMBER() OVER()
FROM exercises WHERE slug IN (
  '123-gifs-de-calistenia-alongamento-do-peitoral-reverso',
  '123-gifs-de-calistenia-agachamento',
  'abdominal-12',
  '123-gifs-de-calistenia-flexao',
  'cardio-5',
  '123-gifs-de-calistenia-prancha'
) LIMIT 6;

-- Confidence Builder (0, adicionar 5)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-confidence-builder'), id, ROW_NUMBER() OVER()
FROM exercises WHERE slug IN (
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-flexao-joelho',
  'abdominal-13',
  '123-gifs-de-calistenia-afundo',
  'cardio-6'
) LIMIT 5;

-- Progressive Challenge (0, adicionar 7)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-progressive-challenge'), id, ROW_NUMBER() OVER()
FROM exercises WHERE slug IN (
  '123-gifs-de-calistenia-agachamento-no-banco-com-peso-corporal',
  '123-gifs-de-calistenia-flexao',
  'abdominal-14',
  '123-gifs-de-calistenia-afundo-no-banco',
  'cardio-7',
  'abdominal-15',
  '123-gifs-de-calistenia-prancha'
) LIMIT 7;

-- Functional Intro (0, adicionar 8)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT (SELECT id FROM exercise_series WHERE slug = 'iniciante-functional-intro'), id, ROW_NUMBER() OVER()
FROM exercises WHERE slug IN (
  '123-gifs-de-calistenia-agachamento-com-salto',
  '123-gifs-de-calistenia-burpees',
  'abdominal-16',
  '123-gifs-de-calistenia-mountain-climber',
  'cardio-8',
  '123-gifs-de-calistenia-prancha',
  'abdominal-17',
  '123-gifs-de-calistenia-andar-de-pato'
) LIMIT 8;