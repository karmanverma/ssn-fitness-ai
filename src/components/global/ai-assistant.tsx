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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFixedTray, setShowFixedTray] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const isInHero = rect.top <= 100 && rect.bottom > 200;
        const isLargeScreen = window.innerWidth >= 1024;
        setShowFixedTray(!(isInHero && isLargeScreen));
      } else {
        // If no hero section exists (other pages), always show the tray
        setShowFixedTray(true);
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
              bottom: 'calc(2rem + 100px)' // 100px above tray
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
          bottom: '2rem',
          opacity: showFixedTray ? 1 : 0,
          y: showFixedTray ? 0 : 20
        }}
        transition={{
          type: 'tween',
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        style={{ pointerEvents: showFixedTray ? 'auto' : 'none' }}
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