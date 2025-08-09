'use client';

import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeBadge from '../ui/home-badge';
import { Beam } from '../ui/gridbeam';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FitnessFlipCards from './fitness-flip-cards';
import { EnhancedAIVoiceControlTray } from '@/components/ui/enhanced-ai-voice-control-tray';
import { useState, useEffect } from 'react';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import { Spotlight } from '@/components/ui/spotlight';


const space = Geist({
  subsets: ['latin'],
  variable: '--font-carlito',
  weight: '400',
});

export default function Hero() {
  const [showHeroTray, setShowHeroTray] = useState(false);
  const { isSidebarOpen } = useEnhancedAIAssistant();

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const isInHero = rect.top <= 100 && rect.bottom > 200;
        const isLargeScreen = window.innerWidth >= 1024;
        setShowHeroTray(isInHero && isLargeScreen);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      // Delay initial check to ensure DOM is ready
      setTimeout(handleScroll, 100);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      }
    };
  }, []);

  return (
    <div
      id="hero-section"
      className="border-secondary/50 bg-background relative min-h-screen overflow-hidden rounded-br-3xl rounded-bl-3xl border-t border-b py-32 md:px-6 md:rounded-br-[5rem] md:rounded-bl-[5rem]"
      style={{
        boxShadow: `
          inset 0 20px 30px -12px rgba(244, 63, 94, 0.2),
          inset 0 -20px 30px -12px rgba(244, 63, 94, 0.2)
        `,
      }}
    >
      <div className="absolute z-0 h-full w-full">
        <Spotlight />
      </div>
      <div className="absolute bottom-0 z-0 h-full w-full rotate-180">
        <Spotlight />
      </div>

      <div className="container mx-auto px-4 2xl:max-w-[1400px] relative z-10">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <HomeBadge />
        </motion.div>
        <div className="mx-auto mt-5 max-w-3xl text-center">
          <Beam />
          <motion.h1
            className={cn(
              'from-foreground/60 via-foreground to-foreground/60 dark:from-muted-foreground/55 dark:via-foreground dark:to-muted-foreground/55 max-w-5xl bg-gradient-to-r bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent sm:text-5xl xl:text-6xl/none',
              space.className,
            )}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
          >
Unlock Your Fitness Potential with
            <img
              src="/rose.webp"
              alt="Logo"
              draggable={false}
              className="mx-4 mb-2 inline-block h-12 w-12 md:h-16 md:w-16"
            />
            SSN AI Assistant.
          </motion.h1>
        </div>
        <motion.div
          className="mx-auto mt-5 max-w-4xl text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          <p className="text-muted-foreground text-xl">
            Smart fitness companion that analyzes your goals, creates custom workout plans, 
            and provides real-time coaching through advanced AI technology.
          </p>
        </motion.div>

        {/* AI Control Tray for large screens in hero */}
        <motion.div
          className="mx-auto mt-12 mb-8 pt-6 pb-4 flex justify-center lg:block hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showHeroTray ? 1 : 0, y: showHeroTray ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-center">
            <EnhancedAIVoiceControlTray size="lg" />
          </div>
        </motion.div>

        {/* Feature cards section - Flip Cards */}
        <FitnessFlipCards />





        {/* Industry standards section */}
        <motion.div
          className="mt-8 mb-8 relative flex items-center justify-center gap-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.75 }}
        >
          {/* Left SSN Icon */}
          <img
            src="/left-ssn-icon.png"
            alt="Left SSN Icon"
            width={100}
            height={40}
            className="absolute left-0 h-10 w-auto select-none opacity-30"
            draggable={false}
          />
          
          <span className="text-sm text-gray-500">
            We use industry standards like{' '}
          </span>
          <img
            src="/nextjs.webp"
            draggable={false}
            alt="Next.js"
            width={28}
            height={28}
            className="h-7 w-7 select-none"
          />
          <img
            src="/tailwind.webp"
            alt="Tailwind CSS"
            width={28}
            height={28}
            className="h-7 w-7 select-none"
            draggable={false}
          />
          <img
            src="/framer.webp"
            alt="Framer Motion"
            width={24}
            height={24}
            className="h-6 w-6 select-none"
            draggable={false}
          />

          {/* Right SSN Icon */}
          <img
            src="/right-ssn-icon.png"
            alt="Right SSN Icon"
            width={100}
            height={40}
            className="absolute right-0 h-10 w-auto select-none opacity-30"
            draggable={false}
          />
        </motion.div>
      </div>
    </div>
  );
}
