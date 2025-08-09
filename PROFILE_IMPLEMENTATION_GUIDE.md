# User Profile Implementation Guide

## Overview
This guide provides a complete implementation of a user profile system for the SSN Fitness AI app, allowing users to manage their personal information, fitness goals, and health metrics.

## Features Implemented

### 1. **Comprehensive Profile Management**
- Basic info (name, age, gender, height, weight)
- Fitness goals and target dates
- Activity levels and workout preferences
- Health conditions and medical information
- Equipment availability and workout preferences

### 2. **Health Metrics & Calculations**
- BMI calculation and categorization
- BMR (Basal Metabolic Rate) calculation
- Daily calorie requirements based on activity level
- Weight progress tracking
- AI-powered recommendations

### 3. **Smart UI Components**
- Tabbed profile form with validation
- Interactive health metrics dashboard
- Profile completion tracking
- Responsive design with shadcn/ui components

## Files Created

### Types & Interfaces
- `src/types/profile.ts` - TypeScript interfaces for profile data

### Services & Logic
- `src/lib/profile-service.ts` - Profile management service with health calculations
- `src/contexts/profile-context.tsx` - React context for profile state management

### UI Components
- `src/components/profile/profile-header.tsx` - Profile header with stats and avatar
- `src/components/profile/profile-form.tsx` - Comprehensive profile editing form
- `src/components/profile/health-metrics.tsx` - Health metrics dashboard

### Pages
- `src/app/profile/page.tsx` - Main profile page with tabs and management

### Database
- `database-migration.sql` - Complete database schema with RLS policies

## Quick Setup Instructions

### 1. Database Setup
```sql
-- Run the migration in your Supabase SQL editor
-- File: database-migration.sql
```

### 2. Navigation Integration
Add profile link to your navigation component:
```tsx
import Link from 'next/link'
import { User } from 'lucide-react'

// In your navigation component
<Link href="/profile" className="flex items-center gap-2">
  <User className="w-4 h-4" />
  Profile
</Link>
```

### 3. Profile Completion Check
Use the profile context to check completion status:
```tsx
import { useProfile } from '@/contexts/profile-context'

function MyComponent() {
  const { isProfileComplete } = useProfile()
  
  if (!isProfileComplete) {
    // Show profile completion prompt
  }
}
```

## Key Features

### Health Calculations
- **BMI**: Calculated using height and weight
- **BMR**: Uses Mifflin-St Jeor Equation (gender-specific)
- **Daily Calories**: BMR × activity multiplier
- **Categories**: Smart BMI categorization with color coding

### Form Validation
- Age: 13-120 years
- Height: 100-250 cm
- Weight: 30-300 kg
- Required fields for profile completion

### AI Integration Ready
- Profile data can be used for personalized AI recommendations
- Health metrics inform workout and nutrition suggestions
- Equipment and preferences guide AI responses

## Additional Suggestions

### 1. **Progress Tracking**
```tsx
// Add to profile types
interface WeightEntry {
  date: string
  weight: number
  notes?: string
}

// Track weight history
weight_history: WeightEntry[]
```

### 2. **Photo Upload**
```tsx
// Add avatar upload functionality
const handleAvatarUpload = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/avatar.jpg`, file)
}
```

### 3. **Social Features**
```tsx
// Add social profile fields
interface SocialProfile {
  is_public: boolean
  bio?: string
  achievements: string[]
  workout_buddy_preferences?: string[]
}
```

### 4. **Fitness Assessments**
```tsx
// Add fitness test results
interface FitnessAssessment {
  date: string
  push_ups: number
  plank_duration: number // seconds
  flexibility_score: number
  cardio_endurance: number
}
```

### 5. **Nutrition Tracking**
```tsx
// Add nutrition preferences
interface NutritionProfile {
  daily_calorie_goal: number
  protein_goal: number
  carb_goal: number
  fat_goal: number
  meal_preferences: string[]
  allergies: string[]
}
```

## Usage Examples

### Basic Profile Access
```tsx
import { useProfile } from '@/contexts/profile-context'

function Dashboard() {
  const { profile, loading, updateProfile } = useProfile()
  
  if (loading) return <div>Loading...</div>
  if (!profile) return <div>Please complete your profile</div>
  
  return (
    <div>
      <h1>Welcome, {profile.full_name}!</h1>
      <p>BMI: {profile.bmi}</p>
      <p>Daily Calories: {profile.daily_calories}</p>
    </div>
  )
}
```

### Profile Completion Prompt
```tsx
function ProfilePrompt() {
  const { isProfileComplete } = useProfile()
  
  if (isProfileComplete) return null
  
  return (
    <Alert>
      <AlertDescription>
        Complete your profile to get personalized AI recommendations.
        <Link href="/profile">Complete now</Link>
      </AlertDescription>
    </Alert>
  )
}
```

## Security & Privacy

### Row Level Security (RLS)
- Users can only access their own profile data
- Automatic user_id validation on all operations
- Secure API endpoints with authentication checks

### Data Validation
- Client-side validation with react-hook-form
- Server-side validation with database constraints
- Type safety with TypeScript interfaces

## Testing Checklist

- [ ] Profile creation for new users
- [ ] Profile editing and updates
- [ ] Health metric calculations
- [ ] Form validation (all fields)
- [ ] Profile completion tracking
- [ ] Responsive design on mobile
- [ ] Database RLS policies
- [ ] Authentication integration

## Next Steps

1. **Run the database migration** in Supabase
2. **Add navigation links** to the profile page
3. **Test profile creation** with a new user account
4. **Customize the form fields** based on your specific needs
5. **Integrate with AI features** for personalized recommendations

This implementation provides a solid foundation for user profile management that can be extended with additional features as needed.