# Technical Specifications for Gemini Live API Integration

## WebSocket Protocol Implementation

### Connection Establishment
```typescript
// WebSocket endpoint
const GEMINI_WEBSOCKET_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

// Connection with API key
const websocket = new WebSocket(`${GEMINI_WEBSOCKET_URL}?key=${apiKey}`);

// Alternative: Using ephemeral token
const websocket = new WebSocket(`${GEMINI_WEBSOCKET_URL}?access_token=${ephemeralToken}`);
```

### Message Format Specifications

#### 1. Setup Message (First message only)
```typescript
interface BidiGenerateContentSetup {
  model: string; // "gemini-2.0-flash-exp"
  generationConfig: {
    responseModalities: ["TEXT", "AUDIO"];
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: string; // "Aoede", "Charon", "Fenrir", "Kore", "Puck"
        }
      }
    };
    temperature: number; // 0.0 - 2.0
    maxOutputTokens: number;
  };
  systemInstruction: {
    parts: [{ text: string }];
  };
  realtimeInputConfig: {
    automaticActivityDetection: {
      disabled: boolean;
      startOfSpeechSensitivity: "START_SENSITIVITY_HIGH" | "START_SENSITIVITY_LOW";
      endOfSpeechSensitivity: "END_SENSITIVITY_HIGH" | "END_SENSITIVITY_LOW";
      prefixPaddingMs: number; // 300-1000ms
      silenceDurationMs: number; // 500-2000ms
    };
    activityHandling: "START_OF_ACTIVITY_INTERRUPTS" | "NO_INTERRUPTION";
  };
}

// Example setup message
const setupMessage = {
  setup: {
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: ["TEXT", "AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Aoede"
          }
        }
      },
      temperature: 0.7,
      maxOutputTokens: 8192
    },
    systemInstruction: {
      parts: [{
        text: "You are a helpful AI assistant for MVP Blocks, a component library. Help users with UI components, design patterns, and development questions."
      }]
    },
    realtimeInputConfig: {
      automaticActivityDetection: {
        disabled: false,
        startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
        endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
        prefixPaddingMs: 500,
        silenceDurationMs: 1000
      },
      activityHandling: "START_OF_ACTIVITY_INTERRUPTS"
    }
  }
};
```

#### 2. Real-time Audio Input
```typescript
interface BidiGenerateContentRealtimeInput {
  audio?: {
    data: string; // Base64 encoded PCM audio data
  };
  text?: string;
  activityStart?: {}; // Empty object to mark activity start
  activityEnd?: {}; // Empty object to mark activity end
  audioStreamEnd?: {}; // Empty object to mark audio stream end
}

// Example audio message
const audioMessage = {
  realtimeInput: {
    audio: {
      data: base64AudioChunk
    }
  }
};
```

#### 3. Client Content (Text messages)
```typescript
interface BidiGenerateContentClientContent {
  turns: Array<{
    role: "user" | "model";
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }>;
  }>;
  turnComplete: boolean;
}

// Example text message
const textMessage = {
  clientContent: {
    turns: [{
      role: "user",
      parts: [{ text: "How do I create a responsive button component?" }]
    }],
    turnComplete: true
  }
};
```

### Server Response Messages

#### 1. Setup Complete
```typescript
interface SetupCompleteResponse {
  setupComplete: {};
}
```

#### 2. Server Content (AI Response)
```typescript
interface BidiGenerateContentServerContent {
  modelTurn?: {
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string; // "audio/pcm"
        data: string; // Base64 encoded audio
      };
    }>;
  };
  turnComplete?: boolean;
  generationComplete?: boolean;
  interrupted?: boolean;
  inputTranscription?: {
    text: string;
  };
  outputTranscription?: {
    text: string;
  };
}
```

## Audio Processing Specifications

