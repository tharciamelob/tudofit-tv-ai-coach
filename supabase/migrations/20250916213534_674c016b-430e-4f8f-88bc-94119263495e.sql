-- Atualizar tabela food_diary para aceitar meal_types em PT e EN
-- Remover qualquer constraint existente e adicionar a nova
ALTER TABLE food_diary DROP CONSTRAINT IF EXISTS food_diary_meal_type_check;

-- Adicionar nova constraint para aceitar meal_types PT e EN
ALTER TABLE food_diary ADD CONSTRAINT food_diary_meal_type_check 
CHECK (meal_type IN (
  'cafe_da_manha', 'almoco', 'jantar', 'lanche', 'pre_treino', 'pos_treino',
  'breakfast', 'lunch', 'dinner', 'snack'
));

-- Adicionar coluna item_name se não existir
ALTER TABLE food_diary ADD COLUMN IF NOT EXISTS item_name text;