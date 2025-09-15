-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
  height DECIMAL(5,2), -- em cm
  weight DECIMAL(5,2), -- em kg
  fitness_goal TEXT CHECK (fitness_goal IN ('emagrecer', 'manter_peso', 'ganhar_massa', 'definir')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'canceled', 'expired')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create Personal IA questionnaire table
CREATE TABLE public.personal_questionnaire (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fitness_goal TEXT NOT NULL,
  available_time INTEGER NOT NULL, -- em minutos
  weekly_frequency INTEGER NOT NULL, -- vezes por semana
  available_equipment TEXT[], -- array de equipamentos
  physical_restrictions TEXT,
  fitness_level TEXT CHECK (fitness_level IN ('iniciante', 'intermediario', 'avancado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on personal_questionnaire
ALTER TABLE public.personal_questionnaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own questionnaire" ON public.personal_questionnaire
  FOR ALL USING (auth.uid() = user_id);

-- Create workout plans table
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id UUID REFERENCES public.personal_questionnaire(id),
  plan_name TEXT NOT NULL,
  plan_data JSONB NOT NULL, -- estrutura do treino gerada pela IA
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workout_plans
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout plans" ON public.workout_plans
  FOR ALL USING (auth.uid() = user_id);

-- Create nutrition questionnaire table
CREATE TABLE public.nutrition_questionnaire (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutrition_goal TEXT NOT NULL,
  allergies TEXT[],
  food_restrictions TEXT[],
  food_preferences TEXT[],
  meals_per_day INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on nutrition_questionnaire
ALTER TABLE public.nutrition_questionnaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nutrition questionnaire" ON public.nutrition_questionnaire
  FOR ALL USING (auth.uid() = user_id);

-- Create meal plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id UUID REFERENCES public.nutrition_questionnaire(id),
  plan_name TEXT NOT NULL,
  plan_type TEXT DEFAULT 'personalizado' CHECK (plan_type IN ('personalizado', 'emagrecer', 'manter_peso', 'ganhar_massa')),
  plan_data JSONB NOT NULL, -- cardápio de 7 dias gerado pela IA
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on meal_plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans" ON public.meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- Create water tracking table
CREATE TABLE public.water_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  daily_goal_ml INTEGER DEFAULT 2000,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on water_tracking
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own water tracking" ON public.water_tracking
  FOR ALL USING (auth.uid() = user_id);

-- Create sleep tracking table
CREATE TABLE public.sleep_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bedtime TIMESTAMP WITH TIME ZONE NOT NULL,
  wake_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sleep_duration INTERVAL GENERATED ALWAYS AS (wake_time - bedtime) STORED,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sleep_tracking
ALTER TABLE public.sleep_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sleep tracking" ON public.sleep_tracking
  FOR ALL USING (auth.uid() = user_id);

-- Create walk sessions table
CREATE TABLE public.walk_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  distance_meters DECIMAL(10,2),
  steps INTEGER,
  calories_burned INTEGER,
  average_pace DECIMAL(5,2), -- minutos por km
  route_data JSONB, -- coordenadas GPS da rota
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on walk_sessions
ALTER TABLE public.walk_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own walk sessions" ON public.walk_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create food diary table
CREATE TABLE public.food_diary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('cafe_da_manha', 'almoco', 'lanche', 'jantar')),
  food_name TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT, -- gramas, ml, unidade, etc
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fat DECIMAL(8,2),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on food_diary
ALTER TABLE public.food_diary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own food diary" ON public.food_diary
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();