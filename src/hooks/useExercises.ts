import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  preview_path: string | null;
  video_path: string | null;
  tags: string[] | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface ExerciseFilters {
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
}

export const useExercises = (filters: ExerciseFilters = {}, limit = 20) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchExercises = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.muscle_group) {
        query = query.eq('muscle_group', filters.muscle_group);
      }
      if (filters.equipment) {
        query = query.eq('equipment', filters.equipment);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
      }

      const currentOffset = reset ? 0 : offset;
      query = query.range(currentOffset, currentOffset + limit - 1);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const newExercises = data || [];
      
      if (reset) {
        setExercises(newExercises);
        setOffset(limit);
      } else {
        setExercises(prev => [...prev, ...newExercises]);
        setOffset(prev => prev + limit);
      }

      setHasMore(newExercises.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching exercises');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchExercises(false);
    }
  };

  const refresh = () => {
    setOffset(0);
    fetchExercises(true);
  };

  useEffect(() => {
    refresh();
  }, [filters.muscle_group, filters.equipment, filters.difficulty, filters.search]);

  return {
    exercises,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

export const useExercise = (slug: string) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('exercises')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setExercise(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching exercise');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchExercise();
    }
  }, [slug]);

  return { exercise, loading, error };
};