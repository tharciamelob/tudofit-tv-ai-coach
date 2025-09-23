-- Security Hardening for TudoFit TV

-- First, ensure exercises table has RLS enabled (if not already)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing public policies on exercises
DROP POLICY IF EXISTS "Public can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Authenticated users can manage exercises" ON public.exercises;

-- Create admin email check function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(user_email, auth.email()) = ANY(ARRAY[
    'admin@tudofit.tv',
    'support@tudofit.tv'
  ]);
$$;

-- Create new restrictive policies for exercises
CREATE POLICY "Authenticated users can view exercises"
ON public.exercises
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin users can insert exercises"
ON public.exercises
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin users can update exercises"
ON public.exercises
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin users can delete exercises"
ON public.exercises
FOR DELETE
TO authenticated
USING (public.is_admin_user());

-- Make storage buckets private
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('previews', 'workouts');

-- Drop existing storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;

-- Create restrictive storage policies
CREATE POLICY "Authenticated users can view exercise media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id IN ('previews', 'workouts'));

CREATE POLICY "Admin users can upload exercise media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('previews', 'workouts') 
  AND public.is_admin_user()
);

CREATE POLICY "Admin users can update exercise media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('previews', 'workouts') 
  AND public.is_admin_user()
);

CREATE POLICY "Admin users can delete exercise media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('previews', 'workouts') 
  AND public.is_admin_user()
);