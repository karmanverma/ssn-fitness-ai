'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { GeminiLiveClient } from '@/lib/gemini-live-client';
import { AudioManager } from '@/lib/audio-manager';
import { LiveConnectConfig } from '@google/genai';

// Types
interface GeminiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: {
    text?: string;
    audio?: {
      data: string;
      format: string;
    };
  };
  timestamp: number;
  metadata?: {
    tokens?: number;
    finishReason?: string;
  };
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type UIMode = 'voice' | 'text';
type VoiceState = 'idle' | 'listening' | 'speaking' | 'paused';
type PermissionState = 'pending' | 'granted' | 'denied';

interface EnhancedAIAssistantContextType {
  // Connection state
  connectionStatus: ConnectionStatus;
  sessionId: string | null;
  isConnected: boolean;
  
  // Audio state
  isRecording: boolean;
  isPlaying: boolean;
  audioLevel: number;
  microphonePermission: PermissionState;
  voiceState: VoiceState;
  
  // Message state
  messages: GeminiMessage[];
  isStreaming: boolean;
  currentResponse: string;
  
  // UI state
  uiMode: UIMode;
  isSidebarOpen: boolean;
  selectedFilter: string;
  isTransitioning: boolean;
  
  // Configuration
  voiceName: string;
  systemInstructions: string;
  responseModality: 'TEXT' | 'AUDIO' | 'TEXT_AND_AUDIO';
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Audio actions
  startVoiceRecording: () => Promise<void>;
  stopVoiceRecording: () => void;
  
  // Message actions
  sendTextMessage: (message: string) => void;
  clearConversation: () => void;
  
  // UI actions
  setUIMode: (mode: UIMode) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSelectedFilter: (filter: string) => void;
  
  // Configuration actions
  setVoiceName: (voice: string) => void;
  setSystemInstructions: (instructions: string) => void;
  setResponseModality: (modality: 'TEXT' | 'AUDIO' | 'TEXT_AND_AUDIO') => void;
  
  // Utility actions
  switchToVoiceMode: () => Promise<void>;
  switchToTextMode: () => Promise<void>;
}

const EnhancedAIAssistantContext = createContext<EnhancedAIAssistantContextType | undefined>(undefined);

export function useEnhancedAIAssistant() {
  const context = useContext(EnhancedAIAssistantContext);
  if (context === undefined) {
    throw new Error('useEnhancedAIAssistant must be used within an EnhancedAIAssistantProvider');
  }
  return context;
}

