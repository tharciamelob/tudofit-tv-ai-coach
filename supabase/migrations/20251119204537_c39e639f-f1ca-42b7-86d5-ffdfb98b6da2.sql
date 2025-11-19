
-- Refinar ainda mais o filtro para excluir exercícios com equipamento mencionado no nome

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
      'funcional-de-15-minutos',
      'calistenia'
    ) THEN (
      -- Exercício não tem equipamento definido E não menciona equipamento no nome
      (e.equipment IS NULL OR e.equipment = '' OR e.equipment ILIKE '%corpo%' OR e.equipment ILIKE '%body%')
      AND NOT (
        -- Excluir se mencionar equipamentos no nome
        e.name ILIKE '%halter%'
        OR e.name ILIKE '%barra%'
        OR e.name ILIKE '%kettlebell%'
        OR e.name ILIKE '%anilha%'
        OR e.name ILIKE '%máquina%'
        OR e.name ILIKE '%cabo%'
        OR e.name ILIKE '%polia%'
        OR e.name ILIKE '%smith%'
        OR e.name ILIKE '%leg press%'
        OR e.name ILIKE '%aparelho%'
        OR e.name ILIKE '%faixa%'
        OR e.name ILIKE '%elástic%'
        OR e.name ILIKE '%band%'
        OR e.name ILIKE '%bola%'
        OR e.name ILIKE '%ball%'
        OR e.name ILIKE '%caixa%'
        OR e.name ILIKE '%box%'
        OR e.name ILIKE '%step%'
        OR e.name ILIKE '%banco%'
        OR e.name ILIKE '%bench%'
        OR e.name ILIKE '%medicine ball%'
        OR e.name ILIKE '%slam ball%'
        OR e.name ILIKE '%wall ball%'
        OR e.name ILIKE '%rope%'
        OR e.name ILIKE '%corda%'
        OR e.name ILIKE '%anel%'
        OR e.name ILIKE '%ring%'
        OR e.name ILIKE '%trx%'
        OR e.name ILIKE '%suspens%'
      )
      AND (
        -- Aceitar apenas se for peso corporal nas tags OU não tiver tag de equipamento diferente
        EXISTS (
          SELECT 1 FROM exercise_tags et
          WHERE et.exercise_slug = e.slug
          AND et.tag_key = 'equipamento'
          AND et.tag_value = 'peso_corporal'
        )
        OR NOT EXISTS (
          SELECT 1 FROM exercise_tags et
          WHERE et.exercise_slug = e.slug
          AND et.tag_key = 'equipamento'
          AND et.tag_value != 'peso_corporal'
        )
      )
    )
    -- Para outras categorias, aceitar todos os exercícios
    ELSE true
  END
GROUP BY s.category_slug, s.slug, s.name, s.description, s.cover_url;

-- Comentário explicativo atualizado
COMMENT ON VIEW public.series_cards IS 
'View que agrega séries com seus exercícios. 
Aplica filtros automáticos:
1. Remove duplicatas usando DISTINCT no jsonb completo do exercício
2. Para categorias sem equipamento, filtra RIGOROSAMENTE:
   - Exclui se equipment não é NULL/vazio/corpo/body
   - Exclui se o nome menciona qualquer equipamento (halteres, faixas, bolas, caixas, etc)
   - Aceita apenas se tem tag peso_corporal OU não tem tag de equipamento diferente
3. Mantém outras categorias com todos os exercícios disponíveis';
