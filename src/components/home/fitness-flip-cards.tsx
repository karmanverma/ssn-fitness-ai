'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules'
import { 
  Heart, 
  Dumbbell, 
  Pill, 
  Calculator,
  ArrowRight,
  Zap,
  Target,
  Activity,
  Brain,
  User
} from 'lucide-react'

import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

interface ServiceCardProps {
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: React.ReactNode
  sectionId: string
  gradient: string
}

function ServiceFlipCard({ title, subtitle, description, features, icon, sectionId, gradient, isCenter, onClick, swiperInstance }: ServiceCardProps & { isCenter?: boolean; onClick?: () => void; swiperInstance?: any }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isActive, setIsActive] = useState(false)
  
  // Auto-flip when card is active or hovered
  React.useEffect(() => {
    if (isActive) {
      setIsFlipped(true)
    }
  }, [isActive])
  
  const handleMouseEnter = () => {
    if (isActive && swiperInstance?.autoplay) {
      swiperInstance.autoplay.stop()
    }
    if (!isActive) {
      setIsFlipped(true)
    }
  }
  
  const handleMouseLeave = () => {
    if (isActive && swiperInstance?.autoplay) {
      swiperInstance.autoplay.start()
    }
    if (!isActive) {
      setIsFlipped(false)
    }
  }
  
  // Listen for active state changes
  React.useEffect(() => {
    const handleSetActive = () => setIsActive(true)
    const handleSetInactive = () => setIsActive(false)
    
    const element = document.querySelector(`[data-card="${title}"]`)
    if (element) {
      element.addEventListener('setActive', handleSetActive)
      element.addEventListener('setInactive', handleSetInactive)
      return () => {
        element.removeEventListener('setActive', handleSetActive)
        element.removeEventListener('setInactive', handleSetInactive)
      }
    }
  }, [])

  const scrollToSection = () => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      className="group relative h-[360px] w-full max-w-[300px] [perspective:2000px] cursor-pointer"
      data-card={title}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div
        className={cn(
          'relative h-full w-full',
          '[transform-style:preserve-3d]',
          'transition-all duration-700',
          isFlipped
            ? '[transform:rotateY(180deg)]'
            : '[transform:rotateY(0deg)]',
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[transform:rotateY(0deg)] [backface-visibility:hidden]',
            'overflow-hidden rounded-2xl',
            'bg-gradient-to-br from-white via-slate-50 to-slate-100',
            'dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800',
            'border border-slate-200 dark:border-zinc-800/50',
            'shadow-lg dark:shadow-xl',
            'transition-all duration-700',
            'group-hover:shadow-xl dark:group-hover:shadow-2xl',
            'group-hover:border-rose-200 dark:group-hover:border-rose-800/30',
            isFlipped ? 'opacity-0' : 'opacity-100',
          )}
        >
          {/* Background gradient effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />

          {/* Animated elements */}
          <div className="absolute inset-0 flex items-center justify-center pt-8">
            <div className="relative flex h-[100px] w-[200px] flex-col items-center justify-center gap-2">
              {/* Animated bars */}
              {[...Array(4)].map((_, i) => {
                const widths = [75, 85, 68, 92];
                const margins = [5, 12, 8, 15];
                return (
                  <div
                    key={i}
                    className={cn(
                      'h-2 w-full rounded-sm',
                      `bg-gradient-to-r ${gradient}`,
                      'animate-[slideIn_2s_ease-in-out_infinite]',
                      'opacity-0',
                    )}
                    style={{
                      width: `${widths[i]}%`,
                      animationDelay: `${i * 0.3}s`,
                      marginLeft: `${margins[i]}%`,
                    }}
                  />
                );
              })}

              {/* Central icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={cn(
                    'h-16 w-16 rounded-xl',
                    `bg-gradient-to-br ${gradient}`,
                    'flex items-center justify-center text-white',
                    'shadow-lg',

                    'transition-all duration-500 group-hover:scale-110 group-hover:rotate-12',
                  )}
                >
                  {icon}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute right-0 bottom-0 left-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <h3 className="text-lg leading-snug font-semibold tracking-tight text-zinc-900 transition-all duration-500 ease-out group-hover:translate-y-[-4px] dark:text-white">
                  {title}
                </h3>
                <p className="line-clamp-2 text-sm tracking-tight text-zinc-600 transition-all delay-[50ms] duration-500 ease-out group-hover:translate-y-[-4px] dark:text-zinc-300">
                  {subtitle}
                </p>
              </div>
              <div className="group/icon relative">
                <div
                  className={cn(
                    'absolute inset-[-8px] rounded-lg transition-opacity duration-300',
                    `bg-gradient-to-br ${gradient} opacity-20`,
                    'opacity-0 group-hover/icon:opacity-100',
                  )}
                />
                <Zap className="relative z-10 h-5 w-5 text-rose-500 transition-all duration-300 group-hover/icon:scale-110 group-hover/icon:rotate-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full',
            '[transform:rotateY(180deg)] [backface-visibility:hidden]',
            'rounded-2xl p-5',
            'bg-gradient-to-br from-white via-slate-50 to-slate-100',
            'dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800',
            'border border-slate-200 dark:border-zinc-800',
            'shadow-lg dark:shadow-xl',
            'flex flex-col',
            'transition-all duration-700',
            'group-hover:shadow-xl dark:group-hover:shadow-2xl',
            'group-hover:border-rose-200 dark:group-hover:border-rose-800/30',
            !isFlipped ? 'opacity-0' : 'opacity-100',
          )}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-5`} />

          <div className="relative z-10 flex-1 space-y-4">
            <div className="space-y-2">
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}>
                  {icon}
                </div>
                <h3 className="text-lg leading-snug font-semibold tracking-tight text-zinc-900 transition-all duration-500 ease-out group-hover:translate-y-[-2px] dark:text-white">
                  {title}
                </h3>
              </div>
              <p className="line-clamp-2 text-sm tracking-tight text-zinc-600 transition-all duration-500 ease-out group-hover:translate-y-[-2px] dark:text-zinc-400">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              {features.map((feature, index) => {
                const icons = [Target, Activity, Brain, Zap]
                const IconComponent = icons[index % icons.length]

                return (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-zinc-700 transition-all duration-500 dark:text-zinc-300"
                    style={{
                      transform: isFlipped
                        ? 'translateX(0)'
                        : 'translateX(-10px)',
                      opacity: isFlipped ? 1 : 0,
                      transitionDelay: `${index * 100 + 200}ms`,
                    }}
                  >
                    <div className="bg-rose-100 dark:bg-rose-900/20 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md">
                      <IconComponent className="h-3 w-3 text-rose-600" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative z-10 mt-auto border-t border-slate-200 pt-4 dark:border-zinc-800">
            <button
              onClick={scrollToSection}
              className={cn(
                'group/start relative w-full',
                'flex items-center justify-between',
                'rounded-lg p-2.5',
                'transition-all duration-300',
                'bg-gradient-to-r from-slate-100 via-slate-100 to-slate-100',
                'dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800',
                `hover:${gradient.replace('from-', 'hover:from-').replace('to-', 'hover:to-')} hover:opacity-10`,
                'hover:scale-[1.02] hover:cursor-pointer',
                'hover:border-rose-300 border border-transparent',
              )}
            >
              <span className="group-hover/start:text-rose-600 text-sm font-semibold text-zinc-900 transition-colors duration-300 dark:text-white">
                Get Started with AI
              </span>
              <div className="group/icon relative">
                <div
                  className={cn(
                    'absolute inset-[-6px] rounded-lg transition-all duration-300',
                    `bg-gradient-to-br ${gradient} opacity-20`,
                    'scale-90 opacity-0 group-hover/start:scale-100 group-hover/start:opacity-100',
                  )}
                />
                <ArrowRight className="relative z-10 h-4 w-4 text-rose-500 transition-all duration-300 group-hover/start:translate-x-1 group-hover/start:scale-110" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          50% {
            transform: translateX(0);
            opacity: 0.8;
          }
          100% {
            transform: translateX(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default function FitnessFlipCards() {
  const [swiperInstance, setSwiperInstance] = useState(null)
  
  const services = [
    {
      title: 'FITNESS CONSULTATION',
      subtitle: 'AI-Powered Personal Training',
      description: 'Get personalized fitness assessments and expert guidance tailored to your goals with AI analysis.',
      features: ['Personal Training', 'Nutrition Coaching', 'Wellness Assessment', 'AI Analysis'],
      icon: <Heart className="h-8 w-8" />,
      sectionId: 'fitness-consultation',
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      title: 'WORKOUT PLANS',
      subtitle: 'Custom AI Training Programs',
      description: 'AI-generated workout plans designed specifically for your fitness level and objectives.',
      features: ['Strength Training', 'Cardio Programs', 'Flexibility Plans', 'AI Optimization'],
      icon: <Dumbbell className="h-8 w-8" />,
      sectionId: 'workout-plans',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'SUPPLEMENT GUIDANCE',
      subtitle: 'AI Supplement Recommendations',
      description: 'Expert AI recommendations on supplements to optimize your health and performance.',
      features: ['Protein Guidance', 'Vitamin Analysis', 'Pre/Post Workout', 'AI Matching'],
      icon: <Pill className="h-8 w-8" />,
      sectionId: 'supplement-guidance',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'HEALTH CALCULATORS',
      subtitle: 'AI Health Analytics',
      description: 'Advanced AI-powered tools to calculate and track your health metrics and progress.',
      features: ['BMI Analysis', 'BMR Calculator', 'Calorie Tracking', 'AI Insights'],
      icon: <Calculator className="h-8 w-8" />,
      sectionId: 'health-calculators',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      title: 'EXPERT CONSULTATION',
      subtitle: 'Professional Fitness Experts',
      description: 'Connect with certified fitness professionals for personalized guidance and expert advice.',
      features: ['Certified Trainers', 'One-on-One Sessions', 'Expert Advice', 'Professional Support'],
      icon: <User className="h-8 w-8" />,
      sectionId: 'expert-consultation',
      gradient: 'from-orange-500 to-red-600'
    }
  ]

  const handleCardClick = (index) => {
    if (swiperInstance) {
      swiperInstance.slideTo(index)
    }
  }

  const handleSlideChange = (swiper) => {
    document.querySelectorAll('[data-card]').forEach(card => {
      card.dispatchEvent(new Event('setInactive'))
    })
    const activeSlide = swiper.slides[swiper.activeIndex]
    const activeCard = activeSlide?.querySelector('[data-card]')
    if (activeCard) {
      activeCard.dispatchEvent(new Event('setActive'))
    }
  }

  const handleSwiperInit = (swiper) => {
    setSwiperInstance(swiper)
    setTimeout(() => {
      swiper.slideTo(1, 0)
      const activeSlide = swiper.slides[1]
      const activeCard = activeSlide?.querySelector('[data-card]')
      if (activeCard) {
        activeCard.dispatchEvent(new Event('setActive'))
      }
    }, 100)
  }

  const swiperStyles = `
    .fitness-swiper {
      width: 100%;
      padding-bottom: 50px;
    }
    
    .fitness-swiper .swiper-slide {
      background-position: center;
      background-size: cover;
      width: 320px;
      height: 400px;
    }
    
    .fitness-swiper .swiper-3d .swiper-slide-shadow-left,
    .fitness-swiper .swiper-3d .swiper-slide-shadow-right {
      background: none;
    }
  `

  return (
    <div className="mx-auto mt-12 px-4 max-w-[1200px] xl:mt-12 overflow-hidden">
      <style>{swiperStyles}</style>
      
      {/* Desktop Carousel */}
      <div className="hidden lg:block">
        <Swiper
          className="fitness-swiper"
          spaceBetween={30}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={3}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
          }}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          modules={[EffectCoverflow, Autoplay]}
        >
          {services.map((service, index) => (
            <SwiperSlide key={service.title}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.25 + index * 0.1 }}
                className="flex justify-center h-full"
              >
                <ServiceFlipCard 
                  {...service} 
                  onClick={() => handleCardClick(index)}
                  swiperInstance={swiperInstance}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Tablet and Mobile Carousel */}
      <div className="lg:hidden w-full px-0 mx-0">
        <Swiper
          className="fitness-swiper"
          spaceBetween={30}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={1}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
          }}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          modules={[EffectCoverflow, Autoplay]}
        >
          {services.map((service, index) => (
            <SwiperSlide key={service.title}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.25 + index * 0.1 }}
                className="flex justify-center h-full"
              >
                <ServiceFlipCard 
                  {...service} 
                  onClick={() => handleCardClick(index)}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}