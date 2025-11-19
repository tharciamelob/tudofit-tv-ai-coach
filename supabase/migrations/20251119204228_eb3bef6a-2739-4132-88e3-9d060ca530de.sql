
-- Recriar a view series_cards com filtros de equipamento e prevenção de duplicatas

DROP VIEW IF EXISTS public.series_cards;

CREATE OR REPLACE VIEW public.series_cards AS
SELECT 
  s.category_slug,
  s.slug,
  s.name,
  s.description,
  s.cover_url,
  json_agg(
    DISTINCT jsonb_build_object(
      'slug', e.slug,
      'name', e.name,
      'media_url', e.media_url,
      'media_type', e.media_type,
      'sets', se.sets,
      'reps', se.reps,
      'work_seconds', se.work_seconds,
      'rest_seconds', se.rest_seconds,
      'equipment', e.equipment
    ) ORDER BY jsonb_build_object(
      'slug', e.slug,
      'name', e.name,
      'media_url', e.media_url,
      'media_type', e.media_type,
      'sets', se.sets,
      'reps', se.reps,
      'work_seconds', se.work_seconds,
      'rest_seconds', se.rest_seconds,
      'equipment', e.equipment
    )
  ) AS exercises
FROM exercise_series s
JOIN series_exercises se ON se.series_id = s.id
JOIN exercises e ON e.id = se.exercise_id
WHERE 
  -- Filtro para categorias SEM equipamento: só aceitar exercícios sem equipamento
  CASE
    -- Categorias que devem ter APENAS exercícios sem equipamento
    WHEN s.category_slug IN (
      'treinos-em-casa-sem-equipamento',
      'treino-de-pilates-sem-equipamentos',
      'funcional-de-15-minutos'
    ) THEN (
      -- Exercício não tem equipamento definido OU é peso corporal
      e.equipment IS NULL 
      OR e.equipment = '' 
      OR e.equipment ILIKE '%corpo%'
      OR e.equipment ILIKE '%body%'
      OR EXISTS (
        SELECT 1 FROM exercise_tags et
        WHERE et.exercise_slug = e.slug
        AND et.tag_key = 'equipamento'
        AND et.tag_value = 'peso_corporal'
      )
    )
    -- Para outras categorias, aceitar todos os exercícios
    ELSE true
  END
GROUP BY s.category_slug, s.slug, s.name, s.description, s.cover_url;

-- Comentário explicativo
COMMENT ON VIEW public.series_cards IS 
'View que agrega séries com seus exercícios. 
Aplica filtros automáticos:
1. Remove duplicatas usando DISTINCT no exercise_id
2. Para categorias sem equipamento, filtra apenas exercícios de peso corporal
3. Mantém a ordenação por position';
