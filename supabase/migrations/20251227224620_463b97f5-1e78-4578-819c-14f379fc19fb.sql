-- Migration: Fix exercises.media_url paths that point to non-existent subfolder locations
-- Only updates when the file exists at the root of the workouts bucket

-- First, let's create a temporary function to extract filename from path
CREATE OR REPLACE FUNCTION pg_temp.extract_filename(url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Extract just the filename from a URL like https://...supabase.co/storage/v1/object/public/workouts/folder/file.gif
  RETURN regexp_replace(url, '^.*/([^/]+)$', '\1');
END;
$$ LANGUAGE plpgsql;

-- Update exercises where:
-- 1. media_url contains a subfolder pattern (workouts/something/file.gif)
-- 2. The file exists at root level in storage.objects
WITH fixes AS (
  SELECT 
    e.id,
    e.slug,
    e.media_url AS old_url,
    'https://czbepdrjixrqrxeyfagc.supabase.co/storage/v1/object/public/workouts/' || so.name AS new_url
  FROM exercises e
  INNER JOIN storage.objects so 
    ON so.bucket_id = 'workouts'
    AND so.name = pg_temp.extract_filename(e.media_url)
    AND so.name NOT LIKE '%/%'  -- Ensure it's at root (no subfolder)
  WHERE 
    e.media_url IS NOT NULL
    -- Match URLs with subfolder pattern: /workouts/<folder>/<file>
    AND e.media_url ~ '/workouts/[^/]+/[^/]+\.(gif|mp4|webm|webp|jpg|png)$'
    -- Exclude URLs already at root level
    AND e.media_url !~ '/workouts/[^/]+\.(gif|mp4|webm|webp|jpg|png)$'
),
updated AS (
  UPDATE exercises e
  SET 
    media_url = f.new_url,
    has_valid_media = true
  FROM fixes f
  WHERE e.id = f.id
  RETURNING e.id, e.slug, f.old_url, f.new_url
)
SELECT 
  'UPDATED' as status,
  COUNT(*) as count
FROM updated

UNION ALL

SELECT 
  'UNCHANGED' as status,
  COUNT(*) as count
FROM exercises
WHERE id NOT IN (SELECT id FROM fixes WHERE fixes.id = exercises.id)
  AND media_url IS NOT NULL;