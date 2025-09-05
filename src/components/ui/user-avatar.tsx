'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: {
    email?: string
    id?: string
    user_metadata?: {
      full_name?: string
    }
    avatar_url?: string
    full_name?: string
    name?: string
  }
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallbackClassName?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-10 w-10',
  xl: 'h-24 w-24'
}

const fallbackTextSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base', 
  xl: 'text-2xl'
}

export function UserAvatar({ 
  user, 
  className, 
  size = 'md',
  fallbackClassName 
}: UserAvatarProps) {
  // Get display name from various possible sources
  const displayName = user.user_metadata?.full_name || 
                     user.full_name || 
                     user.name || 
                     user.email?.split('@')[0] || 
                     'User'

  // Use email as seed for consistent avatar generation, fallback to id or default
  const avatarSeed = user.email || user.id || 'default'

  // Generate initials fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Primary fallback: first letter of email (most reliable)
  // Secondary fallback: initials from name
  const fallbackText = user.email?.[0]?.toUpperCase() || getInitials(displayName)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage 
        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
        alt={displayName}
      />
      <AvatarFallback 
        className={cn(
          'bg-gradient-to-br from-rose-500 to-rose-700 text-white font-medium',
          fallbackTextSizes[size],
          fallbackClassName
        )}
      >
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  )
}