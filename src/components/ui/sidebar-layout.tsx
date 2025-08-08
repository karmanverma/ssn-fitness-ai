'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  className?: string;
}

export function SidebarLayout({ children, isSidebarOpen, className }: SidebarLayoutProps) {
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