import { createClient } from '@/lib/supabase/client'

export class AvatarService {
  private supabase = createClient()

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      // Generate unique filename with timestamp to avoid caching issues
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar-${timestamp}.${fileExt}`

      // Upload file to Supabase storage
      const { error } = await this.supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Error uploading avatar:', error)
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error in uploadAvatar:', error)
      return null
    }
  }

  async updateProfileAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating profile avatar:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateProfileAvatar:', error)
      return false
    }
  }

  async deleteAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${userId}/${fileName}`

      const { error } = await this.supabase.storage
        .from('avatars')
        .remove([filePath])

      if (error) {
        console.error('Error deleting avatar:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteAvatar:', error)
      return false
    }
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please select a valid image file (JPEG, PNG, or WebP)'
      }
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB'
      }
    }

    return { valid: true }
  }
}