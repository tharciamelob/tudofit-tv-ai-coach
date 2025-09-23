-- Fix security warnings

-- Fix function search path issues - update existing functions to be security definer with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calc_sleep_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.bedtime IS NOT NULL AND NEW.wake_time IS NOT NULL THEN
    -- Calcular duração do sono em minutos
    NEW.sleep_duration := (NEW.wake_time - NEW.bedtime);
  ELSE
    NEW.sleep_duration := NULL;
  END IF;
  RETURN NEW;
END;
$$;