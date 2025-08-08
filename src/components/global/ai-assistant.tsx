'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import { EnhancedAIVoiceControlTray } from '@/components/ui/enhanced-ai-voice-control-tray';
import { EnhancedChatbotSidebar } from '@/components/ui/enhanced-chatbot-sidebar';
import { AISettingsDialog } from '@/components/ui/ai-settings-dialog';

export function GlobalAIAssistant() {
  const {
    uiMode,
    isSidebarOpen,
    currentResponse,
    isStreaming,
  } = useEnhancedAIAssistant();

  const [isInHeroSection, setIsInHeroSection] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const checkHeroSection = () => {
      const isHomepage = window.location.pathname === '/';
      const heroSection = document.getElementById('hero-section');
      
      if (!isHomepage) {
        setIsInHeroSection(false);
        return;
      }
      
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const isInHero = heroRect.bottom > 200; // More space for homepage hero
        setIsInHeroSection(isInHero);
      }
    };

    // Check initial state
    checkHeroSection();

    // Add scroll listener only for homepage
    if (window.location.pathname === '/') {
      window.addEventListener('scroll', checkHeroSection, { passive: true });
    }
    
    // Listen for route changes
    const handleRouteChange = () => {
      setTimeout(checkHeroSection, 100);
    };
    
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('scroll', checkHeroSection);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <>
      {/* Streaming Response Display - Only in text mode without sidebar */}
      <AnimatePresence>
        {uiMode === 'text' && !isSidebarOpen && (currentResponse || isStreaming) && (
          <motion.div
            className="fixed z-30 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              left: '50%',
              x: '-50%',
              bottom: isInHeroSection ? 'calc(6rem + 100px)' : 'calc(2rem + 100px)' // 100px above tray
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              type: 'tween',
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <div className="max-w-2xl px-6 py-3" style={{ paddingLeft: '4rem', paddingRight: '4rem' }}>
              <motion.p 
                className="text-white/90 text-lg leading-relaxed text-center"
                style={{
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  lineHeight: '1.4',
                  maxHeight: '3.6em', // Roughly 2 lines
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {currentResponse || (isStreaming ? 'AI is thinking...' : '')}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed AI Voice Control Tray */}
      <motion.div
        className="fixed z-40"
        animate={{
          left: isSidebarOpen ? 'calc(50% + 192px)' : '50%', // 192px = half of sidebar width (384px/2)
          x: '-50%',
          bottom: isInHeroSection ? '6rem' : '2rem' // 6rem when in homepage hero, 2rem otherwise
        }}
        transition={{
          type: 'tween',
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <EnhancedAIVoiceControlTray
          size="lg"
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
      </motion.div>

      {/* Global Chatbot Sidebar */}
      <EnhancedChatbotSidebar />

      {/* Settings Dialog */}
      <AISettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}