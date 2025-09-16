-- Create storage bucket for food photos
INSERT INTO storage.buckets (id, name, public) VALUES ('food-photos', 'food-photos', true);

-- Create policies for food photos bucket
CREATE POLICY "Users can view food photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'food-photos');

CREATE POLICY "Users can upload their own food photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own food photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own food photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add photo_url column to food_diary table
ALTER TABLE food_diary ADD COLUMN photo_url text;