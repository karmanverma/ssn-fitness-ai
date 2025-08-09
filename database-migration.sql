-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Basic Info
  age INTEGER CHECK (age >= 13 AND age <= 120),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height DECIMAL(5,2) CHECK (height >= 100 AND height <= 250), -- cm
  current_weight DECIMAL(5,2) CHECK (current_weight >= 30 AND current_weight <= 300), -- kg
  target_weight DECIMAL(5,2) CHECK (target_weight >= 30 AND target_weight <= 300), -- kg
  
  -- Fitness Goals
  primary_goal TEXT CHECK (primary_goal IN ('weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness')),
  secondary_goals TEXT[],
  target_date DATE,
  
  -- Activity Level
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  workout_frequency INTEGER CHECK (workout_frequency >= 0 AND workout_frequency <= 7), -- days per week
  workout_duration INTEGER CHECK (workout_duration >= 15 AND workout_duration <= 300), -- minutes per session
  
  -- Health & Medical
  health_conditions TEXT[],
  medications TEXT[],
  injuries TEXT[],
  dietary_restrictions TEXT[],
  
  -- Equipment & Preferences
  available_equipment TEXT[],
  preferred_workout_types TEXT[],
  gym_access BOOLEAN DEFAULT FALSE,
  home_workout_space BOOLEAN DEFAULT FALSE,
  
  -- Calculated Metrics
  bmi DECIMAL(4,1),
  bmr INTEGER,
  daily_calories INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);