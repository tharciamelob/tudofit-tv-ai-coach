-- Criar séries adicionais para atingir pelo menos 10 por categoria

-- CROSSFIT (já temos 3, criar mais 7)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('crossfit-murph-scaled', 'Murph Scaled', 'Versão adaptada do famoso WOD Murph para todos os níveis de condicionamento', 'crossfit', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('crossfit-tabata-power', 'Tabata Power', 'Protocolo Tabata aplicado aos movimentos funcionais do CrossFit', 'crossfit', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'),
('crossfit-strength-basics', 'Strength & Basics', 'Fundamentos de força combinados com movimentos funcionais', 'crossfit', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800'),
('crossfit-cardio-blast', 'Cardio Blast WOD', 'WOD focado em condicionamento cardiovascular extremo', 'crossfit', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('crossfit-hero-workout', 'Hero Workout Lite', 'Versão simplificada dos Hero Workouts para desenvolvimento', 'crossfit', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'),
('crossfit-competition-prep', 'Competition Prep', 'Treino preparatório para competições de CrossFit', 'crossfit', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800'),
('crossfit-metabolic-mayhem', 'Metabolic Mayhem', 'Chaos metabólico com movimentos funcionais intensos', 'crossfit', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- SÉRIES PARA EMAGRECER RÁPIDO (já temos 3, criar mais 7)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('emagrecer-metabolic-boost', 'Metabolic Boost', 'Treino metabólico para acelerar a queima calórica por horas', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('emagrecer-afterburn-effect', 'Afterburn Effect', 'HIIT projetado para maximizar o efeito pós-exercício', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('emagrecer-tabata-extreme', 'Tabata Extreme', 'Protocolo Tabata intenso para queima máxima de gordura', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('emagrecer-cardio-strength', 'Cardio + Strength', 'Combinação perfeita de cardio e fortalecimento muscular', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('emagrecer-morning-burn', 'Morning Fat Burn', 'Treino matinal para ativar o metabolismo o dia todo', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('emagrecer-interval-inferno', 'Interval Inferno', 'Intervalos infernais para derretimento de gordura', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('emagrecer-body-blast', 'Full Body Blast', 'Explosão de corpo inteiro para queima total de calorias', 'series-para-emagrecer-rapido', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800');

-- ACADEMIA INICIANTES (já temos 3, criar mais 7)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('iniciante-upper-body', 'Upper Body Basics', 'Fundamentos para desenvolvimento da parte superior', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('iniciante-lower-body', 'Lower Body Foundation', 'Base sólida para treino de membros inferiores', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('iniciante-core-stability', 'Core & Stability', 'Fortalecimento do core para iniciantes', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('iniciante-flexibility-strength', 'Flexibility & Strength', 'Combinação de flexibilidade e fortalecimento', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('iniciante-confidence-builder', 'Confidence Builder', 'Treino para ganhar confiança na academia', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('iniciante-progressive-challenge', 'Progressive Challenge', 'Desafio progressivo para evolução constante', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('iniciante-functional-intro', 'Functional Intro', 'Introdução aos movimentos funcionais', 'series-de-academia-iniciantes', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800');

-- ACADEMIA CONDICIONAMENTO (já temos 2, criar mais 8)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('condicionamento-hiit-advanced', 'HIIT Advanced', 'HIIT avançado para condicionamento superior', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('condicionamento-endurance-power', 'Endurance Power', 'Resistência e potência em um treino completo', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('condicionamento-circuit-training', 'Circuit Training Pro', 'Circuito profissional para condicionamento total', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('condicionamento-vo2-max', 'VO2 Max Booster', 'Treino específico para melhorar VO2 máximo', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('condicionamento-lactate-threshold', 'Lactate Threshold', 'Trabalho no limiar de lactato', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('condicionamento-sports-specific', 'Sports Specific', 'Condicionamento específico para esportes', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
('condicionamento-interval-mastery', 'Interval Mastery', 'Dominando os intervalos para condicionamento', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('condicionamento-warrior-workout', 'Warrior Workout', 'Treino de guerreiro para condicionamento extremo', 'series-de-academia-condicionamento', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800');

-- ACADEMIA FISIOCULTURISMO (já temos 3, criar mais 7)
INSERT INTO exercise_series (slug, name, description, category_slug, cover_url) VALUES
('fisio-ombros-trapezio', 'Ombros & Trapézio Mass', 'Desenvolvimento massivo de ombros e trapézio', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('fisio-bracos-explosivos', 'Braços Explosivos', 'Hipertrofia extrema para bíceps e tríceps', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('fisio-core-definicao', 'Core Definition', 'Definição abdominal para fisiculturistas', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('fisio-cutting-phase', 'Cutting Phase', 'Treino para fase de definição e corte', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'),
('fisio-bulking-season', 'Bulking Season', 'Hipertrofia máxima para ganho de massa', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'),
('fisio-symmetry-builder', 'Symmetry Builder', 'Construção de simetria corporal', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
('fisio-competition-prep', 'Competition Prep', 'Preparação para competições de fisiculturismo', 'series-de-academia-fisioculturismo', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800');