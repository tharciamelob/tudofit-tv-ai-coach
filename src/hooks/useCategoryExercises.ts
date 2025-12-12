import { supabase } from '@/integrations/supabase/client';

export type SeriesExercise = {
  slug: string;
  name: string | null;
  media_url: string | null;
  media_type: string | null;
  equipment: string | null;
  equipment_required: boolean | null;
  has_valid_media?: boolean | null;
  sets: number | null;
  reps: number | null;
  work_seconds: number | null;
  rest_seconds: number | null;
};

export type SeriesCard = {
  category_slug: string;
  slug: string;
  name: string | null;
  description: string | null;
  cover_url: string | null;
  exercises: SeriesExercise[];
};

// Legacy types for backward compatibility
export type CategoryExercise = {
  category_slug: string;
  slug: string;
  name: string | null;
  media_url: string | null;
  media_type: string | null;
  score: number | null;
};

export async function fetchSeriesCards(categorySlug: string, limit = 24, offset = 0) {
  const { data, error } = await supabase
    .from('series_cards')
    .select('*')
    .eq('category_slug', categorySlug)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as SeriesCard[];
}

export async function fetchSeriesDetails(seriesSlug: string) {
  const { data, error } = await supabase
    .from('series_cards')
    .select('*')
    .eq('slug', seriesSlug)
    .single();
  if (error) throw error;
  return data as SeriesCard;
}

// Legacy function for backward compatibility
export async function fetchCategoryExercises(slug: string, limit = 24, offset = 0) {
  const { data, error } = await supabase
    .from('category_exercises')
    .select('*')
    .eq('category_slug', slug)
    .order('score', { ascending: false })
    .order('name',  { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as CategoryExercise[];
}
