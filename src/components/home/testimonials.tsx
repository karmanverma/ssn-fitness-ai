'use client';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const space = Geist({
  subsets: ['latin'],
  variable: '--font-carlito',
  weight: '400',
});

const testimonials = [
  {
    text: 'Dherya\'s nutrition consultation completely transformed my fitness journey. Lost 15kg in 4 months with Sri Sai products!',

    name: 'Arjun Mehta',
    username: '@arjunfit',
  },
  {
    text: 'The SSN Fitness Platform is incredible! Personalized workouts and nutrition tracking made everything so simple.',

    name: 'Sara Lin',
    username: '@sara_fitness',
  },
  {
    text: 'Sri Sai Nutrition whey protein is the best I\'ve tried. Great taste, amazing results, and Dherya\'s guidance is top-notch.',

    name: 'Devon Carter',
    username: '@devonfitness',
  },
  {
    text: 'Dherya\'s consultation helped me understand my body better. The customized diet plan with Sri Sai supplements works perfectly.',

    name: 'Priya Shah',
    username: '@priya_wellness',
  },
  {
    text: 'SSN Fitness Platform\'s meal planning feature is a game-changer. Combined with Dherya\'s expertise, I\'m in the best shape ever!',

    name: 'Leo Martin',
    username: '@leo_gains',
  },
  {
    text: 'Sri Sai Nutrition products are pure quality. Dherya\'s consultation made me realize what my body actually needed.',

    name: 'Chloe Winters',
    username: '@chloe_strong',
  },
  {
    text: 'As a busy professional, SSN Fitness Platform keeps me on track. Dherya\'s guidance made sustainable changes possible.',

    name: 'Ayaan Malik',
    username: '@ayaan_health',
  },
  {
    text: 'The combination of Sri Sai supplements and Dherya\'s consultation is unbeatable. Gained 8kg lean muscle in 6 months!',

    name: 'Monica Reeves',
    username: '@monica_muscle',
  },
  {
    text: 'SSN Fitness Platform\'s progress tracking motivated me daily. Dherya\'s support made all the difference in my transformation.',

    name: 'James Roy',
    username: '@james_transform',
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => (
  <div className={props.className}>
    <motion.div
      animate={{
        translateY: '-50%',
      }}
      transition={{
        duration: props.duration || 10,
        repeat: Infinity,
        ease: 'linear',
        repeatType: 'loop',
      }}
      className="flex flex-col gap-6"
    >
      {[
        ...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, name, username }) => (
              <div
                key={text}
                className="border-border from-secondary/10 to-card relative w-full max-w-xs overflow-hidden rounded-3xl border bg-gradient-to-b p-10 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset]"
              >
                {/* rose color gradient */}
                <div className="from-primary/10 to-card absolute -top-5 -left-5 -z-10 h-40 w-40 rounded-full bg-gradient-to-b blur-md" />
                <div>{text}</div>
                <div className="mt-5 flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-medium">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex flex-col">
                    <div className="leading-5 font-medium tracking-tight">
                      {name}
                    </div>
                    <div className="leading-5 tracking-tight">{username}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        )),
      ]}
    </motion.div>
  </div>
);

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const handleShareClick = () => {
    const fitnessQuotes = [
      '🏋️‍♂️ Just had an amazing workout session with SSN Fitness! Their AI-powered fitness guidance is incredible. #SSNFitness #FitnessJourney',
      '💪 SSN Fitness helped me create the perfect workout plan tailored to my goals. Highly recommend! #FitnessGoals #SSNFitness',
      '🎯 The personalized nutrition guidance from SSN Fitness has transformed my health journey! #HealthyLiving #SSNFitness',
      '⚡ SSN Fitness AI assistant makes fitness planning so easy and effective. Game changer! #FitnessTech #SSNFitness',
      '🌟 Thanks to SSN Fitness, I finally have a workout routine that works for me! #FitnessSuccess #SSNFitness'
    ];
    const randomTweet = fitnessQuotes[Math.floor(Math.random() * fitnessQuotes.length)];
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(randomTweet)}`,
      '_blank',
    );
  };

  return (
    <section id="reviews" className="bg-background mb-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0 }}
          className="mx-auto max-w-[540px]"
        >
          <div className="flex justify-center">
            <button
              type="button"
              className="group bg-background/50 hover:shadow-primary/[0.1] dark:border-border relative z-[60] mx-auto rounded-full border border-zinc-500/80 px-6 py-1 text-xs backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100 md:text-sm"
            >
              <div className="via-primary absolute inset-x-0 -top-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent to-transparent shadow-2xl transition-all duration-500 group-hover:w-3/4"></div>
              <div className="via-primary absolute inset-x-0 -bottom-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent to-transparent shadow-2xl transition-all duration-500 group-hover:h-px"></div>
              <span className="relative">Testimonials</span>
            </button>
          </div>
          <h2
            className={cn(
              'from-foreground/60 via-foreground to-foreground/60 dark:from-muted-foreground/55 dark:via-foreground dark:to-muted-foreground/55 mt-5 bg-gradient-to-r bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]',
              space.className,
            )}
          >
            What our clients say
          </h2>
          <p className="mt-5 text-center text-lg text-zinc-500">
            From personalized nutrition plans to fitness transformations, our platform and Dherya's expertise have helped clients achieve their health goals.
          </p>
        </motion.div>
        <div className="my-16 flex max-h-[738px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
        <div className="-mt-8 flex justify-center">
          <button
            onClick={handleShareClick}
            className="group border-primary/30 bg-background text-foreground hover:border-primary/60 hover:bg-primary/10 relative inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-all active:scale-95"
          >
            <div className="via-primary/40 absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent to-transparent" />
            <div className="via-primary/40 absolute inset-x-0 -bottom-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent to-transparent" />
            <svg
              className="text-primary h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            Share your experience
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;