-- Vamos inserir exercícios nas séries de forma mais simples
-- Primeiro pegamos os IDs das séries criadas
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'treino-queima-gordura'),
  id,
  1
FROM exercises WHERE slug = 'abdominal-1'
UNION ALL
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'treino-queima-gordura'),
  id,
  2
FROM exercises WHERE slug = 'cardio-1'
UNION ALL
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'treino-queima-gordura'),
  id,
  3
FROM exercises WHERE slug = 'abdominal-10'
UNION ALL
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-iniciante'),
  id,
  1
FROM exercises WHERE slug = 'cardio-10'
UNION ALL
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'crossfit-iniciante'),
  id,
  2
FROM exercises WHERE slug = 'abdominal-11'
UNION ALL
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'musculacao-basica'),
  id,
  1
FROM exercises WHERE slug = 'cardio-11'
UNION ALL
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'hiit-casa'),
  id,
  1
FROM exercises WHERE slug = 'abdominal-12'
UNION ALL
SELECT 
  (SELECT id FROM exercise_series WHERE slug = 'yoga-relaxamento'),
  id,
  1
FROM exercises WHERE slug = 'cardio-12';