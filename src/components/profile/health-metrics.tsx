'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { UserProfile } from '@/types/profile'
import { ProfileService } from '@/lib/profile-service'
import { Activity, Calculator, Heart, Lightbulb, TrendingUp, Weight } from 'lucide-react'
import { BorderBeam } from '@/components/ui/border-beam'

interface HealthMetricsProps {
  profile: UserProfile
}

export function HealthMetrics({ profile }: HealthMetricsProps) {
  const profileService = new ProfileService()
  const bmiInfo = profile.bmi ? profileService.getBMICategory(profile.bmi) : null
  const recommendations = profileService.getGoalRecommendations(profile)

  // Calculate weight progress
  const weightProgress = profile.target_weight && profile.current_weight ? {
    current: profile.current_weight,
    target: profile.target_weight,
    difference: Math.abs(profile.current_weight - profile.target_weight),
    isLoss: profile.current_weight > profile.target_weight
  } : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* BMI Card */}
      {profile.bmi && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Mass Index</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.bmi}</div>
            <Badge 
              variant="outline" 
              className={`mt-2 ${bmiInfo?.color.replace('text-', 'border-').replace('600', '200')}`}
            >
              {bmiInfo?.category}
            </Badge>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
              <div className="relative h-2 bg-gradient-to-r from-blue-200 via-green-200 via-yellow-200 to-red-200 rounded">
                <div 
                  className="absolute top-0 w-1 h-2 bg-black rounded"
                  style={{ left: `${Math.min(Math.max((profile.bmi - 15) / 25 * 100, 0), 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BMR Card */}
      {profile.bmr && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Basal Metabolic Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.bmr}</div>
            <p className="text-xs text-muted-foreground">calories/day at rest</p>
            {profile.daily_calories && (
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Daily Calories</span>
                  <span className="font-medium">{profile.daily_calories}</span>
                </div>
                <Progress 
                  value={(profile.bmr / profile.daily_calories) * 100} 
                  className="mt-2 h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  +{profile.daily_calories - profile.bmr} from activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weight Progress Card */}
      {weightProgress && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight Progress</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weightProgress.current}kg
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {weightProgress.target}kg
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">
                  {weightProgress.difference}kg to go
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${weightProgress.isLoss ? 'text-green-600' : 'text-blue-600'}`} />
                <span className="text-sm">
                  {weightProgress.isLoss ? 'Weight Loss' : 'Weight Gain'} Goal
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Level Card */}
      {profile.activity_level && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold capitalize">
              {profile.activity_level.replace('_', ' ')}
            </div>
            {profile.workout_frequency && (
              <p className="text-sm text-muted-foreground">
                {profile.workout_frequency} days/week
              </p>
            )}
            {profile.workout_duration && (
              <p className="text-sm text-muted-foreground">
                {profile.workout_duration} min/session
              </p>
            )}
          </CardContent>
        </Card>
      )}



      {/* Recommendations Card */}
      {recommendations.length > 0 && (
        <Card
          className="md:col-span-2 lg:col-span-3 bg-background relative overflow-hidden p-4 md:p-6"
          style={{ boxShadow: 'inset 0 0 30px 1px rgba(244, 63, 94, 0.1)' }}
        >
          <CardHeader className="mb-6 p-0">
            <CardTitle className="text-2xl leading-none font-semibold tracking-tight flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              AI Recommendations
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Personalized insights based on your fitness profile and goals
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <BorderBeam
            duration={6}
            size={300}
            className="via-primary from-transparent to-transparent"
          />
          <BorderBeam
            duration={6}
            size={300}
            reverse
            className="via-destructive from-transparent to-transparent"
          />
        </Card>
      )}
    </div>
  )
}