import { supabase } from '@/integrations/supabase/client';

export type CategoryExercise = {
  id?: string;
  category_slug: string;
  slug: string;
  name: string | null;
  media_url: string | null;
  media_type: string | null;
  modality: string | null;
  level: string | null;
  equipment: string | null;
  primary_muscle: string | null;
  reps: number | null;
  sets: number | null;
  duration_seconds: number | null;
  source_category: string | null;
  source_subdir: string | null;
  score?: number | null;
  [key: string]: any; // Allow additional properties
};

export async function fetchCategoryExercises(slug: string, limit = 24, offset = 0) {
  const { data, error } = await supabase
    .from('category_exercises')
    .select('*')
    .eq('category_slug', slug)
    .order('score', { ascending: false })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}
