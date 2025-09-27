import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export interface CategoryExercise {
  id: string;
  slug: string;
  name: string;
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
  category_slug: string;
}

export const useCategoryExercises = (categorySlug: string) => {
  const [exercises, setExercises] = useState<CategoryExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!categorySlug) {
        setExercises([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('category_exercises')
          .select('*')
          .eq('category_slug', categorySlug)
          .order('name');

        if (fetchError) throw fetchError;

        setExercises(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [categorySlug]);

  return { exercises, loading, error };
};

export const useAppCategories = () => {
  const [categories, setCategories] = useState<Array<{slug: string, title: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('app_categories')
          .select('*')
          .order('title');

        if (fetchError) throw fetchError;

        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};