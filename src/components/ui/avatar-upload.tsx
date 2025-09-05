'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'
import { AvatarService } from '@/lib/avatar-service'
import { useProfile } from '@/contexts/profile-context'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  user: {
    id?: string
    email?: string
    user_metadata?: {
      full_name?: string
    }
    avatar_url?: string
    full_name?: string
    name?: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onAvatarUpdate?: (avatarUrl: string | null) => void
}

export function AvatarUpload({ 
  user, 
  size = 'xl', 
  className,
  onAvatarUpdate 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user.avatar_url)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarService = new AvatarService()
  const { refreshProfile } = useProfile()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user.id) return

    // Validate file
    const validation = avatarService.validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setUploading(true)
    try {
      // Upload new avatar
      const avatarUrl = await avatarService.uploadAvatar(user.id, file)
      if (!avatarUrl) {
        toast.error('Failed to upload avatar')
        return
      }

      // Update profile
      const success = await avatarService.updateProfileAvatar(user.id, avatarUrl)
      if (!success) {
        toast.error('Failed to update profile')
        return
      }

      // Update local state and refresh profile context
      setCurrentAvatarUrl(avatarUrl)
      onAvatarUpdate?.(avatarUrl)
      await refreshProfile()
      toast.success('Avatar updated successfully!')

    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user.id || !currentAvatarUrl) return

    setUploading(true)
    try {
      // Delete from storage
      await avatarService.deleteAvatar(user.id, currentAvatarUrl)

      // Update profile to remove avatar_url
      const success = await avatarService.updateProfileAvatar(user.id, '')
      if (!success) {
        toast.error('Failed to remove avatar')
        return
      }

      // Update local state and refresh profile context
      setCurrentAvatarUrl(undefined)
      onAvatarUpdate?.(null)
      await refreshProfile()
      toast.success('Avatar removed successfully!')

    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      <UserAvatar 
        user={{ ...user, avatar_url: currentAvatarUrl }} 
        size={size} 
        className={className}
      />
      
      {/* Upload Button */}
      <Button
        size="sm"
        variant="secondary"
        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
        onClick={triggerFileInput}
        disabled={uploading}
        title="Upload avatar"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </Button>

      {/* Remove Button (only show if user has uploaded avatar) */}
      {currentAvatarUrl && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute -bottom-2 -left-2 rounded-full w-8 h-8 p-0"
          onClick={handleRemoveAvatar}
          disabled={uploading}
          title="Remove avatar"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}