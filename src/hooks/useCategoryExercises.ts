import { supabase } from '@/lib/supabase';

export type CategoryExercise = {
  category_slug: string;
  slug: string;
  name: string | null;
  media_url: string | null;
  media_type: string | null;
  score: number | null;
};

export async function fetchCategoryExercises(slug: string, limit = 24, offset = 0) {
  const { data, error } = await supabase
    .from('category_exercises')               // <<< nome exato, minúsculo
    .select('*')
    .eq('category_slug', slug)
    .order('score', { ascending: false })
    .order('name',  { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as CategoryExercise[];
}
