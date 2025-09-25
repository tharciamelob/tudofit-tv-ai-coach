-- exercícios
create table if not exists exercises (
  id uuid primary key,
  name text not null,
  slug text unique not null,
  media_url text not null,
  media_type text default 'gif',
  -- metadados simples (opcionais)
  level text,              -- iniciante / intermediario / avancado
  equipment text,          -- nenhum / halteres / barra / corda / elastico / etc
  modality text,           -- cardio / hiit / crossfit / pilates / yoga / funcional / calistenia / bodybuilding
  primary_muscle text,     -- pernas / peito / costas / core / ombro / biceps / triceps / etc
  reps int,
  sets int,
  duration_seconds int,
  source_category text,    -- nome da pasta-mãe (ex.: "Bíceps", "Cardio")
  source_subdir text       -- subpasta do exercício (quando existir)
);

-- tags livres (chave-valor) por exercício (flexível)
create table if not exists exercise_tags (
  exercise_slug text not null,
  tag_key text not null,
  tag_value text not null,
  primary key (exercise_slug, tag_key, tag_value)
);

-- categorias exibidas no app (o que você listou)
create table if not exists app_categories (
  slug text primary key,
  title text not null
);

-- regras de seleção de exercícios por categoria (todas as condições devem bater)
create table if not exists category_rules (
  category_slug text not null,
  rule_id bigserial primary key,
  require_modality text[],   -- ex: ARRAY['hiit','cardio']
  require_level text[],      -- ex: ARRAY['iniciante']
  require_equipment text[],  -- ex: ARRAY['nenhum']
  require_tags jsonb         -- ex: {"goal":["emagrecimento"]}
);

-- popular categorias
insert into app_categories (slug, title) values
('series-para-emagrecer-rapido','Séries para emagrecer rápido'),
('crossfit','Crossfit'),
('series-de-academia-iniciantes','Séries de academia - iniciantes'),
('series-de-academia-condicionamento','Séries de academia - condicionamento'),
('series-de-academia-fisioculturismo','Séries de academia - fisioculturismo'),
('series-para-ganho-de-massa-muscular','Séries para ganho de massa muscular'),
('treinos-em-casa-sem-equipamento','Treinos em casa - sem equipamento'),
('treino-de-pilates-sem-equipamentos','Treino de pilates - sem equipamentos'),
('treinos-yoga','Treinos yoga'),
('funcional-de-15-minutos','Funcional de 15 minutos'),
('calistenia','Calistenia')
on conflict (slug) do nothing;

-- REGRAS (ajuste se quiser; já cobre 90% dos casos)
-- Emagrecer rápido: HIIT/cardio/funcional, intensidade alta
insert into category_rules (category_slug, require_modality, require_tags)
values ('series-para-emagrecer-rapido', ARRAY['hiit','cardio','funcional'], '{"goal":["emagrecimento","perda-de-gordura"]}'::jsonb);

-- Crossfit
insert into category_rules (category_slug, require_modality)
values ('crossfit', ARRAY['crossfit']);

-- Iniciantes
insert into category_rules (category_slug, require_level)
values ('series-de-academia-iniciantes', ARRAY['iniciante']);

-- Condicionamento: cardio/funcional + tag condicionamento
insert into category_rules (category_slug, require_modality, require_tags)
values ('series-de-academia-condicionamento', ARRAY['cardio','funcional'], '{"goal":["condicionamento","resistencia"]}'::jsonb);

-- Fisiculturismo (bodybuilding): foco isolamento/hipertrofia
insert into category_rules (category_slug, require_modality, require_tags)
values ('series-de-academia-fisioculturismo', ARRAY['bodybuilding'], '{"goal":["hipertrofia","isolamento"]}'::jsonb);

-- Ganho de massa: hipertrofia
insert into category_rules (category_slug, require_tags)
values ('series-para-ganho-de-massa-muscular', '{"goal":["hipertrofia","ganho-de-massa"]}'::jsonb);

-- Em casa sem equipamento
insert into category_rules (category_slug, require_equipment)
values ('treinos-em-casa-sem-equipamento', ARRAY['nenhum']);

-- Pilates sem equipamentos
insert into category_rules (category_slug, require_modality, require_equipment)
values ('treino-de-pilates-sem-equipamentos', ARRAY['pilates'], ARRAY['nenhum']);

-- Yoga
insert into category_rules (category_slug, require_modality)
values ('treinos-yoga', ARRAY['yoga']);

-- Funcional 15 min (usaremos tag tempo=15)
insert into category_rules (category_slug, require_modality, require_tags)
values ('funcional-de-15-minutos', ARRAY['funcional'], '{"tempo":["15"]}'::jsonb);

-- Calistenia (bodyweight)
insert into category_rules (category_slug, require_modality)
values ('calistenia', ARRAY['calistenia']);