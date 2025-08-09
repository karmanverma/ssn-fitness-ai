'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Clock, CheckCircle, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ConsultPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    fitnessGoal: '',
    currentFitnessLevel: '',
    healthConditions: '',
    supplementExperience: '',
    preferredConsultationType: '',
    message: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to book a consultation')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('consultations')
        .insert([{
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          fitness_goal: formData.fitnessGoal,
          current_fitness_level: formData.currentFitnessLevel,
          health_conditions: formData.healthConditions,
          supplement_experience: formData.supplementExperience,
          preferred_consultation_type: formData.preferredConsultationType,
          message: formData.message
        }])

      if (error) throw error

      toast.success('Consultation request submitted successfully! We\'ll contact you soon.')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        fitnessGoal: '',
        currentFitnessLevel: '',
        healthConditions: '',
        supplementExperience: '',
        preferredConsultationType: '',
        message: ''
      })
    } catch (error: any) {
      toast.error('Failed to submit consultation request. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 text-rose-600 border-rose-200">
            Expert Consultation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Consult with Expert Dherya Bajaj
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized fitness, nutrition, and supplement guidance from our certified expert. 
            Book your free consultation today!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Expert Profile */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24">
              <CardHeader className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white mx-auto mb-4">
                  <User className="h-12 w-12" />
                </div>
                <CardTitle className="text-2xl">Dherya Bajaj</CardTitle>
                <CardDescription>Certified Fitness & Nutrition Expert</CardDescription>
                <div className="flex justify-center items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.9/5)</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Specializations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Fitness Consultation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Nutrition Coaching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Supplement Guidance</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-400">Limited Time Offer</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Free consultation sessions available now!
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    5+ years helping clients achieve their fitness goals with Sri Sai Nutritions
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Consultation Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Book Your Free Consultation</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Your age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                  </div>

                  {/* Fitness Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fitnessGoal">Fitness Goal *</Label>
                      <Input
                        id="fitnessGoal"
                        value={formData.fitnessGoal}
                        onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                        placeholder="e.g., Weight loss, Muscle gain, General fitness"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentFitnessLevel">Current Fitness Level *</Label>
                      <Select value={formData.currentFitnessLevel} onValueChange={(value) => handleInputChange('currentFitnessLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your fitness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplementExperience">Supplement Experience</Label>
                      <Select value={formData.supplementExperience} onValueChange={(value) => handleInputChange('supplementExperience', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your supplement experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No experience</SelectItem>
                          <SelectItem value="basic">Basic knowledge</SelectItem>
                          <SelectItem value="experienced">Experienced user</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredConsultationType">Preferred Consultation Type *</Label>
                      <Select value={formData.preferredConsultationType} onValueChange={(value) => handleInputChange('preferredConsultationType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select consultation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fitness">Fitness Consultation</SelectItem>
                          <SelectItem value="nutrition">Nutrition Coaching</SelectItem>
                          <SelectItem value="supplements">Supplement Guidance</SelectItem>
                          <SelectItem value="general">General (All Areas)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="healthConditions">Health Conditions</Label>
                      <Textarea
                        id="healthConditions"
                        value={formData.healthConditions}
                        onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                        placeholder="Any health conditions, injuries, or medical concerns we should know about"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us more about your goals or any specific questions you have"
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !user}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                  >
                    {loading ? 'Submitting...' : 'Book Free Consultation'}
                  </Button>

                  {!user && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please sign in to book a consultation
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}