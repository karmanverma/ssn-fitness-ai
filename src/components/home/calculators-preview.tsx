'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Calculator, Activity, Target, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const calculators = [
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index',
    icon: <Calculator className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'BMR Calculator', 
    description: 'Find your Basal Metabolic Rate',
    icon: <Activity className="h-6 w-6" />,
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Calorie Tracker',
    description: 'Track your daily calorie needs',
    icon: <Target className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Macro Calculator',
    description: 'Calculate optimal macronutrient ratios',
    icon: <Zap className="h-6 w-6" />,
    color: 'from-orange-500 to-orange-600'
  }
]

export default function CalculatorsPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)

  const calculateBMI = () => {
    if (height && weight) {
      const heightInM = parseFloat(height) / 100
      const weightInKg = parseFloat(weight)
      const bmiValue = weightInKg / (heightInM * heightInM)
      setBmi(Math.round(bmiValue * 10) / 10)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600' }
    return { category: 'Obese', color: 'text-red-600' }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 text-rose-600 border-rose-200">
            Health Tools
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Smart Health Calculators
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Use our AI-powered calculators to track your health metrics and get personalized insights 
            for your fitness journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Interactive BMI Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 border-2 hover:border-rose-200 transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mx-auto mb-4">
                  <Calculator className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Try Our BMI Calculator</CardTitle>
                <CardDescription>Get instant results and health insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={calculateBMI}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                  disabled={!height || !weight}
                >
                  Calculate BMI
                </Button>

                {bmi && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-6 bg-muted/50 rounded-lg"
                  >
                    <div className="text-3xl font-bold mb-2">{bmi}</div>
                    <div className={`text-lg font-semibold ${getBMICategory(bmi).color}`}>
                      {getBMICategory(bmi).category}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Consult with our experts for personalized advice
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Calculator Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {calculators.map((calc, index) => (
              <motion.div
                key={calc.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${calc.color} flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {calc.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{calc.title}</h3>
                    <p className="text-sm text-muted-foreground">{calc.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl p-8 border border-rose-200/50">
            <h3 className="text-2xl font-bold mb-4">Ready for More Advanced Tools?</h3>
            <p className="text-muted-foreground mb-6">
              Access all our health calculators and get personalized recommendations with AI insights.
            </p>
            <Button className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700">
              Explore All Calculators
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}