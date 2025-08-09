'use client';

import { motion } from 'framer-motion';
import { 
  Brain,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const space = Geist({
  subsets: ['latin'],
  variable: '--font-carlito',
  weight: '400',
});

interface ServiceCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}

function ServiceDotCard({ icon, title, description, comingSoon, index, row, col, totalCols }: ServiceCard & { 
  index: number; 
  row: number; 
  col: number; 
  totalCols: number; 
}) {
  const isFirstCol = col === 0;
  const isLastCol = col === totalCols - 1;
  const isFirstRow = row === 0;
  const isLastRow = row === 1; // We have 2 rows

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative w-full h-full"
    >
      {/* Coming Soon Sticker */}
      {comingSoon && (
        <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12">
          Coming Soon
        </div>
      )}

      {/* Card Content */}
      <div className={`relative h-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700 transition-colors duration-300 px-6 py-8 ${comingSoon ? 'opacity-75' : ''}`}>
        <div className="text-center h-full flex flex-col">
          <div className="flex justify-center mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white ${comingSoon ? 'opacity-75' : ''}`}>
              {icon}
            </div>
          </div>
          <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
            {description}
          </p>
        </div>
      </div>

      {/* Horizontal Lines */}
      {!isFirstRow && (
        <div className="absolute -top-4 left-0 w-full h-px bg-zinc-400 dark:bg-zinc-700" />
      )}
      {!isLastRow && (
        <div className="absolute -bottom-4 left-0 w-full h-px bg-zinc-400 dark:bg-zinc-700" />
      )}

      {/* Vertical Lines */}
      {!isFirstCol && (
        <div className="absolute top-0 -left-4 w-px h-full bg-zinc-400 dark:bg-zinc-700" />
      )}
      {!isLastCol && (
        <div className="absolute top-0 -right-4 w-px h-full bg-zinc-400 dark:bg-zinc-700" />
      )}

      {/* Corner Dots */}
      {/* Top-left dot */}
      <div className="absolute -top-4 -left-4 w-2 h-2 bg-rose-500 rounded-full outline outline-4 outline-gray-50 dark:outline-gray-950 z-10" />
      
      {/* Top-right dot */}
      {isLastCol && (
        <div className="absolute -top-4 -right-4 w-2 h-2 bg-rose-500 rounded-full outline outline-4 outline-gray-50 dark:outline-gray-950 z-10" />
      )}
      
      {/* Bottom-left dot */}
      {isLastRow && (
        <div className="absolute -bottom-4 -left-4 w-2 h-2 bg-rose-500 rounded-full outline outline-4 outline-gray-50 dark:outline-gray-950 z-10" />
      )}
      
      {/* Bottom-right dot */}
      {isLastRow && isLastCol && (
        <div className="absolute -bottom-4 -right-4 w-2 h-2 bg-rose-500 rounded-full outline outline-4 outline-gray-50 dark:outline-gray-950 z-10" />
      )}
    </motion.div>
  );
}

export default function WhatWeProvide() {
  const services: ServiceCard[] = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Smart Meal Planning',
      description: 'AI-powered nutrition plans that adapt to your dietary preferences, restrictions, and fitness goals for optimal results.'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Recovery Optimization',
      description: 'Advanced recovery tracking and recommendations including sleep analysis, rest day planning, and injury prevention strategies.'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI Voice Assistant',
      description: 'Interactive voice-powered AI that provides real-time coaching, motivation, and answers to your fitness questions.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Goal Tracking',
      description: 'Smart progress monitoring with detailed analytics to keep you motivated and on track toward your goals.',
      comingSoon: true
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Personal Profiles',
      description: 'Comprehensive user profiles that adapt and learn from your preferences, progress, and feedback.'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Progress Analytics',
      description: 'Detailed reports and insights about your fitness journey with actionable recommendations for improvement.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Habit Formation',
      description: 'Intelligent habit tracking and formation system that helps you build lasting healthy lifestyle changes step by step.',
      comingSoon: true
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Community Support',
      description: 'Connect with like-minded fitness enthusiasts, share progress, and get motivated through our supportive community platform.',
      comingSoon: true
    }
  ];

  const totalCols = 4;

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-[540px] mb-16"
        >
          <div className="flex justify-center">
            <button
              type="button"
              className="group bg-background/50 hover:shadow-primary/[0.1] dark:border-border relative z-[60] mx-auto rounded-full border border-zinc-500/80 px-6 py-1 text-xs backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100 md:text-sm"
            >
              <div className="via-primary absolute inset-x-0 -top-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent to-transparent shadow-2xl transition-all duration-500 group-hover:w-3/4"></div>
              <div className="via-primary absolute inset-x-0 -bottom-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent to-transparent shadow-2xl transition-all duration-500 group-hover:h-px"></div>
              <span className="relative">Features</span>
            </button>
          </div>
          <h2
            className={cn(
              'from-foreground/60 via-foreground to-foreground/60 dark:from-muted-foreground/55 dark:via-foreground dark:to-muted-foreground/55 mt-5 bg-gradient-to-r bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]',
              space.className,
            )}
          >
            What we provide
          </h2>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Desktop Grid (4x2) */}
          <div className="hidden lg:grid grid-cols-4 gap-8 grid-rows-2">
            {services.map((service, index) => {
              const row = Math.floor(index / totalCols);
              const col = index % totalCols;
              return (
                <ServiceDotCard
                  key={service.title}
                  {...service}
                  index={index}
                  row={row}
                  col={col}
                  totalCols={totalCols}
                />
              );
            })}
          </div>

          {/* Tablet Grid (2x4) */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-8 grid-rows-4">
            {services.map((service, index) => {
              const row = Math.floor(index / 2);
              const col = index % 2;
              return (
                <ServiceDotCard
                  key={service.title}
                  {...service}
                  index={index}
                  row={row}
                  col={col}
                  totalCols={2}
                />
              );
            })}
          </div>

          {/* Mobile Grid (1x8) */}
          <div className="grid md:hidden grid-cols-1 gap-8">
            {services.map((service, index) => (
              <ServiceDotCard
                key={service.title}
                {...service}
                index={index}
                row={index}
                col={0}
                totalCols={1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}