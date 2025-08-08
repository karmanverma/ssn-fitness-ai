'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ChevronDown, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';
import { EnhancedSimpleChatbot } from './enhanced-simple-chatbot';

interface EnhancedChatbotSidebarProps {
  className?: string;
}

export function EnhancedChatbotSidebar({ className }: EnhancedChatbotSidebarProps) {
  const { 
    isSidebarOpen, 
    closeSidebar, 
    selectedFilter, 
    setSelectedFilter,
    connectionStatus,
    sessionId,
    uiMode,
    isRecording,
    voiceState
  } = useEnhancedAIAssistant();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions = ['Tools', 'Conversation', 'All'];

  const handleFilterSelect = (filter: string) => {
    setIsDropdownOpen(false);
    setSelectedFilter(filter);
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4 text-green-500" />,
          text: 'Connected',
          color: 'text-green-500',
          bgColor: 'bg-green-500'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />,
          text: 'Connecting...',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500'
        };
      case 'error':
        return {
          icon: <WifiOff className="h-4 w-4 text-red-500" />,
          text: 'Connection Error',
          color: 'text-red-500',
          bgColor: 'bg-red-500'
        };
      default:
        return {
          icon: <WifiOff className="h-4 w-4 text-gray-500" />,
          text: 'Disconnected',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500'
        };
    }
  };

  const getVoiceStateInfo = () => {
    if (uiMode !== 'voice') return null;
    
    switch (voiceState) {
      case 'listening':
        return {
          text: 'Listening...',
          color: 'text-blue-500',
          icon: '🎤'
        };
      case 'speaking':
        return {
          text: 'Speaking...',
          color: 'text-green-500',
          icon: '🔊'
        };
      case 'paused':
        return {
          text: 'Paused',
          color: 'text-yellow-500',
          icon: '⏸️'
        };
      default:
        return {
          text: 'Ready',
          color: 'text-gray-500',
          icon: '⭕'
        };
    }
  };

  const statusInfo = getConnectionStatusInfo();
  const voiceInfo = getVoiceStateInfo();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          className={cn(
            'fixed left-0 top-0 h-full w-96 bg-background border-r border-border z-[100]',
            'shadow-2xl flex flex-col',
            className
          )}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{
            type: 'tween',
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-rose-500/10">
                <MessageSquare className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-xs text-muted-foreground">
                  {uiMode === 'voice' ? 'Voice Mode' : 'Text Mode'}
                </p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status and Filter Section */}
          <div className="p-4 border-b border-border shrink-0 space-y-4">
            {/* Connection Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Connection Status</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', statusInfo.bgColor)} />
                  {statusInfo.icon}
                  <span className={cn('text-sm font-medium', statusInfo.color)}>
                    {statusInfo.text}
                  </span>
                </div>
                {sessionId && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {sessionId.slice(-8)}
                  </span>
                )}
              </div>
            </div>

            {/* Voice State (if in voice mode) */}
            {voiceInfo && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Voice State</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{voiceInfo.icon}</span>
                  <span className={cn('text-sm font-medium', voiceInfo.color)}>
                    {voiceInfo.text}
                  </span>
                  {isRecording && (
                    <motion.div
                      className="w-2 h-2 bg-red-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Filter Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Message Filter</label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <span className="font-medium">{selectedFilter}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-[200] overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      {filterOptions.map((option, index) => (
                        <button
                          key={option}
                          onClick={() => handleFilterSelect(option)}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors",
                            selectedFilter === option && "bg-rose-500/10 text-rose-500 font-medium",
                            index === 0 && "rounded-t-md",
                            index === filterOptions.length - 1 && "rounded-b-md"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Activity Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last activity</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Mode</span>
                <span className="capitalize">{uiMode}</span>
              </div>
            </div>
          </div>
          
          {/* Chatbot Content */}
          <div className="flex-1 overflow-hidden">
            <EnhancedSimpleChatbot />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}