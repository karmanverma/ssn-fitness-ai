'use client';

import React, { useState } from 'react';
import { EnhancedAIAssistantProvider } from '@/contexts/enhanced-ai-assistant-context';
import { EnhancedAIVoiceControlTray } from '@/components/ui/enhanced-ai-voice-control-tray';
import { EnhancedChatbotSidebar } from '@/components/ui/enhanced-chatbot-sidebar';
import { AISettingsDialog } from '@/components/ui/ai-settings-dialog';

export default function TestEnhancedGeminiPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <EnhancedAIAssistantProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Enhanced Gemini Live API
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Real-time Voice & Text AI Assistant
            </p>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Experience seamless voice and text interactions with Google&apos;s Gemini Live API. 
              Switch between modes, customize settings, and enjoy real-time AI conversations.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Mode</h3>
              <p className="text-gray-300 text-sm">
                Real-time voice conversations with natural speech recognition and AI voice responses.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Text Mode</h3>
              <p className="text-gray-300 text-sm">
                Traditional text-based chat with streaming responses and conversation history.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Seamless Switching</h3>
              <p className="text-gray-300 text-sm">
                Switch between voice and text modes instantly while preserving conversation context.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8 max-w-2xl w-full">
            <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400 text-xs font-bold">1</span>
                <p><strong>Voice Mode:</strong> Click the microphone icon to start voice conversation. Speak naturally and get AI voice responses.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">2</span>
                <p><strong>Text Mode:</strong> Click the message icon to switch to text chat. Use the sidebar for detailed conversations.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xs font-bold">3</span>
                <p><strong>Settings:</strong> Click the settings icon to customize voice selection and system instructions.</p>
              </div>
            </div>
          </div>

          {/* AI Voice Control Tray */}
          <div className="relative">
            <EnhancedAIVoiceControlTray
              size="lg"
              onSettingsClick={() => setIsSettingsOpen(true)}
            />
            
            {/* Connection Status */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="text-xs text-gray-400 text-center">
                Connection status will appear above
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <EnhancedChatbotSidebar />

        {/* Settings Dialog */}
        <AISettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-gray-500">
            Powered by Google Gemini Live API • Built with Next.js & Tailwind CSS
          </p>
        </div>
      </div>
    </EnhancedAIAssistantProvider>
  );
}