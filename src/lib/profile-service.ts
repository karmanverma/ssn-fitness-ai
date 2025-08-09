import { createClient } from '@/lib/supabase/client'
import { UserProfile, ProfileFormData } from '@/types/profile'

export class ProfileService {
  private supabase = createClient()

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  async createProfile(userId: string, profileData: Partial<ProfileFormData>): Promise<UserProfile | null> {
    const processedData = this.processFormData(profileData)
    
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...processedData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      throw new Error(`Profile creation failed: ${error.message || JSON.stringify(error)}`)
    }

    return data
  }

  async updateProfile(userId: string, profileData: Partial<ProfileFormData>): Promise<UserProfile | null> {
    const processedData = this.processFormData(profileData)
    
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...processedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        full: error
      })
      console.error('Data being sent:', processedData)
      throw new Error(`Profile update failed: ${error.message || error.details || 'Unknown error'}`)
    }

    return data
  }

  private processFormData(profileData: Partial<ProfileFormData>) {
    const { heightUnit, ...dbData } = profileData
    
    // Process arrays - convert strings to arrays if needed
    const processArray = (value: any): string[] | null => {
      if (!value) return null
      if (Array.isArray(value)) return value.filter(Boolean)
      if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean)
      return null
    }
    
    // Calculate health metrics
    const calculatedMetrics = this.calculateHealthMetrics(dbData)
    
    return {
      ...dbData,
      medications: processArray(dbData.medications),
      injuries: processArray(dbData.injuries),
      dietary_restrictions: processArray(dbData.dietary_restrictions),
      health_conditions: processArray(dbData.health_conditions),
      available_equipment: processArray(dbData.available_equipment),
      preferred_workout_types: processArray(dbData.preferred_workout_types),
      secondary_goals: processArray(dbData.secondary_goals),
      ...calculatedMetrics
    }
  }

  private calculateHealthMetrics(data: any) {
    const metrics: { bmi?: number; bmr?: number; daily_calories?: number } = {}

    if (data.height && data.current_weight) {
      // Calculate BMI
      const heightInM = data.height / 100
      metrics.bmi = Number((data.current_weight / (heightInM * heightInM)).toFixed(1))
    }

    if (data.current_weight && data.height && data.age && data.gender) {
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr: number
      if (data.gender === 'male') {
        bmr = 10 * data.current_weight + 6.25 * data.height - 5 * data.age + 5
      } else {
        bmr = 10 * data.current_weight + 6.25 * data.height - 5 * data.age - 161
      }
      metrics.bmr = Math.round(bmr)

      // Calculate daily calories based on activity level
      const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9
      }

      if (data.activity_level) {
        metrics.daily_calories = Math.round(bmr * activityMultipliers[data.activity_level])
      }
    }

    return metrics
  }

  getBMICategory(bmi: number): { category: string; color: string } {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' }
    return { category: 'Obese', color: 'text-red-600' }
  }

  getGoalRecommendations(profile: UserProfile): string[] {
    const recommendations: string[] = []
    
    if (profile.bmi && profile.bmi > 25 && profile.primary_goal === 'weight_loss') {
      recommendations.push('Focus on creating a caloric deficit through diet and cardio')
    }
    
    if (profile.primary_goal === 'muscle_gain') {
      recommendations.push('Prioritize strength training and adequate protein intake')
    }
    
    if (profile.workout_frequency && profile.workout_frequency < 3) {
      recommendations.push('Consider increasing workout frequency to 3-4 times per week')
    }

    return recommendations
  }
}