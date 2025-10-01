-- Popular séries EMAGRECER RÁPIDO com cardio/HIIT (5-12 exercícios cada)

-- HIIT QUEIMA GORDURA (já tem 7 exercícios, adicionar mais 1)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'queima-gordura-hiit'),
  exercises.id,
  8
FROM exercises 
WHERE exercises.slug = 'abdominal-12'
LIMIT 1;

-- CARDIO INTENSO 20MIN (já tem 6 exercícios, adicionar mais 2)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'cardio-intenso-20min'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug) + 6
FROM exercises 
WHERE exercises.slug IN (
  'abdominal-13',
  '123-gifs-de-calistenia-jump-jacks'
) LIMIT 2;

-- FAT BURN CIRCUIT (já tem 7 exercícios, ok)

-- METABOLIC BOOST (0 exercícios, adicionar 9)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'emagrecer-metabolic-boost'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-burpees',
  'cardio-13',
  '123-gifs-de-calistenia-mountain-climber',
  'abdominal-14',
  '123-gifs-de-calistenia-jump-squat',
  'cardio-14',
  '123-gifs-de-calistenia-high-knees',
  'abdominal-15',
  '123-gifs-de-calistenia-plank-jacks'
) LIMIT 9;

-- AFTERBURN EFFECT (0 exercícios, adicionar 8)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'emagrecer-afterburn-effect'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-15',
  '123-gifs-de-calistenia-sprint-intervals',
  'abdominal-16',
  '123-gifs-de-calistenia-box-jumps',
  'cardio-16',
  '123-gifs-de-calistenia-battle-ropes',
  'abdominal-17',
  '123-gifs-de-calistenia-kettlebell-swings'
) LIMIT 8;

-- TABATA EXTREME (0 exercícios, adicionar 6)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'emagrecer-tabata-extreme'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-burpees',
  '123-gifs-de-calistenia-squat-jumps',
  '123-gifs-de-calistenia-mountain-climber',
  '123-gifs-de-calistenia-jumping-jacks',
  'cardio-17',
  'abdominal-18'
) LIMIT 6;

-- CARDIO + STRENGTH (0 exercícios, adicionar 10)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'emagrecer-cardio-strength'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-18',
  '123-gifs-de-calistenia-push-ups',
  'cardio-19',
  '123-gifs-de-calistenia-squats',
  'abdominal-19',
  '123-gifs-de-calistenia-lunges',
  'cardio-20',
  '123-gifs-de-calistenia-dips',
  'abdominal-20',
  '123-gifs-de-calistenia-planks'
) LIMIT 10;

-- MORNING FAT BURN (0 exercícios, adicionar 7)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'emagrecer-morning-burn'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  '123-gifs-de-calistenia-jumping-jacks',
  'abdominal-21',
  '123-gifs-de-calistenia-high-knees',
  'cardio-21',
  '123-gifs-de-calistenia-arm-circles',
  'abdominal-22',
  '123-gifs-de-calistenia-stretching'
) LIMIT 7;

-- INTERVAL INFERNO (0 exercícios, adicionar 11)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'emagrecer-interval-inferno'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-22',
  '123-gifs-de-calistenia-sprint',
  'abdominal-23',
  '123-gifs-de-calistenia-bike-intervals',
  'cardio-23',
  '123-gifs-de-calistenia-rowing-intervals',
  'abdominal-24',
  '123-gifs-de-calistenia-stair-climber',
  'cardio-24',
  'abdominal-25',
  '123-gifs-de-calistenia-cooldown'
) LIMIT 11;

-- FULL BODY BLAST (0 exercícios, adicionar 12)
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'emagrecer-body-blast'),
  exercises.id,
  ROW_NUMBER() OVER (ORDER BY exercises.slug)
FROM exercises 
WHERE exercises.slug IN (
  'cardio-25',
  '123-gifs-de-calistenia-total-body-1',
  'abdominal-26',
  '123-gifs-de-calistenia-total-body-2',
  'cardio-26',
  '123-gifs-de-calistenia-total-body-3',
  'abdominal-27',
  '123-gifs-de-calistenia-total-body-4',
  'abdominal-28',
  '123-gifs-de-calistenia-total-body-5',
  'abdominal-29',
  '123-gifs-de-calistenia-final-stretch'
) LIMIT 12;