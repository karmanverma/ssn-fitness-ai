'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Dumbbell, 
  Heart, 
  Calculator, 
  Users, 
  Zap, 
  Target,
  Activity,
  Pill,
  Brain,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const services = [
  {
    title: 'FITNESS CONSULTATION',
    description: 'Get personalized fitness assessments and expert guidance tailored to your goals.',
    icon: <Heart className="h-8 w-8" />,
    features: ['Personal Training', 'Nutrition Coaching', 'Wellness Assessment'],
    color: 'from-rose-500 to-pink-600'
  },
  {
    title: 'WORKOUT PLANS',
    description: 'Custom training programs designed specifically for your fitness level and objectives.',
    icon: <Dumbbell className="h-8 w-8" />,
    features: ['Strength Training', 'Cardio & Endurance', 'Yoga & Flexibility', 'Bodyweight'],
    color: 'from-blue-500 to-cyan-600'
  },
  {
    title: 'SUPPLEMENT GUIDANCE',
    description: 'Expert recommendations on supplements to optimize your health and performance.',
    icon: <Pill className="h-8 w-8" />,
    features: ['Protein Supplements', 'Vitamins & Minerals', 'Pre/Post Workout', 'Weight Management'],
    color: 'from-green-500 to-emerald-600'
  },
  {
    title: 'HEALTH CALCULATORS',
    description: 'Powerful tools to track and calculate your health metrics and progress.',
    icon: <Calculator className="h-8 w-8" />,
    features: ['BMI Calculator', 'BMR Calculator', 'Calorie Tracker', 'Macro Calculator'],
    color: 'from-purple-500 to-violet-600'
  }
]

const specialties = [
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Goal-Oriented',
    description: 'Tailored plans for your specific fitness objectives'
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'AI-Powered',
    description: 'Smart recommendations based on your data'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Expert Backed',
    description: 'Guidance from certified fitness professionals'
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: 'Real-time Tracking',
    description: 'Monitor your progress with advanced analytics'
  }
]

export default function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 text-rose-600 border-rose-200">
            Our Services
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Complete Fitness Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From personalized consultations to AI-powered workout plans, we provide everything you need 
            for your fitness journey with Sri Sai Nutritions.
          </p>
        </motion.div>

        {/* Main Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-rose-200 group">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Specialties Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold mb-4">Why Choose SSN Fitness?</h3>
          <p className="text-muted-foreground mb-12">
            Powered by Sri Sai Nutritions' expertise and cutting-edge AI technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((specialty, index) => (
            <motion.div
              key={specialty.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="text-center p-6 rounded-xl bg-card border hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white mx-auto mb-4">
                {specialty.icon}
              </div>
              <h4 className="font-semibold mb-2">{specialty.title}</h4>
              <p className="text-sm text-muted-foreground">{specialty.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}