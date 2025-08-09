'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileFormData, UserProfile } from '@/types/profile'
import { Loader2, Save } from 'lucide-react'

interface ProfileFormProps {
  profile?: UserProfile | null
  onSave: (data: Partial<ProfileFormData>) => Promise<void>
  onCancel: () => void
}

export function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(profile?.available_equipment || [])
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState<string[]>(profile?.preferred_workout_types || [])
  const [selectedHealthConditions, setSelectedHealthConditions] = useState<string[]>(profile?.health_conditions || [])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      full_name: profile?.full_name || '',
      age: profile?.age || null,
      gender: profile?.gender || null,
      height: profile?.height || null,
      heightUnit: 'cm',
      current_weight: profile?.current_weight || null,
      target_weight: profile?.target_weight || null,
      primary_goal: profile?.primary_goal || null,
      secondary_goals: profile?.secondary_goals || [],
      target_date: profile?.target_date || '',
      activity_level: profile?.activity_level || null,
      target_activity_level: profile?.target_activity_level || null,
      workout_frequency: profile?.workout_frequency || null,
      workout_duration: profile?.workout_duration || null,
      health_conditions: profile?.health_conditions || [],
      medications: profile?.medications || [],
      injuries: profile?.injuries || [],
      dietary_restrictions: profile?.dietary_restrictions || [],
      available_equipment: profile?.available_equipment || [],
      preferred_workout_types: profile?.preferred_workout_types || [],
      gym_access: profile?.gym_access || false,
      home_workout_space: profile?.home_workout_space || false
    }
  })

  // Update form values when profile changes
  React.useEffect(() => {
    if (profile) {
      setValue('gender', profile.gender)
      setValue('primary_goal', profile.primary_goal)
      setValue('activity_level', profile.activity_level)
      setValue('target_activity_level', profile.target_activity_level)
      setValue('gym_access', profile.gym_access || false)
      setValue('home_workout_space', profile.home_workout_space || false)
    }
  }, [profile, setValue])

  // Convert height to cm before saving
  const convertHeightToCm = (height: number, unit: string): number => {
    if (unit === 'ft') {
      const feet = Math.floor(height)
      const inches = Math.round((height - feet) * 100)
      return Math.round((feet * 12 + inches) * 2.54)
    }
    if (unit === 'in') return Math.round(height * 2.54)
    return height
  }

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      const heightInCm = data.height ? convertHeightToCm(Number(data.height), data.heightUnit || 'cm') : null
      const formData = {
        ...data,
        height: heightInCm,
        available_equipment: selectedEquipment,
        preferred_workout_types: selectedWorkoutTypes,
        health_conditions: selectedHealthConditions
      }
      console.log('Form data being submitted:', formData)
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  const equipmentOptions = [
    'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 'Kettlebells',
    'Treadmill', 'Stationary Bike', 'Yoga Mat', 'Bench', 'Cable Machine'
  ]

  const workoutTypeOptions = [
    'Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates',
    'Running', 'Swimming', 'Cycling', 'Boxing', 'Dance'
  ]

  const healthConditionOptions = [
    'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Arthritis',
    'Back Problems', 'Knee Problems', 'Asthma', 'None'
  ]

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...register('full_name', { required: 'Name is required' })}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register('age', { 
                      required: 'Age is required',
                      min: { value: 13, message: 'Must be at least 13 years old' },
                      max: { value: 120, message: 'Must be less than 120 years old' }
                    })}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setValue('gender', value as any)} defaultValue={profile?.gender || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="height">Height</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => setValue('heightUnit', value as any)} defaultValue="cm">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="ft">ft</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder={watch('heightUnit') === 'ft' ? '5.11' : watch('heightUnit') === 'in' ? '70' : '175'}
                      {...register('height', { 
                        required: 'Height is required',
                        min: { value: 0.1, message: 'Height must be greater than 0' },
                        validate: (value) => {
                          if (!value) return 'Height is required'
                          const unit = watch('heightUnit') || 'cm'
                          if (unit === 'ft' && (value < 1 || value > 10)) return 'Height must be between 1-10 feet'
                          if (unit === 'in' && (value < 12 || value > 120)) return 'Height must be between 12-120 inches'
                          if (unit === 'cm' && (value < 30 || value > 300)) return 'Height must be between 30-300 cm'
                          return true
                        }
                      })
                    }
                    className="flex-1"
                  />
                  </div>
                  {errors.height && (
                    <p className="text-sm text-red-600">{errors.height.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="current_weight">Current Weight (kg)</Label>
                  <Input
                    id="current_weight"
                    type="number"
                    step="0.1"
                    {...register('current_weight', { 
                      required: 'Current weight is required',
                      min: { value: 30, message: 'Weight must be at least 30kg' },
                      max: { value: 300, message: 'Weight must be less than 300kg' }
                    })}
                  />
                  {errors.current_weight && (
                    <p className="text-sm text-red-600">{errors.current_weight.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="target_weight">Target Weight (kg)</Label>
                  <Input
                    id="target_weight"
                    type="number"
                    step="0.1"
                    {...register('target_weight')}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_goal">Primary Goal</Label>
                  <Select onValueChange={(value) => setValue('primary_goal', value as any)} defaultValue={profile?.primary_goal || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="general_fitness">General Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => {
                      if (value === 'custom') return
                      const months = parseInt(value)
                      const targetDate = new Date()
                      targetDate.setMonth(targetDate.getMonth() + months)
                      setValue('target_date', targetDate.toISOString().split('T')[0])
                    }}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Quick" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 months</SelectItem>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">1 year</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="target_date"
                      type="date"
                      {...register('target_date')}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="activity_level">Current Activity Level</Label>
                  <Select onValueChange={(value) => setValue('activity_level', value as any)} defaultValue={profile?.activity_level || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extremely_active">Extremely Active (2x/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_activity_level">Target Activity Level</Label>
                  <Select onValueChange={(value) => setValue('target_activity_level', value as any)} defaultValue={profile?.target_activity_level || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extremely_active">Extremely Active (2x/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workout_frequency">Workout Frequency</Label>
                  <Select onValueChange={(value) => setValue('workout_frequency', parseInt(value))} defaultValue={profile?.workout_frequency?.toString() || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workout frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 days/week</SelectItem>
                      <SelectItem value="5">5 days/week</SelectItem>
                      <SelectItem value="6">6 days/week</SelectItem>
                      <SelectItem value="7">7 days/week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workout_duration">Workout Duration (minutes)</Label>
                  <Input
                    id="workout_duration"
                    type="number"
                    min="15"
                    max="180"
                    {...register('workout_duration')}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <div>
                <Label>Health Conditions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {healthConditionOptions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={selectedHealthConditions.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedHealthConditions([...selectedHealthConditions, condition])
                          } else {
                            setSelectedHealthConditions(selectedHealthConditions.filter(c => c !== condition))
                          }
                        }}
                      />
                      <Label htmlFor={condition} className="text-sm">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List any medications you're currently taking..."
                  {...register('medications')}
                />
              </div>

              <div>
                <Label htmlFor="injuries">Past Injuries</Label>
                <Textarea
                  id="injuries"
                  placeholder="List any past injuries or physical limitations..."
                  {...register('injuries')}
                />
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div>
                <Label>Workout Access</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gym_access"
                      checked={watch('gym_access')}
                      onCheckedChange={(checked) => setValue('gym_access', !!checked)}
                    />
                    <Label htmlFor="gym_access">I have gym access</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="home_workout_space"
                      checked={watch('home_workout_space')}
                      onCheckedChange={(checked) => setValue('home_workout_space', !!checked)}
                    />
                    <Label htmlFor="home_workout_space">I have home workout space</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Available Equipment</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={selectedEquipment.includes(equipment)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEquipment([...selectedEquipment, equipment])
                          } else {
                            setSelectedEquipment(selectedEquipment.filter(e => e !== equipment))
                          }
                        }}
                      />
                      <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Workout Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {workoutTypeOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedWorkoutTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWorkoutTypes([...selectedWorkoutTypes, type])
                          } else {
                            setSelectedWorkoutTypes(selectedWorkoutTypes.filter(t => t !== type))
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>


            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}