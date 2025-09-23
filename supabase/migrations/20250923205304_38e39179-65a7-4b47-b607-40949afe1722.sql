-- Create storage buckets for media
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('previews', 'previews', true),
  ('workouts', 'workouts', true);

-- Create exercises table
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  muscle_group text,
  equipment text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  preview_path text,
  video_path text,
  tags text[],
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on exercises table
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create public read policy for exercises
CREATE POLICY "Public can view exercises" 
ON public.exercises 
FOR SELECT 
USING (true);

-- Create admin insert/update policy for exercises (requires authentication)
CREATE POLICY "Authenticated users can manage exercises" 
ON public.exercises 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage policies for previews bucket
CREATE POLICY "Public can view previews" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'previews');

CREATE POLICY "Authenticated users can upload previews" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'previews' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update previews" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'previews' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete previews" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'previews' AND auth.uid() IS NOT NULL);

-- Create storage policies for workouts bucket
CREATE POLICY "Public can view workouts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'workouts');

CREATE POLICY "Authenticated users can upload workouts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'workouts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update workouts" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'workouts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete workouts" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'workouts' AND auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty);
CREATE INDEX idx_exercises_tags ON public.exercises USING GIN(tags);
CREATE INDEX idx_exercises_slug ON public.exercises(slug);