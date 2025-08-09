'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { GeminiLiveClient } from '@/lib/gemini-live-client';
import { AudioManager } from '@/lib/audio-manager';
import { LiveConnectConfig } from '@google/genai';
import { DEFAULT_TOOLS } from '@/lib/function-declarations';
import { Report, ReportGenerationProgress } from '@/types/report';
import { ReportStorage } from '@/lib/report-storage';
import { useRouter } from 'next/navigation';
import { interactionLogger } from '@/lib/interaction-logger';
import { createClient } from '@/lib/supabase/client';

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
  
  // Report state
  reports: Report[];
  currentReport: Report | null;
  reportProgress: ReportGenerationProgress | null;
  isGeneratingReport: boolean;
  
  // UI state
  uiMode: UIMode;
  isSidebarOpen: boolean;
  selectedFilter: string;
  isTransitioning: boolean;
  
  // Configuration
  voiceName: string;
  systemInstructions: string;
  responseModality: 'TEXT' | 'AUDIO' | 'TEXT_AND_AUDIO';
  toolsEnabled: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Audio actions
  startVoiceRecording: () => Promise<void>;
  stopVoiceRecording: () => void;
  
  // Message actions
  sendTextMessage: (message: string) => void;
  clearConversation: () => void;
  
  // Report actions
  generateReport: (title: string, instructions?: string) => void;
  updateReport: (reportId: string, instructions: string) => void;
  deleteReport: (reportId: string) => void;
  clearAllReports: () => void;
  
  // UI actions
  setUIMode: (mode: UIMode) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSelectedFilter: (filter: string) => void;
  
  // Configuration actions
  setVoiceName: (voice: string) => void;
  setSystemInstructions: (instructions: string) => void;
  setResponseModality: (modality: 'TEXT' | 'AUDIO' | 'TEXT_AND_AUDIO') => void;
  setToolsEnabled: (enabled: boolean) => void;
  
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
  const router = useRouter();
  const supabase = createClient();
  
  // Generate unique session ID
  const [currentSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
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
  
  // Report state
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [reportProgress, setReportProgress] = useState<ReportGenerationProgress | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // UI state
  const [uiMode, setUIMode] = useState<UIMode>('voice');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Conversation');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Configuration state
  const [voiceName, setVoiceName] = useState('Aoede');
  const [systemInstructions, setSystemInstructions] = useState(
    `You are an AI fitness assistant for SSN Fitness, powered by Sri Sai Nutritions - a leading health and supplements supplier. Your role is to help users with:

1. FITNESS CONSULTATIONS - Provide personalized fitness assessments, training guidance, and wellness evaluations
2. WORKOUT PLANS - Create custom training programs for strength, cardio, flexibility, bodyweight, bulking, cutting, and mobility
3. SUPPLEMENT GUIDANCE - Recommend protein supplements, vitamins, pre/post workout nutrition, and energy boosters
4. HEALTH CALCULATORS - Help with BMI, BMR, calorie tracking, and macro calculations

When users need fitness reports or plans:
1. Use scrollToSection to navigate to relevant sections
2. Use switchSectionMode to enable AI generation mode
3. Use collectUserInfo to gather necessary details (fitness level, goals, equipment, time, health conditions)
4. Use generateFitnessReport to create comprehensive, personalized plans

Always:
- Ask for user authentication before generating reports
- Collect relevant user information step by step
- Provide actionable, safe, and personalized advice
- Reference Sri Sai Nutritions expertise
- Keep responses encouraging and professional

You can interact via voice or text based on user preference.`
  );
  const [responseModality, setResponseModality] = useState<'TEXT' | 'AUDIO' | 'TEXT_AND_AUDIO'>('TEXT_AND_AUDIO');
  const [toolsEnabled, setToolsEnabled] = useState(true);
  
  // Service references
  const clientRef = useRef<GeminiLiveClient>();
  const audioManagerRef = useRef<AudioManager>();
  
  // Load reports from storage and get user ID on mount
  useEffect(() => {
    const storedReports = ReportStorage.getAllReports();
    setReports(storedReports);
    
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, [supabase.auth]);

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
      
      // Log session start
      interactionLogger.logSessionStart(currentSessionId, currentUserId || undefined, {
        model: 'gemini-2.0-flash-exp',
        mode: uiMode,
        voice: voiceName
      });
    });
    
    client.on('close', () => {
      console.log('🔌 Gemini Live API disconnected');
      setConnectionStatus('disconnected');
      setIsRecording(false);
      setIsPlaying(false);
      setVoiceState('idle');
      
      // Log session end
      interactionLogger.logSessionEnd(currentSessionId, currentUserId || undefined, {
        reason: 'connection_closed'
      });
    });
    
    client.on('error', (error) => {
      console.error('❌ Gemini Live API error:', error);
      setConnectionStatus('error');
      setIsRecording(false);
      setIsPlaying(false);
      setVoiceState('idle');
      
      // Log error
      interactionLogger.logError(currentSessionId, error, currentUserId || undefined, {
        context: 'gemini_live_api'
      });
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
          
          // Log assistant response
          interactionLogger.logAssistantResponse(currentSessionId, text, currentUserId || undefined, {
            tokens: content.metadata?.tokens,
            finishReason: content.metadata?.finishReason
          });
          
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
      
      // Log audio output
      interactionLogger.logAudioOutput(currentSessionId, {
        size: audioData.byteLength
      }, currentUserId || undefined, {
        format: 'pcm',
        sample_rate: 16000
      });
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

    client.on('toolcall', (toolCall) => {
      console.log('🔧 Tool call received:', toolCall);
      
      // Log tool call
      if (toolCall.functionCalls) {
        toolCall.functionCalls.forEach((call: any) => {
          interactionLogger.logToolCall(currentSessionId, call, currentUserId || undefined);
        });
      }
      
      handleToolCall(toolCall);
    });

    client.on('toolcallcancellation', (cancellation) => {
      console.log('❌ Tool call cancelled:', cancellation);
      // Handle tool call cancellation if needed
    });

    // Initialize Audio Manager
    console.log('🎤 Initializing Audio Manager...');
    audioManagerRef.current = new AudioManager({
      onAudioChunk: (chunk) => {
        console.log('🎤 Audio chunk received:', chunk.mimeType, chunk.data.length, 'chars');
        if (client.isConnected()) {
          client.sendRealtimeInput([chunk]);
          
          // Log audio input
          interactionLogger.logAudioInput(currentSessionId, {
            size: chunk.data.length
          }, currentUserId || undefined, {
            mime_type: chunk.mimeType
          });
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
      // Log session end before cleanup
      interactionLogger.logSessionEnd(currentSessionId, currentUserId || undefined, {
        reason: 'component_unmount'
      });
      
      client.disconnect();
      audioManagerRef.current?.dispose();
      
      // Force flush any pending logs
      interactionLogger.forceFlush();
    };
  }, []);

  // Handle tool calls
  const handleToolCall = useCallback(async (toolCall: any) => {
    const { functionCalls } = toolCall;
    
    for (const functionCall of functionCalls) {
      const { name, args, id } = functionCall;
      
      try {
        if (name === 'generateFitnessReport') {
          const { title, content, category, tags = [], userInfo } = args;
          
          // Create new fitness report
          const report: Report = {
            id: Date.now().toString(),
            title,
            content,
            category: category || 'fitness',
            tags,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'completed',
            metadata: {
              wordCount: content.split(' ').length,
              estimatedReadTime: Math.ceil(content.split(' ').length / 200),
              source: 'ai-fitness-assistant',
              userInfo: userInfo || {}
            }
          };
          
          // Save report
          ReportStorage.saveReport(report);
          setReports(prev => [...prev, report]);
          setCurrentReport(report);
          
          // Navigate to report page
          router.push('/report');
          
          // Send tool response
          if (clientRef.current) {
            const toolResponse = {
              name,
              id,
              response: { success: true, reportId: report.id, message: 'Fitness report generated successfully!' }
            };
            
            clientRef.current.sendToolResponse({
              functionResponses: [toolResponse]
            });
            
            // Log tool response
            interactionLogger.logToolResponse(currentSessionId, toolResponse, currentUserId || undefined);
          }
        } else if (name === 'scrollToSection') {
          const { sectionId } = args;
          
          // Scroll to section
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
          
          if (clientRef.current) {
            const toolResponse = {
              name,
              id,
              response: { success: true, message: `Scrolled to ${sectionId} section` }
            };
            
            clientRef.current.sendToolResponse({
              functionResponses: [toolResponse]
            });
            
            // Log tool response
            interactionLogger.logToolResponse(currentSessionId, toolResponse, currentUserId || undefined);
          }
        } else if (name === 'switchSectionMode') {
          const { sectionId, mode } = args;
          
          // Dispatch custom event to switch section mode
          window.dispatchEvent(new CustomEvent('switchSectionMode', {
            detail: { sectionId, mode }
          }));
          
          if (clientRef.current) {
            clientRef.current.sendToolResponse({
              functionResponses: [{
                name,
                id,
                response: { success: true, message: `Switched ${sectionId} to ${mode} mode` }
              }]
            });
          }
        } else if (name === 'collectUserInfo') {
          const { infoType, question } = args;
          
          // This function indicates what info is being collected
          // The actual collection happens through conversation
          if (clientRef.current) {
            clientRef.current.sendToolResponse({
              functionResponses: [{
                name,
                id,
                response: { 
                  success: true, 
                  infoType, 
                  question,
                  message: `Collecting ${infoType} information from user` 
                }
              }]
            });
          }
        } else if (name === 'listReports') {
          const { category } = args || {};
          const allReports = ReportStorage.getAllReports();
          const filteredReports = category 
            ? allReports.filter(r => r.category === category)
            : allReports;
          
          const reportList = filteredReports.map(r => ({
            id: r.id,
            title: r.title,
            category: r.category,
            createdAt: r.createdAt,
            tags: r.tags
          }));
          
          if (clientRef.current) {
            clientRef.current.sendToolResponse({
              functionResponses: [{
                name,
                id,
                response: { success: true, reports: reportList, count: reportList.length }
              }]
            });
          }
        } else if (name === 'getReport') {
          const { reportId, title } = args;
          let report: Report | null = null;
          
          if (reportId) {
            report = ReportStorage.getReport(reportId);
          } else if (title) {
            const allReports = ReportStorage.getAllReports();
            report = allReports.find(r => r.title.toLowerCase().includes(title.toLowerCase())) || null;
          }
          
          if (clientRef.current) {
            clientRef.current.sendToolResponse({
              functionResponses: [{
                name,
                id,
                response: report 
                  ? { success: true, report }
                  : { success: false, error: 'Report not found' }
              }]
            });
          }
        } else if (name === 'updateReport') {
          const { reportId, title: newTitle, content, category: newCategory, tags: newTags } = args;
          const existingReport = ReportStorage.getReport(reportId);
          
          if (existingReport) {
            const updatedReport: Report = {
              ...existingReport,
              title: newTitle || existingReport.title,
              content,
              category: newCategory || existingReport.category,
              tags: newTags || existingReport.tags,
              updatedAt: Date.now(),
              metadata: {
                ...existingReport.metadata,
                wordCount: content.split(' ').length,
                estimatedReadTime: Math.ceil(content.split(' ').length / 200)
              }
            };
            
            // Save updated report
            ReportStorage.saveReport(updatedReport);
            setReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
            setCurrentReport(updatedReport);
            
            // Navigate to report page if not already there
            if (window.location.pathname !== '/report') {
              router.push('/report');
            }
            
            if (clientRef.current) {
              clientRef.current.sendToolResponse({
                functionResponses: [{
                  name,
                  id,
                  response: { success: true, reportId: updatedReport.id }
                }]
              });
            }
          } else {
            if (clientRef.current) {
              clientRef.current.sendToolResponse({
                functionResponses: [{
                  name,
                  id,
                  response: { success: false, error: 'Report not found' }
                }]
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Tool call error:', error);
        
        // Send error response
        if (clientRef.current) {
          clientRef.current.sendToolResponse({
            functionResponses: [{
              name,
              id,
              response: { success: false, error: 'Failed to execute function' }
            }]
          });
        }
      }
    }
  }, [router]);

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

    // Add tools if enabled
    if (toolsEnabled) {
      config.tools = DEFAULT_TOOLS;
    }

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
  }, [uiMode, voiceName, systemInstructions, toolsEnabled]);

  // Connect to Gemini Live API
  const connect = useCallback(async (mode?: UIMode) => {
    console.log('🔗 connect called', { 
      hasClient: !!clientRef.current, 
      connectionStatus, 
      mode 
    });
    
    if (!clientRef.current) {
      console.error('❌ Gemini client not initialized');
      setConnectionStatus('error');
      return;
    }
    
    if (connectionStatus === 'connecting') {
      console.log('⚠️ Already connecting, skipping');
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
    
    if (!audioManagerRef.current) {
      console.error('❌ Audio manager not initialized');
      return;
    }
    
    if (isRecording) {
      console.log('⚠️ Already recording, skipping');
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
      console.warn('⚠️ Empty message, skipping');
      return;
    }

    if (!clientRef.current) {
      console.error('❌ Gemini client not initialized');
      return;
    }

    // Ensure connection with text mode
    if (!clientRef.current.isConnected()) {
      console.log('🔗 Connecting for text message...');
      await connect('text');
      // Wait for connection to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!clientRef.current.isConnected()) {
      console.error('❌ Cannot send message: connection failed');
      setConnectionStatus('error');
      return;
    }

    // Log user message
    interactionLogger.logUserMessage(currentSessionId, message, currentUserId || undefined);
    
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

  // Report actions
  const generateReport = useCallback((title: string, instructions?: string) => {
    const message = instructions 
      ? `Generate a report titled "${title}" with the following instructions: ${instructions}`
      : `Generate a comprehensive report titled "${title}"`;
    sendTextMessage(message);
  }, [sendTextMessage]);

  const updateReport = useCallback((reportId: string, instructions: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const message = `Update the report "${report.title}" with these instructions: ${instructions}`;
      sendTextMessage(message);
    }
  }, [reports, sendTextMessage]);

  const deleteReport = useCallback((reportId: string) => {
    ReportStorage.deleteReport(reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
    if (currentReport?.id === reportId) {
      setCurrentReport(null);
    }
  }, [currentReport]);

  const clearAllReports = useCallback(() => {
    ReportStorage.clearAllReports();
    setReports([]);
    setCurrentReport(null);
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
    
    // Report state
    reports,
    currentReport,
    reportProgress,
    isGeneratingReport,
    
    // UI state
    uiMode,
    isSidebarOpen,
    selectedFilter,
    isTransitioning,
    
    // Configuration
    voiceName,
    systemInstructions,
    responseModality,
    toolsEnabled,
    
    // Actions
    connect,
    disconnect,
    
    // Audio actions
    startVoiceRecording,
    stopVoiceRecording,
    
    // Message actions
    sendTextMessage,
    clearConversation,
    
    // Report actions
    generateReport,
    updateReport,
    deleteReport,
    clearAllReports,
    
    // UI actions
    setUIMode,
    toggleSidebar,
    closeSidebar,
    setSelectedFilter,
    
    // Configuration actions
    setVoiceName,
    setSystemInstructions,
    setResponseModality,
    setToolsEnabled,
    
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