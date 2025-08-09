'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Camera, Edit, Target, TrendingUp } from 'lucide-react'
import { UserProfile } from '@/types/profile'
import { ProfileService } from '@/lib/profile-service'

interface ProfileHeaderProps {
  profile: UserProfile
  onEditClick: () => void
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  const profileService = new ProfileService()
  const bmiInfo = profile.bmi ? profileService.getBMICategory(profile.bmi) : null
  
  // Calculate profile completion
  const requiredFields = ['age', 'gender', 'height', 'current_weight', 'primary_goal', 'activity_level']
  const completedFields = requiredFields.filter(field => profile[field as keyof UserProfile])
  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100)

  return (
    <div className="relative">
      <style jsx>{`
        .glass-profile {
          backdrop-filter: blur(3px) saturate(180%);
          background: radial-gradient(circle, #fff9 0%, #ffdce64d 60%, #f9f2f4 100%);
          border: 1px solid #ff96b41a;
        }
        .glass-profile:where(.dark, .dark *) {
          backdrop-filter: blur(2px) !important;
          background: radial-gradient(circle, #ffffff1a 0%, #1e00001a 60%, #2a0e0e 100%) !important;
          border: 1px solid #ffffff0d !important;
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -inset-4 rounded-xl bg-rose-600/20 blur-3xl"></div>
      </div>
      <Card className="glass-profile border-0 rounded-2xl">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar Section */}
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
              <Button onClick={onEditClick} className="self-start">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.age && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600">{profile.age}</div>
                  <div className="text-sm text-muted-foreground">Years Old</div>
                </div>
              )}
              
              {profile.current_weight && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.current_weight}kg</div>
                  <div className="text-sm text-muted-foreground">Current Weight</div>
                </div>
              )}
              
              {profile.bmi && (
                <div className="text-center">
                  <div className={`text-2xl font-bold ${bmiInfo?.color}`}>{profile.bmi}</div>
                  <div className="text-sm text-muted-foreground">BMI ({bmiInfo?.category})</div>
                </div>
              )}
              
              {profile.daily_calories && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.daily_calories}</div>
                  <div className="text-sm text-muted-foreground">Daily Calories</div>
                </div>
              )}
            </div>

            {/* Goals & Progress */}
            <div className="flex flex-wrap gap-2">
              {profile.primary_goal && (
                <Badge variant="default" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                  <Target className="w-3 h-3 mr-1" />
                  {profile.primary_goal.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
              
              {profile.activity_level && (
                <Badge variant="outline">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {profile.activity_level.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Profile Completion */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Completion</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              {completionPercentage < 100 && (
                <p className="text-sm text-muted-foreground">
                  Complete your profile to get better AI recommendations
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  )
}