### Audio Format Requirements
```typescript
interface AudioConfig {
  sampleRate: 16000; // Hz - Required by Gemini
  channels: 1; // Mono audio only
  bitsPerSample: 16; // 16-bit PCM
  encoding: 'PCM'; // Linear PCM encoding
  chunkSize: 1024; // Bytes per chunk
  maxChunkDuration: 100; // Milliseconds
}
```

### MediaRecorder Configuration
```typescript
class AudioProcessor {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;

  async initialize(): Promise<void> {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Create audio context
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(stream);
    
    // Create processor for real-time audio chunks
    this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
    this.processor.onaudioprocess = this.processAudioChunk.bind(this);
    
    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private processAudioChunk(event: AudioProcessingEvent): void {
    const inputBuffer = event.inputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    
    // Convert Float32Array to Int16Array (PCM 16-bit)
    const pcmData = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
    }
    
    // Convert to base64 for WebSocket transmission
    const base64Data = this.arrayBufferToBase64(pcmData.buffer);
    this.onAudioChunk(base64Data);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
```

### Voice Activity Detection
```typescript
class VoiceActivityDetector {
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private threshold: number = 30; // Adjustable threshold
  private consecutiveFrames: number = 0;
  private requiredFrames: number = 3;

  constructor(audioContext: AudioContext, source: MediaStreamAudioSourceNode) {
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    source.connect(this.analyser);
  }

  detectActivity(): boolean {
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average amplitude
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    if (average > this.threshold) {
      this.consecutiveFrames++;
      return this.consecutiveFrames >= this.requiredFrames;
    } else {
      this.consecutiveFrames = 0;
      return false;
    }
  }

  getAudioLevel(): number {
    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    return Math.min(100, (average / 128) * 100); // Normalize to 0-100
  }
}
```

## State Management Architecture

### Enhanced Context State
```typescript
interface GeminiLiveContextState {
  // Connection state
  connection: {
    status: ConnectionStatus;
    sessionId: string | null;
    websocket: WebSocket | null;
    lastPingTime: number;
    reconnectAttempts: number;
    error: GeminiError | null;
  };

  // Audio state
  audio: {
    isRecording: boolean;
    isPlaying: boolean;
    permission: PermissionState;
    deviceId: string | null;
    level: number; // 0-100
    processor: AudioProcessor | null;
    vadDetector: VoiceActivityDetector | null;
  };

  // Conversation state
  conversation: {
    messages: GeminiMessage[];
    currentTurn: GeminiMessage | null;
    isStreaming: boolean;
    streamBuffer: string;
    turnComplete: boolean;
  };

  // Configuration
  config: {
    model: string;
    voice: VoiceName;
    responseModality: ResponseModality;
    temperature: number;
    maxTokens: number;
    systemInstructions: string;
  };

  // UI state
  ui: {
    mode: 'voice' | 'text';
    sidebarOpen: boolean;
    filter: MessageFilter;
    isTransitioning: boolean;
    showSettings: boolean;
  };
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
type PermissionState = 'prompt' | 'granted' | 'denied';
type VoiceName = 'Aoede' | 'Charon' | 'Fenrir' | 'Kore' | 'Puck';
type ResponseModality = 'TEXT' | 'AUDIO' | 'TEXT_AND_AUDIO';
type MessageFilter = 'all' | 'conversation' | 'tools';
```

### Context Actions
```typescript
interface GeminiLiveActions {
  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;

  // Audio actions
  requestMicrophonePermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playAudio: (audioData: string) => Promise<void>;

  // Message actions
  sendTextMessage: (text: string) => void;
  sendAudioChunk: (audioData: string) => void;
  clearConversation: () => void;

  // Configuration actions
  updateConfig: (config: Partial<GeminiLiveContextState['config']>) => void;
  setVoice: (voice: VoiceName) => void;
  setResponseModality: (modality: ResponseModality) => void;

  // UI actions
  setMode: (mode: 'voice' | 'text') => void;
  toggleSidebar: () => void;
  setFilter: (filter: MessageFilter) => void;
}
```

## Error Handling Specifications

