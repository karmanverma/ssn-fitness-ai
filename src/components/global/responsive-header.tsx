'use client';

import React, { useEffect, useRef } from 'react';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import Header1 from '@/components/mvpblocks/required/headers/header-1';

export function ResponsiveHeader() {
  const { isSidebarOpen } = useEnhancedAIAssistant();
  const headerRef = useRef<HTMLDivElement>(null);

  // Prevent header re-animation when sidebar state changes
  useEffect(() => {
    if (headerRef.current) {
      // Force the header to maintain its current state
      const header = headerRef.current.querySelector('header');
      if (header) {
        header.style.transform = 'none';
      }
    }
  }, [isSidebarOpen]);

  return (
    <div 
      ref={headerRef}
      className="relative"
      style={{
        // Ensure header doesn't get cut off when sidebar is open
        zIndex: isSidebarOpen ? 40 : 50, // Lower z-index when sidebar is open
      }}
    >
      <Header1 />
    </div>
  );
}