-- Popular séries CROSSFIT com exercícios funcionais/HIIT (5-12 exercícios cada)

-- CROSSFIT WOD INICIANTE (já tem 2, adicionar mais 4)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-wod-iniciante'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug) + 2
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-push-up',
  '123-gifs-de-calistenia-squat-jump',
  '123-gifs-de-calistenia-plank-to-downward-dog',
  'abdominal-1'
) LIMIT 4;

-- CROSSFIT AMRAP 15MIN (já tem 3, adicionar mais 4)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-amrap-15min'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug) + 3
FROM exercises 
WHERE exercises.slug IN (
  'cardio-1',
  '123-gifs-de-calistenia-high-knees',
  'abdominal-2',
  '123-gifs-de-calistenia-plank'
) LIMIT 4;

-- CROSSFIT EMOM POWER (já tem 1, adicionar mais 6)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-emom-power'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug) + 1
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-box-jump',
  'cardio-2',
  '123-gifs-de-calistenia-kettlebell-swing',
  'abdominal-3',
  '123-gifs-de-calistenia-deadlift',
  '123-gifs-de-calistenia-clean-and-jerk'
) LIMIT 6;

-- CROSSFIT MURPH SCALED (0 exercícios, adicionar 8)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-murph-scaled'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-corrida',
  '123-gifs-de-calistenia-pull-up-assistido',
  '123-gifs-de-calistenia-flexao-joelho',
  '123-gifs-de-calistenia-agachamento-ar',
  '123-gifs-de-calistenia-corrida-2',
  'cardio-3',
  'abdominal-4',
  '123-gifs-de-calistenia-stretching'
) LIMIT 8;

-- CROSSFIT TABATA POWER (0 exercícios, adicionar 6)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-tabata-power'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-burpees',
  '123-gifs-de-calistenia-mountain-climber',
  '123-gifs-de-calistenia-jump-squat',
  '123-gifs-de-calistenia-high-knees',
  'cardio-4',
  'abdominal-5'
) LIMIT 6;

-- CROSSFIT STRENGTH BASICS (0 exercícios, adicionar 7)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-strength-basics'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-agachamento',
  '123-gifs-de-calistenia-deadlift',
  '123-gifs-de-calistenia-overhead-press',
  '123-gifs-de-calistenia-pull-up',
  '123-gifs-de-calistenia-dips',
  'abdominal-6',
  '123-gifs-de-calistenia-farmer-walk'
) LIMIT 7;

-- CROSSFIT CARDIO BLAST (0 exercícios, adicionar 8)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-cardio-blast'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-5',
  'cardio-6',
  '123-gifs-de-calistenia-jump-rope',
  '123-gifs-de-calistenia-battle-ropes',
  'cardio-7',
  '123-gifs-de-calistenia-rowing',
  'cardio-8',
  'abdominal-7'
) LIMIT 8;

-- CROSSFIT HERO WORKOUT (0 exercícios, adicionar 9)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-hero-workout'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-corrida',
  '123-gifs-de-calistenia-pull-up',
  '123-gifs-de-calistenia-flexao-de-braco',
  '123-gifs-de-calistenia-agachamento-ar',
  '123-gifs-de-calistenia-thrusters',
  'cardio-9',
  'abdominal-8',
  '123-gifs-de-calistenia-box-step-up',
  '123-gifs-de-calistenia-corrida-final'
) LIMIT 9;

-- CROSSFIT COMPETITION PREP (0 exercícios, adicionar 10)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-competition-prep'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-snatch',
  '123-gifs-de-calistenia-clean-and-jerk',
  '123-gifs-de-calistenia-muscle-up',
  '123-gifs-de-calistenia-handstand-walk',
  '123-gifs-de-calistenia-double-unders',
  '123-gifs-de-calistenia-wall-balls',
  'cardio-10',
  'abdominal-9',
  '123-gifs-de-calistenia-toes-to-bar',
  '123-gifs-de-calistenia-assault-bike'
) LIMIT 10;

-- CROSSFIT METABOLIC MAYHEM (0 exercícios, adicionar 11)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-metabolic-mayhem'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-burpee-box-jump',
  '123-gifs-de-calistenia-devil-press',
  '123-gifs-de-calistenia-man-makers',
  'cardio-11',
  '123-gifs-de-calistenia-turkish-get-up',
  'abdominal-10',
  '123-gifs-de-calistenia-renegade-rows',
  'cardio-12',
  '123-gifs-de-calistenia-bear-crawl',
  'abdominal-11',
  '123-gifs-de-calistenia-sprawls'
) LIMIT 11;