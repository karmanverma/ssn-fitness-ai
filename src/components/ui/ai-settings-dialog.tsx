'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Volume2, MessageSquare, Save, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';

interface AISettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const VOICE_OPTIONS = [
  { value: 'Aoede', label: 'Aoede', description: 'Warm and friendly' },
  { value: 'Charon', label: 'Charon', description: 'Deep and authoritative' },
  { value: 'Fenrir', label: 'Fenrir', description: 'Clear and professional' },
  { value: 'Kore', label: 'Kore', description: 'Gentle and soothing' },
  { value: 'Puck', label: 'Puck', description: 'Energetic and playful' },
];

const DEFAULT_SYSTEM_INSTRUCTIONS = 'You are a helpful AI assistant for MVP Blocks, a component library. Help users with UI components, design patterns, and development questions. Keep responses concise and practical.';

export function AISettingsDialog({ isOpen, onClose, className }: AISettingsDialogProps) {
  const {
    voiceName,
    systemInstructions,
    responseModality,
    uiMode,
    setVoiceName,
    setSystemInstructions,
    // setResponseModality,
    connectionStatus,
    isTransitioning
  } = useEnhancedAIAssistant();

  // Local state for form inputs
  const [localVoiceName, setLocalVoiceName] = useState(voiceName);
  const [localSystemInstructions, setLocalSystemInstructions] = useState(systemInstructions);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalVoiceName(voiceName);
    setLocalSystemInstructions(systemInstructions);
  }, [voiceName, systemInstructions]);

  // Check for changes
  useEffect(() => {
    const changed = localVoiceName !== voiceName || localSystemInstructions !== systemInstructions;
    setHasChanges(changed);
  }, [localVoiceName, localSystemInstructions, voiceName, systemInstructions]);

  const handleSave = () => {
    setVoiceName(localVoiceName);
    setSystemInstructions(localSystemInstructions);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalVoiceName(voiceName);
    setLocalSystemInstructions(systemInstructions);
    setHasChanges(false);
  };

  const handleResetToDefault = () => {
    setLocalSystemInstructions(DEFAULT_SYSTEM_INSTRUCTIONS);
  };

  const handleClose = () => {
    if (hasChanges) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!shouldClose) return;
    }
    handleReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              className={cn(
                'w-full max-w-2xl max-h-[90vh] overflow-hidden',
                'bg-background border border-border rounded-xl shadow-2xl',
                className
              )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-rose-500/10">
                  <Settings className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">AI Assistant Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure your AI assistant preferences
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Current Mode Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Current Mode</label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  {uiMode === 'voice' ? (
                    <>
                      <Volume2 className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Voice Mode</span>
                      <span className="text-sm text-muted-foreground">
                        - Voice input and {responseModality.includes('AUDIO') ? 'audio' : 'text'} output
                      </span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Text Mode</span>
                      <span className="text-sm text-muted-foreground">- Text input and output</span>
                    </>
                  )}
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Voice Selection
                  {uiMode !== 'voice' && (
                    <span className="ml-2 text-xs text-yellow-600">(Only applies in voice mode)</span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={localVoiceName}
                    onChange={(e) => setLocalVoiceName(e.target.value)}
                    disabled={uiMode !== 'voice'}
                    className={cn(
                      'w-full p-3 rounded-lg border border-border bg-background',
                      'text-foreground placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500',
                      'transition-all cursor-pointer',
                      uiMode !== 'voice' && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    {VOICE_OPTIONS.map((voice) => (
                      <option key={voice.value} value={voice.value}>
                        {voice.label} - {voice.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium">{VOICE_OPTIONS.find(v => v.value === localVoiceName)?.label}</span> - {VOICE_OPTIONS.find(v => v.value === localVoiceName)?.description}
                </div>
              </div>

              {/* System Instructions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    System Instructions
                  </label>
                  <button
                    onClick={handleResetToDefault}
                    className="text-xs text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  value={localSystemInstructions}
                  onChange={(e) => setLocalSystemInstructions(e.target.value)}
                  placeholder="Enter system instructions for the AI assistant..."
                  className={cn(
                    'w-full min-h-[120px] p-3 rounded-lg border border-border',
                    'bg-background text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500',
                    'resize-none transition-all'
                  )}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Customize how the AI assistant behaves and responds</span>
                  <span>{localSystemInstructions.length}/1000</span>
                </div>
              </div>

              {/* Connection Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Connection Status</label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  )} />
                  <span className="font-medium capitalize">{connectionStatus}</span>
                  {isTransitioning && (
                    <span className="text-sm text-muted-foreground">• Switching modes...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="text-sm text-muted-foreground">You have unsaved changes</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    'border border-border hover:bg-muted',
                    !hasChanges && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    'bg-rose-500 text-white hover:bg-rose-600',
                    !hasChanges && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}