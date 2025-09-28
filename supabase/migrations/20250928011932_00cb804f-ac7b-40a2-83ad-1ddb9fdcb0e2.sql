-- Continuar criando séries para as categorias restantes

-- GANHO DE MASSA MUSCULAR (já temos 2, criar mais 8)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('massa-upper-hypertrophy', 'Upper Hypertrophy', 'Hipertrofia focada na parte superior do corpo', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('massa-lower-power', 'Lower Power Mass', 'Ganho de massa explosivo para membros inferiores', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('massa-compound-movements', 'Compound Mass Builder', 'Movimentos compostos para ganho máximo de massa', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('massa-progressive-overload', 'Progressive Overload', 'Sobrecarga progressiva para crescimento muscular', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('massa-strength-size', 'Strength & Size', 'Combinação de força e volume muscular', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('massa-metabolic-muscle', 'Metabolic Muscle', 'Ganho de massa com componente metabólico', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('massa-density-training', 'Density Training', 'Treino de densidade para ganho muscular', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('massa-volume-blaster', 'Volume Blaster', 'Alto volume para explosão de crescimento', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800');

-- TREINOS EM CASA SEM EQUIPAMENTO (já temos 3, criar mais 7)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('casa-morning-energy', 'Morning Energy Boost', 'Energia matinal usando apenas peso corporal', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('casa-evening-burn', 'Evening Fat Burn', 'Queima noturna sem equipamentos', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('casa-full-body-flow', 'Full Body Flow', 'Fluxo completo de corpo inteiro em casa', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('casa-strength-endurance', 'Strength Endurance', 'Força e resistência sem equipamentos', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('casa-tabata-home', 'Tabata Home Edition', 'Protocolo Tabata adaptado para casa', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('casa-minimal-space', 'Minimal Space Maximum', 'Máximos resultados em espaço mínimo', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('casa-living-room-warrior', 'Living Room Warrior', 'Guerreiro da sala de estar', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- PILATES SEM EQUIPAMENTOS (já temos 3, criar mais 7)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('pilates-posture-perfect', 'Posture Perfect', 'Pilates para correção postural perfeita', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('pilates-core-intensive', 'Core Intensive', 'Treino intensivo de core com Pilates', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1506629905233-7529a37ce724?w=800'),
('pilates-mind-body', 'Mind-Body Connection', 'Conexão mente-corpo através do Pilates', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('pilates-balance-stability', 'Balance & Stability', 'Equilíbrio e estabilidade com Pilates', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1506629905233-7529a37ce724?w=800'),
('pilates-strength-flow', 'Strength Flow', 'Fluxo de força com movimentos de Pilates', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('pilates-rehabilitation', 'Rehabilitation Focus', 'Pilates com foco em reabilitação', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1506629905233-7529a37ce724?w=800'),
('pilates-advanced-flow', 'Advanced Flow', 'Fluxo avançado de Pilates no solo', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800');

-- FUNCIONAL 15 MINUTOS (já temos 3, criar mais 7)  
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('funcional-power-packed', 'Power Packed 15', 'Potência máxima em 15 minutos funcionais', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('funcional-lunch-break', 'Lunch Break Blast', 'Explosão funcional no horário do almoço', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('funcional-after-work', 'After Work Energy', 'Energia pós-trabalho em 15 minutos', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('funcional-weekend-warrior', 'Weekend Warrior', 'Guerreiro de fim de semana - versão express', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('funcional-travel-ready', 'Travel Ready', 'Funcional para viagens e espaços limitados', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('funcional-hiit-fusion', 'HIIT Fusion 15', 'Fusão de HIIT e funcional em 15 minutos', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('funcional-metabolic-15', 'Metabolic Madness 15', 'Loucura metabólica em 15 minutos', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- CALISTENIA (já temos 3, criar mais 7)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('calistenia-pull-mastery', 'Pull Movement Mastery', 'Dominando os movimentos de puxada', 'calistenia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('calistenia-push-power', 'Push Power Progression', 'Progressão de potência em empurradas', 'calistenia', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('calistenia-core-control', 'Core Control Advanced', 'Controle avançado do core na calistenia', 'calistenia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('calistenia-flexibility-strength', 'Flexibility Strength', 'Flexibilidade e força combinadas', 'calistenia', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('calistenia-handstand-journey', 'Handstand Journey', 'Jornada para dominar a parada de mãos', 'calistenia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('calistenia-muscle-up-prep', 'Muscle-Up Preparation', 'Preparação para o muscle-up perfeito', 'calistenia', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('calistenia-freestyle-flow', 'Freestyle Flow', 'Fluxo livre de movimentos criativos', 'calistenia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');