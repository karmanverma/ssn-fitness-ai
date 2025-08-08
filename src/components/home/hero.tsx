'use client';

import { PixelCard } from '../ui/pixelcards';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { CloudLightning, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeBadge from '../ui/home-badge';
import { Beam } from '../ui/gridbeam';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CardHoverEffect } from '../ui/pulse-card';
import { motion } from 'framer-motion';
import Link from 'next/link';


const space = Geist({
  subsets: ['latin'],
  variable: '--font-carlito',
  weight: '400',
});

const PIXEL_SCRIPT_URL =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pixel-RKkUKH2OXWk9adKbDnozmndkwseTQh.js';

export default function Hero() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Use Intersection Observer to load the script only when the component is in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          import('@/lib/load-script').then(({ loadScript }) => {
            loadScript(PIXEL_SCRIPT_URL)
              .then(() => {
                setIsScriptLoaded(true);
              })
              .catch((error) => {
                console.error('Error loading pixel script:', error);
              });
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    const heroElement = document.getElementById('hero-section');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const cards = [
    {
      title: 'FITNESS CONSULTATION',
      description: 'Personalized fitness assessments and expert guidance.',
      icon: <CloudLightning className="h-full w-full" />,
      variant: 'rose',
      showGridLines: true,
    },
    {
      title: 'WORKOUT PLANS',
      description: 'Custom training programs tailored to your goals.',
      icon: <Sparkles className="h-full w-full" />,
      variant: 'rose',
      showGridLines: true,
    },
  ] as const;

  const cardConfigurations = [
    {
      color: 'rose',
      icon: 'Blocks',
      label: 'Command',
      canvasProps: { gap: 3, speed: 80, colors: '#fff, #fda4af, #e11d48' },
      number: 100,
      desc: 'SUPPLEMENT GUIDANCE',
    },
    {
      color: 'rose',
      icon: 'f',
      label: 'Dropper',
      canvasProps: { gap: 3, speed: 80, colors: '#fff, #fda4af, #e11d48' },
      number: 15,
      desc: 'HEALTH CALCULATORS',
    },
  ];

  return (
    <div
      id="hero-section"
      className="bg-background relative min-h-screen w-full overflow-x-hidden py-32 md:px-6"
    >
      <div className="container mx-auto px-4 2xl:max-w-[1400px]">
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
Start Your Personal Fitness Journey with
            <img
              src="/rose.webp"
              alt="Logo"
              draggable={false}
              className="mx-4 mb-2 inline-block h-12 w-12 md:h-16 md:w-16"
            />
            SSN.
          </motion.h1>
        </div>
        <motion.div
          className="mx-auto mt-5 max-w-[580px] text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          <p className="text-muted-foreground text-xl">
            Your complete fitness companion offering personalized consultations, custom workout plans, 
            expert supplement guidance, and powerful health tracking tools.
          </p>
        </motion.div>
        <motion.div
          className="mt-8 flex justify-center gap-3"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.4 }}
        >
          <Link href="/docs/introduction">
            <Button className="bg-gradient-to-b from-rose-500 to-rose-700 text-sm text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]">
              Start Your Journey
            </Button>
          </Link>
          <Link href="/about">
            <Button variant={'secondary'}>
              Learn More <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
        {/* Feature cards section - V0 Compatible and Animated Out of Box */}
        <div className="mx-auto mt-12 w-[90%] text-center xl:-mt-[150px]">
          <div className="relative">
            {/* Desktop layout - cards on left and right */}
            <div className="hidden xl:flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.25 }}
                className="w-[280px]"
              >
                <CardHoverEffect
                  title={cards[0].title}
                  description={cards[0].description}
                  icon={cards[0].icon}
                  variant={cards[0].variant}
                  glowEffect={true}
                  size={'lg'}
                  showGridLines={cards[0].showGridLines}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.25 }}
                className="w-[280px]"
              >
                <CardHoverEffect
                  title={cards[1].title}
                  description={cards[1].description}
                  icon={cards[1].icon}
                  variant={cards[1].variant}
                  glowEffect={true}
                  size={'lg'}
                  showGridLines={cards[1].showGridLines}
                />
              </motion.div>
            </div>

            {/* Mobile view - show cards in center for smaller screens */}
            <div className="flex flex-col gap-8 sm:flex-row xl:hidden">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.25 }}
                >
                  <CardHoverEffect
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                    variant={card.variant}
                    glowEffect={true}
                    size={'lg'}
                    showGridLines={card.showGridLines}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats cards section - 100+ Components and 15+ Categories */}
        <div id="stats-cards-section" className="mx-auto mt-12 mb-[-100px] w-full text-center">
          <div className="relative">
            {/* Desktop layout - stats cards on left and right */}
            <div className="hidden xl:flex justify-between items-center">
              {isScriptLoaded && (
                <motion.div
                  className="bg-background h-[370px] w-[300px]"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.5 }}
                >
                  <PixelCard
                    key={cardConfigurations[0].label}
                    label={cardConfigurations[0].label}
                    canvasProps={cardConfigurations[0].canvasProps}
                    number={cardConfigurations[0].number}
                    icon={cardConfigurations[0].icon}
                    desc={cardConfigurations[0].desc}
                    color={cardConfigurations[0].color}
                  />
                </motion.div>
              )}
              {isScriptLoaded && (
                <motion.div
                  className="bg-background h-[370px] w-[300px]"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.5 }}
                >
                  <PixelCard
                    color={cardConfigurations[1].color}
                    icon={cardConfigurations[1].icon}
                    key={cardConfigurations[1].label}
                    label={cardConfigurations[1].label}
                    canvasProps={cardConfigurations[1].canvasProps}
                    number={cardConfigurations[1].number}
                    desc={cardConfigurations[1].desc}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>



        {/* Industry standards section */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.75 }}
        >
          <motion.img
            draggable={false}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1.25 }}
            src="/vector4.webp"
            alt="Next.js"
            className="mt-4 mr-2 hidden w-96 brightness-[4] select-none xl:block"
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
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1.25 }}
            className="mt-4 ml-2 hidden w-96 select-none xl:block"
          >
            <img
              src="/vector3.webp"
              alt="Vector graphic"
              width={384}
              height={100}
              draggable={false}
              className="brightness-[4]"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
