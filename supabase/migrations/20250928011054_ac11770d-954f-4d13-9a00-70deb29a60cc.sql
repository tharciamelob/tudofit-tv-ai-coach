-- Resolver problemas de segurança - habilitar RLS apenas nas tabelas (não views)
ALTER TABLE exercise_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_stage ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público para leitura (já que são dados de exercícios)
CREATE POLICY "Public read access to exercise_series" ON exercise_series FOR SELECT USING (true);
CREATE POLICY "Public read access to series_exercises" ON series_exercises FOR SELECT USING (true); 
CREATE POLICY "Public read access to exercise_stage" ON exercise_stage FOR SELECT USING (true);