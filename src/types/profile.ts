export interface UserProfile {
  id: string
  full_name?: string
  email?: string
  avatar_url?: string
  
  // Basic Info
  age?: number
  gender?: 'male' | 'female' | 'other'
  height?: number // in cm
  current_weight?: number // in kg
  target_weight?: number // in kg
  
  // Fitness Goals
  primary_goal?: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness'
  secondary_goals?: string[]
  target_date?: string
  
  // Activity Level
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  target_activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  workout_frequency?: number // days per week
  workout_duration?: number // minutes per session
  
  // Health & Medical
  health_conditions?: string[]
  medications?: string[]
  injuries?: string[]
  dietary_restrictions?: string[]
  
  // Equipment & Preferences
  available_equipment?: string[]
  preferred_workout_types?: string[]
  gym_access?: boolean
  home_workout_space?: boolean
  
  // Calculated Metrics
  bmi?: number
  bmr?: number
  daily_calories?: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface ProfileFormData {
  // Basic Info
  full_name: string
  age: number | null
  gender: 'male' | 'female' | 'other' | null
  height: number | null
  heightUnit: 'cm' | 'ft' | 'in'
  current_weight: number | null
  target_weight: number | null
  
  // Goals
  primary_goal: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness' | null
  secondary_goals: string[]
  target_date: string
  
  // Activity
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
  target_activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
  workout_frequency: number | null
  workout_duration: number | null
  
  // Health
  health_conditions: string[]
  medications: string[]
  injuries: string[]
  dietary_restrictions: string[]
  
  // Equipment
  available_equipment: string[]
  preferred_workout_types: string[]
  gym_access: boolean
  home_workout_space: boolean
}