### Error Types
```typescript
enum GeminiErrorCode {
  // Connection errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  WEBSOCKET_CLOSED = 'WEBSOCKET_CLOSED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Authentication errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Audio errors
  MICROPHONE_ACCESS_DENIED = 'MICROPHONE_ACCESS_DENIED',
  AUDIO_PROCESSING_ERROR = 'AUDIO_PROCESSING_ERROR',
  UNSUPPORTED_AUDIO_FORMAT = 'UNSUPPORTED_AUDIO_FORMAT',
  
  // API errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  MODEL_UNAVAILABLE = 'MODEL_UNAVAILABLE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // Session errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_SESSION = 'INVALID_SESSION',
  SESSION_LIMIT_REACHED = 'SESSION_LIMIT_REACHED'
}

interface GeminiError {
  code: GeminiErrorCode;
  message: string;
  details?: any;
  timestamp: number;
  recoverable: boolean;
  retryAfter?: number; // For rate limiting
}
```

### Error Recovery Strategies
```typescript
class ErrorRecoveryManager {
  private maxRetries = 3;
  private backoffMultiplier = 2;
  private baseDelay = 1000;

  async handleError(error: GeminiError): Promise<void> {
    switch (error.code) {
      case GeminiErrorCode.CONNECTION_FAILED:
        await this.handleConnectionError(error);
        break;
      
      case GeminiErrorCode.RATE_LIMIT_EXCEEDED:
        await this.handleRateLimitError(error);
        break;
      
      case GeminiErrorCode.MICROPHONE_ACCESS_DENIED:
        this.handleMicrophoneError(error);
        break;
      
      case GeminiErrorCode.TOKEN_EXPIRED:
        await this.handleTokenExpiredError(error);
        break;
      
      default:
        this.handleGenericError(error);
    }
  }

  private async handleConnectionError(error: GeminiError): Promise<void> {
    if (error.recoverable && this.canRetry()) {
      const delay = this.calculateBackoffDelay();
      await this.delay(delay);
      await this.reconnect();
    } else {
      this.showErrorToUser(error);
    }
  }

  private async handleRateLimitError(error: GeminiError): Promise<void> {
    const retryAfter = error.retryAfter || 60000; // Default 1 minute
    this.showRateLimitMessage(retryAfter);
    await this.delay(retryAfter);
    await this.reconnect();
  }

  private calculateBackoffDelay(): number {
    return this.baseDelay * Math.pow(this.backoffMultiplier, this.retryCount);
  }
}
```

## Performance Optimization Specifications

### WebSocket Message Optimization
```typescript
class MessageOptimizer {
  private messageQueue: any[] = [];
  private batchSize = 10;
  private batchTimeout = 100; // ms

  queueMessage(message: any): void {
    this.messageQueue.push(message);
    
    if (this.messageQueue.length >= this.batchSize) {
      this.flushQueue();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    setTimeout(() => {
      if (this.messageQueue.length > 0) {
        this.flushQueue();
      }
    }, this.batchTimeout);
  }

  private flushQueue(): void {
    if (this.messageQueue.length === 0) return;
    
    // Send batched messages
    const batch = this.messageQueue.splice(0, this.batchSize);
    this.sendBatch(batch);
  }
}
```

### Audio Chunk Optimization
```typescript
class AudioChunkOptimizer {
  private chunkBuffer: ArrayBuffer[] = [];
  private targetChunkSize = 1024; // bytes
  private maxBufferSize = 4096; // bytes

  addAudioData(data: ArrayBuffer): void {
    this.chunkBuffer.push(data);
    
    const totalSize = this.chunkBuffer.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    
    if (totalSize >= this.targetChunkSize) {
      this.flushBuffer();
    } else if (totalSize >= this.maxBufferSize) {
      // Force flush if buffer gets too large
      this.flushBuffer();
    }
  }

  private flushBuffer(): void {
    if (this.chunkBuffer.length === 0) return;
    
    // Combine chunks into single buffer
    const totalSize = this.chunkBuffer.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const combinedBuffer = new ArrayBuffer(totalSize);
    const combinedView = new Uint8Array(combinedBuffer);
    
    let offset = 0;
    for (const chunk of this.chunkBuffer) {
      combinedView.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    
    this.sendAudioChunk(combinedBuffer);
    this.chunkBuffer = [];
  }
}
```

