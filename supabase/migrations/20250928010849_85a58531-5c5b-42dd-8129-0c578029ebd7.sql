-- Limpar dados existentes para começar fresh
DELETE FROM series_exercises;
DELETE FROM exercise_series;

-- Criar séries coerentes para cada categoria

-- 1. CROSSFIT (exercícios funcionais/HIIT/alta intensidade)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('crossfit-wod-iniciante', 'WOD Iniciante', 'Workout of the Day para quem está começando no CrossFit com movimentos básicos', 'crossfit', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('crossfit-amrap-15min', 'AMRAP 15 Minutos', 'As Many Rounds As Possible em 15 minutos para condicionamento intenso', 'crossfit', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'),
('crossfit-emom-power', 'EMOM Power', 'Every Minute On the Minute focado em força e potência', 'crossfit', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800');

-- 2. SÉRIES PARA EMAGRECER RÁPIDO (cardio/HIIT/alta densidade)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('queima-gordura-hiit', 'HIIT Queima Gordura', 'Treino intervalado de alta intensidade para máxima queima calórica', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('cardio-intenso-20min', 'Cardio Intenso 20min', 'Circuito cardiovascular de 20 minutos para acelerar o metabolismo', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('fat-burn-circuit', 'Fat Burn Circuit', 'Circuito completo para queimar gordura e tonificar músculos', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- 3. ACADEMIA INICIANTES (básicos, baixa complexidade)  
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('musculacao-basica', 'Musculação Básica', 'Fundamentos da musculação com exercícios essenciais para desenvolvimento muscular', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('iniciante-corpo-todo', 'Iniciante Corpo Todo', 'Treino completo para iniciantes trabalhando todos os grupos musculares', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('primeiros-passos-gym', 'Primeiros Passos na Academia', 'Sequência perfeita para quem nunca treinou na academia', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- 4. ACADEMIA CONDICIONAMENTO (resistência/cardio/intervalado)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('condicionamento-aerobico', 'Condicionamento Aeróbico', 'Treino focado em melhorar resistência cardiovascular e respiratória', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('resistencia-muscular', 'Resistência Muscular', 'Exercícios para aumentar a resistência e durabilidade dos músculos', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800');

-- 5. ACADEMIA FISIOCULTURISMO (hipertrofia/grupos musculares)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('hipertrofia-peito-triceps', 'Hipertrofia Peito & Tríceps', 'Treino focado no desenvolvimento do peitoral e tríceps para ganho de massa', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('costas-biceps-mass', 'Costas & Bíceps Mass', 'Série para desenvolvimento das costas e bíceps com foco em hipertrofia', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('pernas-gluteos-power', 'Pernas & Glúteos Power', 'Treino intenso para membros inferiores visando máximo ganho muscular', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- 6. GANHO DE MASSA MUSCULAR
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('massa-muscular-total', 'Massa Muscular Total', 'Programa completo para ganho de massa em todos os grupos musculares', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('bulk-season-basics', 'Bulk Season Básico', 'Fundamentos para quem quer ganhar massa muscular de forma eficiente', 'series-para-ganho-de-massa-muscular', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800');

-- 7. TREINOS EM CASA SEM EQUIPAMENTO (peso corporal)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('casa-peso-corporal', 'Treino em Casa - Peso Corporal', 'Exercícios usando apenas o peso do corpo, perfeito para casa', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('hiit-casa-20min', 'HIIT em Casa 20min', 'Treino HIIT de 20 minutos sem necessidade de equipamentos', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('bodyweight-challenge', 'Bodyweight Challenge', 'Desafio usando apenas peso corporal para tonificar e fortalecer', 'treinos-em-casa-sem-equipamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- 8. PILATES SEM EQUIPAMENTOS (core/postura/controle)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('pilates-mat-basico', 'Pilates Mat Básico', 'Exercícios de Pilates no solo para fortalecimento do core e postura', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('pilates-flexibilidade', 'Pilates & Flexibilidade', 'Sequência de Pilates focada em flexibilidade e alongamento profundo', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1506629905233-7529a37ce724?w=800'),
('core-pilates-power', 'Core Pilates Power', 'Pilates avançado para fortalecimento intenso do abdome e core', 'treino-de-pilates-sem-equipamentos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800');

-- 9. FUNCIONAL 15 MINUTOS (circuitos curtos)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('funcional-15-express', 'Funcional Express 15min', 'Treino funcional completo em apenas 15 minutos', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('quick-burn-15', 'Quick Burn 15min', 'Circuito de queima rápida para quem tem pouco tempo', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('morning-boost-15', 'Morning Boost 15min', 'Treino matinal energizante para começar bem o dia', 'funcional-de-15-minutos', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- 10. CALISTENIA (dominadas, flexões, pranchas)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('calistenia-iniciante', 'Calistenia Iniciante', 'Movimentos básicos de calistenia para desenvolver força corporal', 'calistenia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('calistenia-intermediario', 'Calistenia Intermediário', 'Progressões intermediárias para evoluir na calistenia', 'calistenia', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('street-workout', 'Street Workout', 'Treino de rua com exercícios avançados de calistenia', 'calistenia', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');