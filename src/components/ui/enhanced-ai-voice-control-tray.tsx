'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import { 
  MessageSquare, 
  Mic, 
  Pause, 
  Settings,
  Volume2,
  Send,
  X,
  Loader2
} from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';

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
    clearConversation,
    switchToVoiceMode,
    switchToTextMode,
    toggleSidebar,
  } = useEnhancedAIAssistant();

  const [textInput, setTextInput] = useState('');
  const [pulseKey, setPulseKey] = useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

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

  // Show chat history in text mode when sidebar is closed
  const showChatHistory = uiMode === 'text' && !isSidebarOpen && messages.length > 0;
  
  // Add a slight delay for smoother transitions
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    if (showChatHistory) {
      const timer = setTimeout(() => setIsExpanded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(false);
    }
  }, [showChatHistory]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && showChatHistory) {
      const timer = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isStreaming, showChatHistory]);

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden',
        'bg-black/90 backdrop-blur-xl',
        'border border-white/10',
        'shadow-2xl shadow-black/50',
        className,
      )}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        width: uiMode === 'text' ? '600px' : '400px',
        borderRadius: showChatHistory ? '1rem' : '9999px'
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94],
        width: { duration: 0.4 },
        borderRadius: { duration: 0.3, delay: showChatHistory ? 0 : 0.2 }
      }}
      layout="position"
    >
      {/* Chat History Section - Only in Text Mode */}
      <AnimatePresence mode="wait">
        {showChatHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              height: 'auto',
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              height: 0,
              y: -20
            }}
            transition={{ 
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              height: { 
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              },
              opacity: { 
                duration: 0.4, 
                delay: showChatHistory ? 0.1 : 0,
                ease: "easeOut"
              },
              y: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            className="border-b border-white/10 overflow-hidden"
          >
            {/* Chat Header */}
            <motion.div 
              className="px-4 py-2 bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs font-medium">Chat History</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-xs">{messages.length} messages</span>
                  {messages.length > 0 && (
                    <motion.button
                      onClick={clearConversation}
                      className="text-white/40 hover:text-white/70 transition-colors p-1 rounded"
                      title="Clear chat"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Chat Messages Container */}
            <motion.div 
              ref={chatContainerRef}
              className="max-h-80 overflow-y-auto custom-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: 0.4 + (index * 0.03),
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">AI</span>
                      </div>
                    )}
                    
                    <div className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      message.role === 'user' 
                        ? 'bg-white/10 text-white ml-auto' 
                        : 'bg-white/5 text-white/90'
                    )}>
                      {message.content.text}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">You</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Streaming indicator */}
                <AnimatePresence>
                  {isStreaming && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">AI</span>
                      </div>
                      <div className="bg-white/5 text-white/90 rounded-2xl px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span>AI is thinking</span>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input/Control Section */}
      <motion.div 
        className={cn(
          'relative flex items-center',
          showChatHistory ? 'px-4 py-3' : cn(config.container, 'justify-between')
        )}
        layout
        transition={{ 
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {/* Border animation when inactive - Only for rounded tray */}
        {!showChatHistory && (connectionStatus !== 'connected' || (uiMode === 'voice' && !isRecording)) ? (
          <>
            <BorderBeam
              duration={6}
              size={300}
              className="via-rose-600/30 from-transparent to-transparent"
            />
            <BorderBeam
              duration={6}
              size={300}
              reverse
              className="via-red-600/30 from-transparent to-transparent"
            />
          </>
        ) : null}

        {/* Rotating Glow Effect - Only for rounded tray */}
        {!showChatHistory && (
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
        )}

        {/* Audio level visualization - Only for rounded tray */}
        {!showChatHistory && isRecording && audioLevel > 0 && (
          <div 
            className="absolute inset-0 rounded-full bg-green-500/20 blur-sm"
            style={{ opacity: audioLevel / 100 }}
          />
        )}

        {/* Ambient glow when recording - Only for rounded tray */}
        {!showChatHistory && (
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
        )}

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
      
      {/* CSS for glow animation and custom scrollbar */}
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

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </motion.div>
  );
}