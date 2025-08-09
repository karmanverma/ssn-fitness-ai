'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { UserProfile, ProfileFormData } from '@/types/profile'
import { ProfileService } from '@/lib/profile-service'
import { useAuth } from './auth-context'

interface ProfileContextType {
  profile: UserProfile | null
  loading: boolean
  updateProfile: (data: Partial<ProfileFormData>) => Promise<void>
  refreshProfile: () => Promise<void>
  isProfileComplete: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const profileService = new ProfileService()

  const isProfileComplete = profile ? 
    !!(profile.age && profile.gender && profile.height && profile.current_weight && profile.primary_goal) : 
    false

  useEffect(() => {
    if (user) {
      loadProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userProfile = await profileService.getProfile(user.id)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<ProfileFormData>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      let updatedProfile: UserProfile | null

      if (profile) {
        updatedProfile = await profileService.updateProfile(user.id, data)
      } else {
        updatedProfile = await profileService.createProfile(user.id, data)
      }

      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    await loadProfile()
  }

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      updateProfile,
      refreshProfile,
      isProfileComplete
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}