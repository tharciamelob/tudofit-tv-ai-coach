-- Inserir séries de teste para diferentes categorias
INSERT INTO exercise_series (id, slug, name, description, cover_url, category_slug) VALUES
(gen_random_uuid(), 'treino-queima-gordura', 'Treino Queima Gordura', 'Série intensa de exercícios cardiovasculares para acelerar a queima de gordura e melhorar o condicionamento físico.', null, 'series-para-emagrecer-rapido'),
(gen_random_uuid(), 'crossfit-iniciante', 'CrossFit para Iniciantes', 'Introdução ao CrossFit com movimentos fundamentais e escalabilidade para todos os níveis de condicionamento.', null, 'crossfit'),
(gen_random_uuid(), 'musculacao-basica', 'Musculação Básica', 'Fundamentos da musculação com exercícios essenciais para desenvolvimento muscular equilibrado.', null, 'series-de-academia-iniciantes'),
(gen_random_uuid(), 'hiit-casa', 'HIIT em Casa', 'Treino intervalado de alta intensidade sem necessidade de equipamentos, perfeito para fazer em casa.', null, 'treinos-em-casa-sem-equipamento'),
(gen_random_uuid(), 'yoga-relaxamento', 'Yoga para Relaxamento', 'Sequência de posturas de yoga focadas no relaxamento, flexibilidade e bem-estar mental.', null, 'treinos-yoga');

-- Buscar IDs das séries criadas para relacionar com exercícios
-- Vamos adicionar alguns exercícios às séries usando exercícios existentes da category_exercises