export function EnhancedAIAssistantProvider({ children }: { children: React.ReactNode }) {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [microphonePermission, setMicrophonePermission] = useState<PermissionState>('pending');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  
  // Message state
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  
  // UI state
  const [uiMode, setUIMode] = useState<UIMode>('voice');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Conversation');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Configuration state
  const [voiceName, setVoiceName] = useState('Aoede');
  const [systemInstructions, setSystemInstructions] = useState(
    'You are a helpful AI assistant for MVP Blocks, a component library. Help users with UI components, design patterns, and development questions. Keep responses concise and practical.'
  );
  const [responseModality, setResponseModality] = useState<'TEXT' | 'AUDIO' | 'TEXT_AND_AUDIO'>('TEXT_AND_AUDIO');
  
  // Service references
  const clientRef = useRef<GeminiLiveClient>();
  const audioManagerRef = useRef<AudioManager>();
  
  // Initialize services
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    console.log('🔑 API Key check:', { hasApiKey: !!apiKey, keyLength: apiKey?.length });
    
    if (!apiKey) {
      console.error('❌ API key not found in environment');
      setConnectionStatus('error');
      return;
    }

    // Initialize Gemini Live Client
    console.log('🚀 Initializing Gemini Live Client...');
    clientRef.current = new GeminiLiveClient({ apiKey });
    console.log('✅ Gemini Live Client initialized');
    
    // Set up event listeners
    const client = clientRef.current;
    
    client.on('open', () => {
      console.log('✅ Gemini Live API connected');
      setConnectionStatus('connected');
    });
    
    client.on('close', () => {
      console.log('🔌 Gemini Live API disconnected');
      setConnectionStatus('disconnected');
      setIsRecording(false);
      setIsPlaying(false);
      setVoiceState('idle');
    });
    
    client.on('error', (error) => {
      console.error('❌ Gemini Live API error:', error);
      setConnectionStatus('error');
      setIsRecording(false);
      setIsPlaying(false);
      setVoiceState('idle');
    });
    
    client.on('setupcomplete', () => {
      console.log('✅ Gemini setup complete');
    });
    
    client.on('content', (content) => {
      console.log('💬 Content received:', content);
      
      if (content.modelTurn?.parts) {
        const textPart = content.modelTurn.parts.find(part => 'text' in part);
        if (textPart && 'text' in textPart) {
          const text = textPart.text as string;
          
          // Add complete message to history
          const newMessage: GeminiMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: { text },
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, newMessage]);
          setCurrentResponse('');
          setIsStreaming(false);
        }
      }
    });
    
    client.on('audio', (audioData) => {
      console.log('🔊 Audio received:', audioData.byteLength, 'bytes');
      setVoiceState('speaking');
      audioManagerRef.current?.playAudio(audioData);
    });
    
    client.on('turncomplete', () => {
      console.log('✅ Turn complete');
      setIsStreaming(false);
      setVoiceState('idle');
    });
    
    client.on('interrupted', () => {
      console.log('⚠️ Response interrupted');
      setIsStreaming(false);
      setCurrentResponse('');
      setVoiceState('idle');
    });

    // Initialize Audio Manager
    console.log('🎤 Initializing Audio Manager...');
    audioManagerRef.current = new AudioManager({
      onAudioChunk: (chunk) => {
        console.log('🎤 Audio chunk received:', chunk.mimeType, chunk.data.length, 'chars');
        if (client.isConnected()) {
          client.sendRealtimeInput([chunk]);
        } else {
          console.warn('⚠️ Cannot send audio chunk: client not connected');
        }
      },
      onAudioLevel: setAudioLevel,
      onError: (error) => {
        console.error('❌ Audio error:', error);
        setMicrophonePermission('denied');
      }
    });
    console.log('✅ Audio Manager initialized');

    // Cleanup
    return () => {
      client.disconnect();
      audioManagerRef.current?.dispose();
    };
  }, []);

  // Generate Live API configuration
  const generateConfig = useCallback((mode: UIMode = uiMode): LiveConnectConfig => {
    const config: LiveConnectConfig = {
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      },
      systemInstruction: {
        parts: [{ text: systemInstructions }]
      }
    };

    // Add voice-specific config only for voice mode (at root level, not in generationConfig)
    if (mode === 'voice') {
      config.responseModalities = ['AUDIO'];
      config.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName
          }
        }
      };
    } else {
      config.responseModalities = ['TEXT'];
    }

    return config;
  }, [uiMode, voiceName, systemInstructions]);

  // Connect to Gemini Live API
  const connect = useCallback(async (mode?: UIMode) => {
    console.log('🔗 connect called', { 
      hasClient: !!clientRef.current, 
      connectionStatus, 
      mode 
    });
    
    if (!clientRef.current || connectionStatus === 'connecting') {
      console.log('⚠️ Early return from connect:', { hasClient: !!clientRef.current, connectionStatus });
      return;
    }

    // If already connected, disconnect first
    if (connectionStatus === 'connected') {
      console.log('🔌 Disconnecting existing connection...');
      clientRef.current.disconnect();
    }

    try {
      setConnectionStatus('connecting');
      console.log('🔗 Connecting to Gemini Live API...', mode ? `(${mode} mode)` : '');
      
      const config = generateConfig(mode);
      console.log('⚙️ Generated config:', JSON.stringify(config, null, 2));
      
      const success = await clientRef.current.connect('models/gemini-2.0-flash-exp', config);
      
      if (success) {
        console.log('✅ Connection initiated successfully');
        // Status will be set by the open event handler
      } else {
        console.error('❌ Connection failed');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      setConnectionStatus('error');
    }
  }, [connectionStatus, generateConfig]);

  // Disconnect from Gemini Live API
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    if (audioManagerRef.current) {
      audioManagerRef.current.stopRecording();
    }
    setSessionId(null);
  }, []);

  // Start voice recording
  const startVoiceRecording = useCallback(async () => {
    console.log('🎤 startVoiceRecording called', { 
      hasAudioManager: !!audioManagerRef.current, 
      isRecording, 
      connectionStatus 
    });
    
    if (!audioManagerRef.current || isRecording) {
      console.log('⚠️ Early return:', { hasAudioManager: !!audioManagerRef.current, isRecording });
      return;
    }

    try {
      // Ensure connection with voice mode
      if (connectionStatus !== 'connected') {
        console.log('🔗 Connecting to voice mode...');
        await connect('voice');
        
        // Wait for connection to be established
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔗 Connection attempt completed, status:', connectionStatus);
      }

      // Check if we're actually connected now
      if (connectionStatus !== 'connected' || !clientRef.current?.isConnected()) {
        console.error('❌ Not connected after connection attempt, status:', connectionStatus);
        return;
      }

      // Request microphone permission
      console.log('🎤 Requesting microphone permission...');
      const hasPermission = await audioManagerRef.current.requestMicrophonePermission();
      if (!hasPermission) {
        console.error('❌ Microphone permission denied');
        setMicrophonePermission('denied');
        return;
      }

      setMicrophonePermission('granted');
      console.log('✅ Microphone permission granted');
      
      // Start recording
      console.log('🎤 Starting audio recording...');
      await audioManagerRef.current.startRecording();
      setIsRecording(true);
      setVoiceState('listening');
      
      console.log('✅ Voice recording started successfully');
    } catch (error) {
      console.error('❌ Failed to start voice recording:', error);
      setMicrophonePermission('denied');
      if (connectionStatus !== 'error') {
        setConnectionStatus('error');
      }
    }
  }, [connectionStatus, connect, isRecording]);

  // Stop voice recording
  const stopVoiceRecording = useCallback(() => {
    if (audioManagerRef.current && isRecording) {
      audioManagerRef.current.stopRecording();
      setIsRecording(false);
      setVoiceState('idle');
      console.log('🛑 Voice recording stopped');
    }
  }, [isRecording]);

  // Send text message
  const sendTextMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      return;
    }

    // Ensure connection with text mode
    if (!clientRef.current?.isConnected()) {
      await connect('text');
      // Wait for connection to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!clientRef.current?.isConnected()) {
      console.error('❌ Cannot send message: not connected');
      return;
    }

    // Add user message to history
    const userMessage: GeminiMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: { text: message },
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to Gemini
    clientRef.current.send({ text: message }, true);
    setIsStreaming(true);
    
    console.log('💬 Text message sent:', message);
  }, [connect]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentResponse('');
    setIsStreaming(false);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Close sidebar
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Switch to voice mode
  const switchToVoiceMode = useCallback(async () => {
    if (uiMode === 'voice') return;

    setIsTransitioning(true);
    
    try {
      // Stop any ongoing recording
      if (isRecording) {
        stopVoiceRecording();
      }
      
      // Close sidebar
      setIsSidebarOpen(false);
      
      // Disconnect current session
      if (clientRef.current?.isConnected()) {
        clientRef.current.disconnect();
      }
      
      // Switch UI mode
      setUIMode('voice');
      
      // Wait a moment for UI to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('✅ Switched to voice mode (connection will be made when mic is pressed)');
    } catch (error) {
      console.error('❌ Failed to switch to voice mode:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [uiMode, isRecording, stopVoiceRecording]);

  // Switch to text mode
  const switchToTextMode = useCallback(async () => {
    if (uiMode === 'text') return;

    setIsTransitioning(true);
    
    try {
      // Stop any ongoing recording
      if (isRecording) {
        stopVoiceRecording();
      }
      
      // Disconnect current session
      if (clientRef.current?.isConnected()) {
        clientRef.current.disconnect();
      }
      
      // Switch UI mode
      setUIMode('text');
      
      // Wait a moment for UI to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reconnect with text configuration
      await connect('text');
      
      console.log('✅ Switched to text mode');
    } catch (error) {
      console.error('❌ Failed to switch to text mode:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [uiMode, isRecording, stopVoiceRecording, connect]);

  const value: EnhancedAIAssistantContextType = {
    // Connection state
    connectionStatus,
    sessionId,
    isConnected: connectionStatus === 'connected',
    
    // Audio state
    isRecording,
    isPlaying,
    audioLevel,
    microphonePermission,
    voiceState,
    
    // Message state
    messages,
    isStreaming,
    currentResponse,
    
    // UI state
    uiMode,
    isSidebarOpen,
    selectedFilter,
    isTransitioning,
    
    // Configuration
    voiceName,
    systemInstructions,
    responseModality,
    
    // Actions
    connect,
    disconnect,
    
    // Audio actions
    startVoiceRecording,
    stopVoiceRecording,
    
    // Message actions
    sendTextMessage,
    clearConversation,
    
    // UI actions
    setUIMode,
    toggleSidebar,
    closeSidebar,
    setSelectedFilter,
    
    // Configuration actions
    setVoiceName,
    setSystemInstructions,
    setResponseModality,
    
    // Utility actions
    switchToVoiceMode,
    switchToTextMode,
  };

  return (
    <EnhancedAIAssistantContext.Provider value={value}>
      {children}
    </EnhancedAIAssistantContext.Provider>
  );
}