-- Add category column to foods table
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS category TEXT;

-- Add comment explaining the categories
COMMENT ON COLUMN public.foods.category IS 'Categoria nutricional: fruta, legume_vegetal, grao_cereal, tuberculo, proteina_animal, proteina_vegetal, laticinio, oleaginosa_semente, bebida, doce_sobremesa, outros';