## Security Specifications

### API Key Management
```typescript
class SecureApiKeyManager {
  private static instance: SecureApiKeyManager;
  private apiKey: string | null = null;
  private tokenExpiry: number | null = null;

  static getInstance(): SecureApiKeyManager {
    if (!SecureApiKeyManager.instance) {
      SecureApiKeyManager.instance = new SecureApiKeyManager();
    }
    return SecureApiKeyManager.instance;
  }

  async getValidToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.apiKey!;
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() > this.tokenExpiry;
  }

  private async refreshToken(): Promise<void> {
    const response = await fetch('/api/gemini/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: 1800 }) // 30 minutes
    });
    
    const { token } = await response.json();
    this.apiKey = token;
    this.tokenExpiry = Date.now() + (1800 * 1000); // 30 minutes
  }
}
```

### Input Validation
```typescript
class InputValidator {
  static validateTextMessage(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    if (text.length > 2000) return false; // Max length
    if (text.trim().length === 0) return false;
    return true;
  }

  static validateAudioChunk(data: string): boolean {
    if (!data || typeof data !== 'string') return false;
    
    try {
      // Validate base64 format
      const decoded = atob(data);
      return decoded.length > 0 && decoded.length <= 8192; // Max chunk size
    } catch {
      return false;
    }
  }

  static sanitizeSystemInstructions(instructions: string): string {
    // Remove potentially harmful content
    return instructions
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim()
      .substring(0, 1000); // Max length
  }
}
```

## Testing Specifications

### Unit Test Requirements
```typescript
describe('GeminiWebSocketService', () => {
  test('should establish connection with valid API key', async () => {
    const service = new GeminiWebSocketService();
    await expect(service.connect(validApiKey)).resolves.toBeUndefined();
    expect(service.isConnected()).toBe(true);
  });

  test('should handle connection errors gracefully', async () => {
    const service = new GeminiWebSocketService();
    await expect(service.connect(invalidApiKey)).rejects.toThrow();
  });

  test('should send setup message correctly', () => {
    const service = new GeminiWebSocketService();
    const setupMessage = createValidSetupMessage();
    expect(() => service.sendSetup(setupMessage)).not.toThrow();
  });
});

describe('AudioProcessor', () => {
  test('should request microphone permission', async () => {
    const processor = new AudioProcessor();
    const permission = await processor.requestMicrophonePermission();
    expect(typeof permission).toBe('boolean');
  });

  test('should process audio chunks correctly', () => {
    const processor = new AudioProcessor();
    const mockAudioData = new Float32Array(1024);
    const result = processor.processAudioChunk(mockAudioData);
    expect(result).toMatch(/^[A-Za-z0-9+/]*={0,2}$/); // Base64 format
  });
});
```

### Integration Test Requirements
```typescript
describe('End-to-End Voice Conversation', () => {
  test('should complete full voice interaction flow', async () => {
    // 1. Connect to Gemini
    await geminiService.connect();
    expect(geminiService.isConnected()).toBe(true);

    // 2. Start recording
    await audioService.startRecording();
    expect(audioService.isRecording()).toBe(true);

    // 3. Send audio data
    const audioChunk = generateMockAudioChunk();
    await geminiService.sendAudioChunk(audioChunk);

    // 4. Receive response
    const response = await waitForResponse();
    expect(response).toBeDefined();
    expect(response.content).toBeTruthy();

    // 5. Clean up
    await audioService.stopRecording();
    await geminiService.disconnect();
  });
});
```

This technical specification provides the detailed implementation requirements for integrating Gemini Live API into the MVP Blocks App, ensuring robust real-time voice and text communication capabilities.