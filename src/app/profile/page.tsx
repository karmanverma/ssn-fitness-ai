'use client'

import { useState } from 'react'
import { useProfile } from '@/contexts/profile-context'
import { useAuth } from '@/contexts/auth-context'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileForm } from '@/components/profile/profile-form'
import { HealthMetrics } from '@/components/profile/health-metrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProfileFormData } from '@/types/profile'
import { User, Activity, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading, updateProfile, isProfileComplete } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/')
    return null
  }

  const handleSaveProfile = async (data: Partial<ProfileFormData>) => {
    try {
      await updateProfile(data)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <ProfileForm
          profile={profile}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
      <div className="space-y-6">
        {/* Profile Header */}
        {profile ? (
          <ProfileHeader 
            profile={profile} 
            onEditClick={() => setIsEditing(true)} 
          />
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
              <p className="text-muted-foreground text-center mb-4">
                Set up your profile to get personalized AI fitness recommendations
              </p>
              <Button onClick={() => setIsEditing(true)}>
                Create Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Completion Alert */}
        {profile && !isProfileComplete && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Your profile is incomplete. Complete it to get better AI recommendations.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2"
                onClick={() => setIsEditing(true)}
              >
                Complete now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Combined Overview & Health Metrics */}
        {profile && (
          <div className="space-y-8">
            {/* Health Metrics Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Health Metrics
              </h2>
              <HealthMetrics profile={profile} />
            </div>

            {/* Goals & Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Goals & Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {profile.target_weight && profile.current_weight && (
                      <div>
                        <h4 className="font-semibold">Weight Goal</h4>
                        <p className="text-muted-foreground">
                          {profile.current_weight}kg → {profile.target_weight}kg
                          ({Math.abs(profile.current_weight - profile.target_weight)}kg to go)
                        </p>
                      </div>
                    )}

                    {profile.target_date && (
                      <div>
                        <h4 className="font-semibold">Target Date</h4>
                        <p className="text-muted-foreground">
                          {new Date(profile.target_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Equipment & Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.available_equipment && profile.available_equipment.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Available Equipment</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.available_equipment.map((equipment, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-muted rounded-md text-sm"
                            >
                              {equipment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.preferred_workout_types && profile.preferred_workout_types.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Preferred Workouts</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferred_workout_types.map((type, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-muted rounded-md text-sm"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${profile.gym_access ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm">Gym Access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${profile.home_workout_space ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm">Home Workout Space</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.health_conditions && profile.health_conditions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm">Health Conditions</h4>
                        <ul className="text-sm text-muted-foreground">
                          {profile.health_conditions.map((condition, index) => (
                            <li key={index}>• {condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm">Dietary Restrictions</h4>
                        <ul className="text-sm text-muted-foreground">
                          {profile.dietary_restrictions.map((restriction, index) => (
                            <li key={index}>• {restriction}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditing(true)}
                        className="w-full"
                      >
                        Update Health Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}