-- Adicionar exercícios coerentes para cada série criada

-- CROSSFIT - Exercícios funcionais/HIIT/alta intensidade
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-wod-iniciante'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-agachamento-com-salto',
  '123-gifs-de-calistenia-flexao-de-braco',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-mountain-climber',
  '123-gifs-de-calistenia-burpees',
  '123-gifs-de-calistenia-afundo'
);

INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-amrap-15min'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-burpees',
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-flexao-diamante',
  '123-gifs-de-calistenia-prancha-lateral',
  '123-gifs-de-calistenia-agachamento-com-salto',
  '123-gifs-de-calistenia-mountain-climber'
);

INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-emom-power'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-pull-up',
  '123-gifs-de-calistenia-flexao-de-braco',
  '123-gifs-de-calistenia-agachamento-pistola',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-dips'
);

-- SÉRIES PARA EMAGRECER RÁPIDO - Cardio/HIIT
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'queima-gordura-hiit'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-1', 'cardio-2', 'cardio-3', 'cardio-4', 'cardio-5',
  '123-gifs-de-calistenia-burpees',
  '123-gifs-de-calistenia-mountain-climber'
);

INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'cardio-intenso-20min'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-6', 'cardio-7', 'cardio-8', 'cardio-9', 'cardio-10',
  '123-gifs-de-calistenia-agachamento-com-salto'
);

INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'fat-burn-circuit'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-11', 'cardio-12', 
  '123-gifs-de-calistenia-burpees',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-mountain-climber',
  'abdominal-1', 'abdominal-2'
);

-- ACADEMIA INICIANTES - Básicos/baixa complexidade
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'musculacao-basica'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-flexao-de-braco',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-afundo',
  '123-gifs-de-calistenia-remada-invertida'
);

INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'iniciante-corpo-todo'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'abdominal-1', 'abdominal-2', 'abdominal-3',
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-flexao-de-braco',
  '123-gifs-de-calistenia-prancha'
);

-- CALISTENIA - Dominadas, flexões, pranchas
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'calistenia-iniciante'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-flexao-de-braco',
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-afundo',
  '123-gifs-de-calistenia-flexao-diamante'
);

INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'calistenia-intermediario'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-pull-up',
  '123-gifs-de-calistenia-agachamento-pistola',
  '123-gifs-de-calistenia-handstand',
  '123-gifs-de-calistenia-dips',
  '123-gifs-de-calistenia-muscle-up'
);

-- TREINOS EM CASA SEM EQUIPAMENTO
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'casa-peso-corporal'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-flexao-de-braco',
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-mountain-climber',
  '123-gifs-de-calistenia-afundo',
  'abdominal-1'
);

-- FUNCIONAL 15 MINUTOS
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'funcional-15-express'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-burpees',
  '123-gifs-de-calistenia-agachamento-com-salto',
  '123-gifs-de-calistenia-mountain-climber',
  '123-gifs-de-calistenia-prancha',
  '123-gifs-de-calistenia-flexao-de-braco'
);

-- Adicionar mais exercícios para completar outras séries onde necessário
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'primeiros-passos-gym'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'abdominal-5', 'abdominal-6', 'abdominal-7',
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-flexao-de-braco'
) LIMIT 5;