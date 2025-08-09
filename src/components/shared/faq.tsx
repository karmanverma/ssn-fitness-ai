'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'What is SSN Fitness exactly?',
    answer:
      'SSN Fitness is an AI-powered fitness platform by Sri Sai Nutritions, offering personalized consultations, custom workout plans, expert supplement guidance, and powerful health tracking tools.',
  },
  {
    question: 'Are the consultations really free?',
    answer:
      "Yes! We're currently offering free consultation sessions with our expert Dherya Bajaj as a limited-time promotion. This includes personalized fitness assessments and guidance.",
  },
  {
    question: 'What types of consultation do you offer?',
    answer:
      'We offer fitness consultations, nutrition coaching, supplement guidance, and general wellness assessments. You can choose your preferred consultation type when booking.',
  },
  {
    question: 'How do the AI-powered features work?',
    answer:
      'Our AI analyzes your fitness data, goals, and preferences to provide personalized workout plans, supplement recommendations, and health insights tailored specifically to your needs.',
  },
  {
    question: 'Do I need any special equipment for the workout plans?',
    answer:
      'Not necessarily! We offer various workout plans including bodyweight exercises that require no equipment, as well as gym-based and home equipment routines to suit your situation.',
  },
];

export default function Faqs() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section id="faq" className="relative overflow-hidden pb-24">
      <div className="bg-primary/20 absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl select-none"></div>
      <div className="bg-primary/20 absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl select-none"></div>
      <div className="z-10 container">
        <div className="flex justify-center">
          <div className="border-primary/40 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 uppercase">
            <span>✶</span>
            <span className="text-sm">Faqs</span>
          </div>
        </div>
        <h2 className="mx-auto mt-6 max-w-xl text-center text-4xl font-medium md:text-[54px] md:leading-[60px]">
          Questions? We&apos;ve got{' '}
          <span className="bg-primary from-foreground to-primary via-rose-200 bg-clip-text text-transparent dark:bg-gradient-to-b">
            answers
          </span>
        </h2>

        <div className="mx-auto mt-12 flex max-w-xl flex-col gap-6">
          {faqs.map((faq, faqIndex) => (
            <div
              key={faq.question}
              onClick={() =>
                selectedIndex === faqIndex
                  ? setSelectedIndex(-1)
                  : setSelectedIndex(faqIndex)
              }
              className="from-secondary/40 to-secondary/10 rounded-2xl border border-white/10 bg-gradient-to-b p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset]"
            >
              <div className="flex items-start justify-between">
                <h3 className="m-0 font-medium">{faq.question}</h3>
                <Plus
                  size={30}
                  className={cn(
                    'text-primary flex-shrink-0 transition duration-300',
                    selectedIndex === faqIndex && 'rotate-45',
                  )}
                />
              </div>

              <AnimatePresence>
                {selectedIndex === faqIndex && (
                  <motion.div
                    initial={{
                      height: 0,
                      marginTop: 0,
                    }}
                    animate={{
                      height: 'auto',
                      marginTop: 24,
                    }}
                    exit={{
                      height: 0,
                      marginTop: 0,
                    }}
                    className="overflow-hidden"
                  >
                    <p className="text-zinc-500">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}