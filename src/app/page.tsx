'use client';

import Hero from '@/components/home/hero';
import WhatWeProvide from '@/components/home/what-we-provide';
import AIServiceSections from '@/components/home/ai-service-section';
import ExpertCTA from '@/components/home/expert-cta';
import dynamic from 'next/dynamic';

const Gallery = dynamic(() => import('@/components/home/gallery'), {
  ssr: false,
});

const Testimonials = dynamic(() => import('@/components/home/testimonials'), {
  ssr: false,
});
const CTA = dynamic(() => import('@/components/shared/cta'), {
  ssr: false,
});
const Faqs = dynamic(() => import('@/components/shared/faq'));

export default function Homepage() {
  return (
    <>
      <Hero />
      <WhatWeProvide />
      <AIServiceSections />

      <Gallery />
      <Testimonials />
      <CTA />
      <Faqs />
    </>
  );
}