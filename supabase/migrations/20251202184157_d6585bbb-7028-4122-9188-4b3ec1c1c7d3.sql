-- Create user_settings table for app preferences and goals
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  
  -- Goals
  fitness_goal text,
  water_goal_ml integer DEFAULT 2000,
  sleep_goal_hours numeric DEFAULT 8,
  walk_goal_km_week numeric DEFAULT 10,
  
  -- Reminders
  reminder_water_enabled boolean DEFAULT false,
  reminder_water_time time,
  reminder_sleep_enabled boolean DEFAULT false,
  reminder_sleep_time time,
  reminder_walk_enabled boolean DEFAULT false,
  
  -- App preferences
  auto_save_enabled boolean DEFAULT true,
  push_notifications_enabled boolean DEFAULT true,
  theme text DEFAULT 'dark',
  language text DEFAULT 'pt-BR',
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();