
-- Remover e substituir o exercício de mergulho em calistenia
DO $$
DECLARE
  v_replacement_id UUID;
BEGIN
  -- Encontrar um exercício de substituição válido
  SELECT id INTO v_replacement_id
  FROM exercises
  WHERE has_valid_media = true
    AND equipment_required = false
    AND (equipment IS NULL OR equipment = '')
    AND source_category ILIKE '%funcional%'
    AND name NOT ILIKE '%mergulho%'
    AND name NOT ILIKE '%barra%'
    AND name NOT ILIKE '%halter%'
    AND id NOT IN (
      SELECT exercise_id FROM series_exercises WHERE series_id = 'b4d34756-0e2d-4752-b19e-164f66dbed35'
    )
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Substituir
  UPDATE series_exercises 
  SET exercise_id = v_replacement_id
  WHERE series_id = 'b4d34756-0e2d-4752-b19e-164f66dbed35'
    AND exercise_id = 'fbe28e76-2d9e-416e-8eb3-ee06e7cefaf4';
END $$;
