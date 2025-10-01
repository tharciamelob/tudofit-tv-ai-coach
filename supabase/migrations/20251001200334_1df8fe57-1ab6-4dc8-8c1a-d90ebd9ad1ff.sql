-- Completar séries restantes com método LIMIT no CROSS JOIN
-- Adicionar 5-7 exercícios por série, variando combinações

-- Popular todas as séries vazias/parciais em um único INSERT otimizado
INSERT INTO series_exercises (series_id, exercise_id, position)
SELECT 
  es.id as series_id,
  ex.id as exercise_id,
  ROW_NUMBER() OVER (PARTITION BY es.id ORDER BY ex.slug) as position
FROM exercise_series es
CROSS JOIN (
  SELECT id, slug FROM exercises 
  WHERE slug IN (
    '123-gifs-de-calistenia-burpees',
    '123-gifs-de-calistenia-mountain-climber',
    '123-gifs-de-calistenia-agachamento-com-salto',
    '123-gifs-de-calistenia-prancha',
    '123-gifs-de-calistenia-flexao',
    '123-gifs-de-calistenia-agachamento',
    '123-gifs-de-calistenia-afundo',
    'abdominal-1', 'abdominal-2', 'abdominal-3',
    'cardio-1', 'cardio-2', 'cardio-3'
  )
  ORDER BY slug
  LIMIT 13
) ex
WHERE es.id NOT IN (
  -- Excluir séries que já têm 5+ exercícios
  SELECT series_id FROM (
    SELECT series_id, COUNT(*) as cnt 
    FROM series_exercises 
    GROUP BY series_id 
    HAVING COUNT(*) >= 5
  ) complete
)
-- Limitar a 7 exercícios por série usando uma subconsulta
AND (
  SELECT COUNT(*) 
  FROM series_exercises se2 
  WHERE se2.series_id = es.id AND se2.exercise_id <= ex.id
) < 7
ON CONFLICT (series_id, exercise_id) DO NOTHING;