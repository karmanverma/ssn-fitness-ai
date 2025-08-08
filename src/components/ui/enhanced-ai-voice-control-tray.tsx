'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Settings,
  Volume2,
  VolumeX,
  Send,
  X,
  Loader2
} from 'lucide-react';

interface EnhancedAIVoiceControlTrayProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onSettingsClick?: () => void;
}

export function EnhancedAIVoiceControlTray({
  className,
  size = 'md',
  onSettingsClick
}: EnhancedAIVoiceControlTrayProps) {
  const {
    connectionStatus,
    isRecording,
    audioLevel,
    uiMode,
    isSidebarOpen,
    isTransitioning,
    voiceState,
    microphonePermission,
    messages,
    isStreaming,
    startVoiceRecording,
    stopVoiceRecording,
    sendTextMessage,
    switchToVoiceMode,
    switchToTextMode,
    toggleSidebar,
    connect
  } = useEnhancedAIAssistant();

  const [textInput, setTextInput] = useState('');
  const [pulseKey, setPulseKey] = useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // No auto-connection - connect only when needed

  // Update pulse key when recording state changes
  useEffect(() => {
    if (isRecording) {
      setPulseKey(prev => prev + 1);
    }
  }, [isRecording]);

  // Focus input when entering text mode
  useEffect(() => {
    if (uiMode === 'text' && inputRef.current && !isSidebarOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [uiMode, isSidebarOpen]);

  const sizeConfig = {
    sm: {
      container: 'h-14 px-2',
      button: 'h-8 w-8',
      voiceButton: 'h-10 w-10',
      icon: 'h-3.5 w-3.5',
      voiceIcon: 'h-5 w-5',
    },
    md: {
      container: 'h-16 px-2',
      button: 'h-10 w-10',
      voiceButton: 'h-12 w-12',
      icon: 'h-4 w-4',
      voiceIcon: 'h-6 w-6',
    },
    lg: {
      container: 'h-20 px-2',
      button: 'h-12 w-12',
      voiceButton: 'h-16 w-16',
      icon: 'h-5 w-5',
      voiceIcon: 'h-7 w-7',
    },
  };

  const config = sizeConfig[size];

  const handleVoiceToggle = async () => {
    if (uiMode === 'voice') {
      if (connectionStatus === 'disconnected') {
        // Connect first, then start recording
        console.log('🔗 Connecting and starting voice recording...');
        await startVoiceRecording();
      } else if (isRecording) {
        stopVoiceRecording();
      } else {
        await startVoiceRecording();
      }
    }
  };

  const handleModeSwitch = async () => {
    if (isTransitioning) return;
    
    if (uiMode === 'voice') {
      await switchToTextMode();
    } else {
      await switchToVoiceMode();
    }
  };

  const handleSendMessage = () => {
    if (textInput.trim()) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getVoiceIcon = () => {
    if (connectionStatus === 'connecting') {
      return <Loader2 className="h-full w-full animate-spin" />;
    }
    
    if (uiMode === 'voice' && isRecording) {
      switch (voiceState) {
        case 'listening':
          return <Mic className="h-full w-full" />;
        case 'speaking':
          return <Volume2 className="h-full w-full" />;
        case 'paused':
          return <Pause className="h-full w-full" />;
        default:
          return <Mic className="h-full w-full" />;
      }
    }
    
    return <Mic className="h-full w-full" />;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get the last AI response
  const lastAIMessage = messages.filter(m => m.role === 'assistant').pop();
  const showLastResponse = uiMode === 'text' && !isSidebarOpen && lastAIMessage;

  return (
    <>
      {/* Last AI Response Display */}
      <AnimatePresence>
        {showLastResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 text-center"
          >
            <div className="text-white text-base">
              {isStreaming ? (
                <div className="flex items-center justify-center gap-2">
                  <span>AI is thinking</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              ) : (
                lastAIMessage.content.text
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          'relative flex items-center rounded-full',
          'bg-black/90 backdrop-blur-xl',
          'border border-white/10',
          'shadow-2xl shadow-black/50',
          config.container,
          'justify-between',
          className,
        )}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          width: uiMode === 'text' ? '600px' : '400px'
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.25, 0.46, 0.45, 0.94],
          type: 'tween'
        }}
      >
        {/* Rotating Glow Effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
          style={{
            background: `conic-gradient(
              from var(--glow-angle, 0deg),
              transparent 0deg,
              rgba(244, 63, 94, 0.4) 60deg,
              rgba(59, 130, 246, 0.4) 120deg,
              rgba(168, 85, 247, 0.4) 180deg,
              rgba(34, 197, 94, 0.4) 240deg,
              rgba(251, 191, 36, 0.4) 300deg,
              transparent 360deg
            )`,
            animation: 'glow-rotate 4s linear infinite',
            filter: 'blur(8px)',
            zIndex: -1,
          }}
        />

        {/* Audio level visualization */}
        {isRecording && audioLevel > 0 && (
          <div 
            className="absolute inset-0 rounded-full bg-green-500/20 blur-sm"
            style={{ opacity: audioLevel / 100 }}
          />
        )}

        {/* Ambient glow when recording */}
        <AnimatePresence>
          {uiMode === 'voice' && isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                key={pulseKey}
                className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {uiMode === 'text' ? (
            // Text Input Mode
            <motion.div
              key="text-mode"
              className="flex items-center w-full justify-between"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {/* Voice Mode Toggle Button */}
              <motion.button
                onClick={handleModeSwitch}
                disabled={isTransitioning}
                className={cn(
                  'relative flex items-center justify-center rounded-full',
                  'text-white/70 hover:text-white/90',
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  config.button,
                  isTransitioning && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={{ scale: isTransitioning ? 1 : 1.05 }}
                whileTap={{ scale: isTransitioning ? 1 : 0.95 }}
              >
                {isTransitioning ? (
                  <Loader2 className={cn(config.icon, 'animate-spin')} />
                ) : (
                  <Mic className={config.icon} />
                )}
              </motion.button>

              {/* Sidebar Toggle Button */}
              <motion.button
                onClick={toggleSidebar}
                className={cn(
                  'relative flex items-center justify-center rounded-full',
                  'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30',
                  'h-8 w-8 transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  isSidebarOpen && 'ring-2 ring-rose-400/50'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="h-4 w-4" />
              </motion.button>

              {/* Text Input */}
              <div className="flex-1 mx-4 relative z-10">
                <input
                  ref={inputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={isSidebarOpen ? "Use sidebar to chat..." : "Type your message..."}
                  autoComplete="off"
                  spellCheck="false"
                  disabled={isSidebarOpen || connectionStatus !== 'connected'}
                  className={cn(
                    'w-full bg-transparent border-none outline-none',
                    'text-white placeholder-white/50',
                    'text-sm cursor-text',
                    'focus:outline-none focus:ring-0',
                    'pointer-events-auto',
                    (isSidebarOpen || connectionStatus !== 'connected') && 'opacity-50 cursor-not-allowed'
                  )}
                />
              </div>

              {/* Send Button */}
              <motion.button
                onClick={handleSendMessage}
                disabled={!textInput.trim() || connectionStatus !== 'connected'}
                className={cn(
                  'relative flex items-center justify-center rounded-full',
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  config.button,
                  textInput.trim() && connectionStatus === 'connected'
                    ? 'bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                    : 'text-white/40'
                )}
                whileHover={{ scale: textInput.trim() && connectionStatus === 'connected' ? 1.05 : 1 }}
                whileTap={{ scale: textInput.trim() && connectionStatus === 'connected' ? 0.95 : 1 }}
              >
                <Send className={config.icon} />
              </motion.button>
            </motion.div>
          ) : (
            // Voice Control Mode
            <motion.div
              key="voice-mode"
              className="flex items-center justify-between w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {/* Text Mode Toggle Button */}
              <motion.button
                onClick={handleModeSwitch}
                disabled={isTransitioning}
                className={cn(
                  'relative flex items-center justify-center rounded-full',
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  config.button,
                  'text-white/60 hover:text-white/80',
                  isTransitioning && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={{ scale: isTransitioning ? 1 : 1.05 }}
                whileTap={{ scale: isTransitioning ? 1 : 0.95 }}
              >
                {isTransitioning ? (
                  <Loader2 className={cn(config.icon, 'animate-spin')} />
                ) : (
                  <MessageSquare className={config.icon} />
                )}
              </motion.button>

              {/* Voice Control Button (Main) */}
              <motion.button
                onClick={handleVoiceToggle}
                disabled={connectionStatus === 'connecting' || microphonePermission === 'denied'}
                className={cn(
                  'relative flex items-center justify-center rounded-full',
                  'transition-all duration-300',
                  'hover:scale-105 active:scale-95',
                  config.voiceButton,
                  // Connection and recording status styling
                  connectionStatus === 'connected' && isRecording
                    ? 'bg-gradient-to-br from-white/40 to-white/25 text-white shadow-xl shadow-white/40 ring-2 ring-white/30 backdrop-blur-sm' 
                    : connectionStatus === 'connected' 
                      ? 'text-white/70 hover:text-white/90 hover:bg-white/5'
                      : connectionStatus === 'connecting'
                        ? 'text-yellow-400/70'
                        : connectionStatus === 'error'
                          ? 'text-red-400/70'
                          : 'text-white/70 hover:text-white/90 hover:bg-white/5 cursor-pointer',
                )}
                whileHover={{ scale: connectionStatus !== 'connecting' ? 1.05 : 1 }}
                whileTap={{ scale: connectionStatus !== 'connecting' ? 0.95 : 1 }}
              >
                {/* Connection status indicator */}
                <div className={cn(
                  'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black/50',
                  getConnectionStatusColor()
                )} />
                
                {/* Click hint for disconnected state */}
                {connectionStatus === 'disconnected' && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/60 whitespace-nowrap">
                    Click to connect
                  </div>
                )}

                <motion.span 
                  className={config.voiceIcon}
                  animate={{ 
                    scale: isRecording ? 1.15 : 1,
                    rotate: isRecording ? [0, 8, -8, 0] : 0
                  }}
                  transition={{ 
                    duration: 0.4,
                    rotate: { duration: 0.8, ease: "easeInOut" },
                    scale: { duration: 0.3, ease: "easeOut" }
                  }}
                >
                  {getVoiceIcon()}
                </motion.span>
                
                {/* Pulse animation for recording */}
                <AnimatePresence>
                  {isRecording && (
                    <>
                      <motion.div
                        key={`pulse-1-${pulseKey}`}
                        className="absolute inset-0 rounded-full border-2 border-white/70"
                        initial={{ scale: 1, opacity: 0.9 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                      <motion.div
                        key={`pulse-2-${pulseKey}`}
                        className="absolute inset-0 rounded-full border-2 border-white/50"
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
                      />
                    </>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Settings Button */}
              <motion.button
                onClick={onSettingsClick}
                className={cn(
                  'relative flex items-center justify-center rounded-full',
                  'text-white/60 hover:text-white/80',
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  config.button,
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className={config.icon} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* CSS for glow animation */}
      <style jsx global>{`
        @property --glow-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes glow-rotate {
          to {
            --glow-angle: 360deg;
          }
        }
      `}</style>
    </>
  );
}