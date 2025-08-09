'use client'

import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Heart, 
  Dumbbell, 
  Pill, 
  Calculator,
  ArrowRight,
  Sparkles,
  User,
  CheckCircle,
  Loader2,
  Download,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/auth-context'
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context'

interface ServiceSectionProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  features: string[]
  aiPrompt: string
}

function AIServiceSection({ id, title, description, icon, color, features, aiPrompt }: ServiceSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { user } = useAuth()
  const { 
    sendTextMessage, 
    isStreaming, 
    uiMode, 
    switchToVoiceMode, 
    switchToTextMode,
    startVoiceRecording,
    isRecording
  } = useEnhancedAIAssistant()
  
  const [mode, setMode] = useState<'info' | 'ai-generation'>('info')
  const [progress, setProgress] = useState(0)
  const [collectedInfo, setCollectedInfo] = useState<string[]>([])
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)

  // Listen for section mode switching events from AI
  useEffect(() => {
    const handleSectionModeSwitch = (event: CustomEvent) => {
      const { sectionId, mode: newMode } = event.detail
      if (sectionId === id) {
        setMode(newMode)
        if (newMode === 'ai-generation') {
          setProgress(20)
        }
      }
    }

    window.addEventListener('switchSectionMode', handleSectionModeSwitch as EventListener)
    return () => {
      window.removeEventListener('switchSectionMode', handleSectionModeSwitch as EventListener)
    }
  }, [id])

  const handleGetStarted = async () => {
    if (!user) {
      // Dispatch event to show auth modal
      window.dispatchEvent(new CustomEvent('showAuthModal'))
      return
    }

    setMode('ai-generation')
    setProgress(10)
    
    // Enhanced AI prompt with section context
    const enhancedPrompt = `I want to use the ${title} feature. Please help me create a personalized ${title.toLowerCase()} plan. Start by switching to AI generation mode for the ${id} section and then collect the necessary information from me.`
    
    // Start AI conversation based on current UI mode
    if (uiMode === 'voice') {
      await startVoiceRecording()
      // Send the prompt after recording starts
      setTimeout(() => sendTextMessage(enhancedPrompt), 1000)
    } else {
      sendTextMessage(enhancedPrompt)
    }
  }

  const handleModeSwitch = async (newMode: 'voice' | 'text') => {
    if (newMode === 'voice') {
      await switchToVoiceMode()
    } else {
      await switchToTextMode()
    }
  }

  const mockInfoNeeded = [
    'Current fitness level',
    'Primary goals',
    'Available time',
    'Equipment access',
    'Health conditions'
  ]

  return (
    <section id={id} className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {mode === 'info' ? (
            // Information Mode
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
                    <Badge variant="outline" className="mt-2 text-rose-600 border-rose-200">
                      AI-Powered
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xl text-muted-foreground">{description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleGetStarted}
                    className={`bg-gradient-to-r ${color} text-white hover:opacity-90`}
                    disabled={!user}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Started with AI
                  </Button>
                  {!user && (
                    <p className="text-sm text-muted-foreground self-center">
                      Sign in to use AI features
                    </p>
                  )}
                </div>
              </div>

              <div className="relative">
                {id === 'workout-plans' ? (
                  <div className="flex justify-center items-center">
                    <img 
                      src="/Gym-bro.svg" 
                      alt="Gym Bro Workout Illustration" 
                      className="w-full max-w-md h-auto"
                    />
                  </div>
                ) : (
                  <Card className="border-2 hover:border-rose-200 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        AI Assistant Preview
                      </CardTitle>
                      <CardDescription>
                        See how our AI will help you with {title.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm">
                          "I'll analyze your current situation and create a personalized {title.toLowerCase()} plan just for you. Let's start by gathering some information..."
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4" />
                        <span>Powered by Gemini AI</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            // AI Generation Mode
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">AI {title} Generator</h2>
                <p className="text-muted-foreground">
                  Our AI is creating your personalized {title.toLowerCase()} plan
                </p>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Loader2 className={`h-5 w-5 ${isStreaming ? 'animate-spin' : ''}`} />
                      Progress
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={uiMode === 'voice' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleModeSwitch('voice')}
                      >
                        Voice
                      </Button>
                      <Button
                        variant={uiMode === 'text' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleModeSwitch('text')}
                      >
                        Text
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress} className="w-full" />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Information Needed:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mockInfoNeeded.map((info, index) => (
                        <div key={info} className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${index < collectedInfo.length ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={`text-sm ${index < collectedInfo.length ? 'line-through text-muted-foreground' : ''}`}>
                            {info}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {uiMode === 'voice' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium">
                          {isRecording ? 'Listening...' : 'Voice Mode Active'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Speak naturally to provide your information
                      </p>
                    </div>
                  )}

                  {generatedReport && (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                          Report Generated Successfully!
                        </h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share on WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setMode('info')}
                >
                  Back to Information
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default function AIServiceSections() {
  const services = [
    {
      id: 'fitness-consultation',
      title: 'FITNESS CONSULTATION',
      description: 'Get personalized fitness assessments and expert guidance tailored to your goals with AI analysis.',
      icon: <Heart className="h-8 w-8" />,
      color: 'from-rose-500 to-pink-600',
      features: ['Personal Training Analysis', 'Nutrition Coaching', 'Wellness Assessment', 'Progress Tracking'],
      aiPrompt: 'I need a comprehensive fitness consultation. Please help me create a personalized fitness assessment and plan.'
    },
    {
      id: 'workout-plans',
      title: 'WORKOUT PLANS',
      description: 'AI-generated workout plans designed specifically for your fitness level and objectives.',
      icon: <Dumbbell className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-600',
      features: ['Strength Training', 'Cardio Programs', 'Flexibility Plans', 'Progressive Overload'],
      aiPrompt: 'I want to create a custom workout plan. Please help me design a training program based on my goals and fitness level.'
    },
    {
      id: 'supplement-guidance',
      title: 'SUPPLEMENT GUIDANCE',
      description: 'Expert AI recommendations on supplements to optimize your health and performance.',
      icon: <Pill className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-600',
      features: ['Protein Analysis', 'Vitamin Recommendations', 'Pre/Post Workout', 'Safety Guidelines'],
      aiPrompt: 'I need supplement guidance. Please help me choose the right supplements for my fitness goals and health needs.'
    },
    {
      id: 'health-calculators',
      title: 'HEALTH CALCULATORS',
      description: 'Advanced AI-powered tools to calculate and track your health metrics and progress.',
      icon: <Calculator className="h-8 w-8" />,
      color: 'from-purple-500 to-violet-600',
      features: ['BMI Analysis', 'BMR Calculator', 'Calorie Tracking', 'Macro Distribution'],
      aiPrompt: 'I want to analyze my health metrics. Please help me calculate and understand my BMI, BMR, and nutritional needs.'
    }
  ]

  return (
    <>
      {services.map((service) => (
        <AIServiceSection key={service.id} {...service} />
      ))}
    </>
  )
}