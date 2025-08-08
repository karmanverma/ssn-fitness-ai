'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import { cn } from '@/lib/utils';

interface AILayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AILayout({ children, className }: AILayoutProps) {
  const { isSidebarOpen } = useEnhancedAIAssistant();

  return (
    <motion.div
      className={cn('transition-all duration-300 ease-in-out', className)}
      animate={{
        marginLeft: isSidebarOpen ? '384px' : '0px', // 384px = w-96
      }}
      transition={{
        type: 'tween',
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}