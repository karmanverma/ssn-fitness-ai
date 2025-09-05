# User Avatar System

The app uses a comprehensive two-tier avatar system with automatic fallbacks and upload functionality.

## System Overview

### 1. Primary Avatar Sources

**Dicebear API (Default)**:
- Uses `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
- Generates consistent, cartoon-style avatars based on user email
- Same email always produces the same avatar
- Used as the default avatar for all users

**User Upload (Optional)**:
- Users can upload custom profile pictures
- Stored in Supabase Storage in the `avatars` bucket
- Takes precedence over Dicebear avatars when available

### 2. Fallback System

When images fail to load, the app shows character-based fallbacks:

**Email-based fallback** (Primary):
```tsx
<AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
```

**Name-based fallback** (Secondary):
```tsx
<AvatarFallback>
  {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
</AvatarFallback>
```

### 3. Implementation Pattern

The app uses Shadcn/ui's Avatar component built on Radix UI:

```tsx
<Avatar className="h-8 w-8">
  <AvatarImage 
    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
    alt={user.name}
  />
  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-rose-700 text-white">
    {user.email?.[0]?.toUpperCase() || getInitials(user.name)}
  </AvatarFallback>
</Avatar>
```

## Components

### UserAvatar Component (`src/components/ui/user-avatar.tsx`)
Reusable avatar component with consistent styling and fallback logic.

**Props**:
- `user`: User object with email, name, avatar_url
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `className`: Additional CSS classes
- `fallbackClassName`: Custom fallback styling

**Sizes**:
- `sm`: 24px (h-6 w-6)
- `md`: 32px (h-8 w-8) - Navigation default
- `lg`: 40px (h-10 w-10)
- `xl`: 96px (h-24 w-24) - Profile header

### AvatarUpload Component (`src/components/ui/avatar-upload.tsx`)
Avatar component with upload/remove functionality.

**Features**:
- File validation (JPEG, PNG, WebP, max 5MB)
- Upload progress indication
- Remove avatar functionality
- Automatic profile updates
- Toast notifications

## Services

### AvatarService (`src/lib/avatar-service.ts`)
Handles avatar upload, deletion, and validation.

**Methods**:
- `uploadAvatar(userId, file)`: Upload avatar to Supabase Storage
- `updateProfileAvatar(userId, avatarUrl)`: Update user profile with new avatar URL
- `deleteAvatar(userId, avatarUrl)`: Remove avatar from storage
- `validateImageFile(file)`: Validate file type and size

## Database Schema

### user_profiles table
```sql
avatar_url TEXT -- Stores the URL to uploaded avatar image
```

### Supabase Storage
- **Bucket**: `avatars` (public)
- **Path structure**: `{user_id}/avatar-{timestamp}.{ext}`
- **Policies**: Users can only upload/delete their own avatars

## Usage Examples

### Basic Avatar Display
```tsx
import { UserAvatar } from '@/components/ui/user-avatar'

<UserAvatar user={user} size="md" />
```

### Avatar with Upload
```tsx
import { AvatarUpload } from '@/components/ui/avatar-upload'

<AvatarUpload 
  user={user} 
  size="xl"
  onAvatarUpdate={(url) => console.log('Avatar updated:', url)}
/>
```

### Navigation Avatar
```tsx
<UserAvatar 
  user={user} 
  size="md" 
  className="cursor-pointer hover:scale-105 transition-transform"
/>
```

## Styling & Behavior

- **Size**: Responsive sizing with predefined size classes
- **Shape**: Circular with `rounded-full`
- **Fallback styling**: Rose gradient background with white text
- **Hover effects**: Scale and cursor pointer for interactive avatars
- **Loading states**: Spinner during upload/delete operations

## Security

- **File validation**: Type and size restrictions
- **Storage policies**: Users can only access their own avatar files
- **Path structure**: User ID-based folder structure prevents unauthorized access
- **Public bucket**: Avatars are publicly accessible via URL for display

The system ensures users always have a visual representation, using either uploaded images, generated avatars, or elegant initial-based fallbacks.