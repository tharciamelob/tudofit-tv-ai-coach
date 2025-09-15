-- Create walking_sessions table for GPS tracking
CREATE TABLE public.walking_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(8,3) NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  calories_burned INTEGER NOT NULL DEFAULT 0,
  average_pace_min_per_km DECIMAL(5,2) NOT NULL DEFAULT 0,
  route_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.walking_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for walking_sessions
CREATE POLICY "Users can view their own walking sessions" 
ON public.walking_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own walking sessions" 
ON public.walking_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own walking sessions" 
ON public.walking_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own walking sessions" 
ON public.walking_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_walking_sessions_updated_at
BEFORE UPDATE ON public.walking_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_walking_sessions_user_id ON public.walking_sessions(user_id);
CREATE INDEX idx_walking_sessions_start_time ON public.walking_sessions(start_time DESC);