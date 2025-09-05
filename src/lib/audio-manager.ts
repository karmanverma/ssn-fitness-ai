/**
 * Enhanced Audio Manager for Gemini Live API
 * Handles microphone access, audio processing, and playback
 */

import { AudioStreamer } from './audio-streamer';

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  chunkSize: number;
  vadThreshold: number;
}

export interface AudioManagerOptions {
  onAudioChunk: (chunk: { mimeType: string; data: string }) => void;
  onAudioLevel: (level: number) => void;
  onError: (error: Error) => void;
  config?: Partial<AudioConfig>;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private isPlaying = false;
  
  private config: AudioConfig;
  private onAudioChunk: (chunk: { mimeType: string; data: string }) => void;
  private onAudioLevel: (level: number) => void;
  private onError: (error: Error) => void;

  // Audio level monitoring
  private levelMonitoringActive = false;
  private dataArray: Uint8Array | null = null;

  // Audio streaming
  private audioStreamer: AudioStreamer | null = null;
  private playbackContext: AudioContext | null = null;

  constructor(options: AudioManagerOptions) {
    this.onAudioChunk = options.onAudioChunk;
    this.onAudioLevel = options.onAudioLevel;
    this.onError = options.onError;
    
    // Default configuration optimized for Gemini Live API
    this.config = {
      sampleRate: 16000,  // Required by Gemini
      channels: 1,        // Mono audio
      chunkSize: 1024,    // Bytes per chunk
      vadThreshold: 30,   // Voice activity detection threshold
      ...options.config
    };
  }

  /**
   * Request microphone permission
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      console.log("🎤 Requesting microphone permission...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: this.config.sampleRate },
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      console.log("✅ Microphone permission granted");
      return true;
    } catch (error) {
      console.error("❌ Microphone permission denied:", error);
      this.onError(new Error("Microphone permission denied"));
      return false;
    }
  }

  /**
   * Start audio recording
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.warn("⚠️ Already recording");
      return;
    }

    try {
      console.log("🎤 Starting audio recording...");
      
      // Get media stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: this.config.sampleRate },
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context with the required sample rate
      this.audioContext = new AudioContext({ 
        sampleRate: this.config.sampleRate 
      });
      
      console.log("🔊 Audio context sample rate:", this.audioContext.sampleRate);
      
      // Create source from media stream
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Set up analyser for audio level monitoring
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      // Connect source to analyser
      this.source.connect(this.analyser);
      
      // Create script processor for real-time audio processing
      // TODO: Migrate to AudioWorkletNode to resolve deprecation warning
      // This requires creating a separate worklet file and more complex setup
      this.processor = this.audioContext.createScriptProcessor(
        this.config.chunkSize, 
        this.config.channels, 
        this.config.channels
      );
      
      this.processor.onaudioprocess = this.processAudioChunk.bind(this);
      
      // Connect the audio processing chain
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isRecording = true;
      this.startAudioLevelMonitoring();
      
      console.log("✅ Audio recording started successfully");
    } catch (error) {
      console.error("❌ Failed to start recording:", error);
      this.onError(new Error(`Failed to start recording: ${(error as Error).message}`));
      throw error;
    }
  }

  /**
   * Stop audio recording
   */
  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    console.log("🛑 Stopping audio recording...");
    
    this.isRecording = false;
    this.levelMonitoringActive = false;
    
    // Clean up audio processing chain
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
    
    console.log("✅ Audio recording stopped");
  }

  /**
   * Process audio chunks in real-time
   */
  private processAudioChunk(event: AudioProcessingEvent): void {
    if (!this.isRecording) return;

    const inputBuffer = event.inputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    
    // Convert Float32Array to Int16Array (16-bit PCM as required by Gemini)
    const pcmData = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      // Clamp values to 16-bit signed integer range
      const sample = Math.max(-1, Math.min(1, inputData[i]));
      pcmData[i] = Math.floor(sample * 32767);
    }
    
    // Convert to base64 for transmission
    const base64Data = this.arrayBufferToBase64(pcmData.buffer);
    
    // Send audio chunk with proper MIME type for Gemini (matching official demo)
    this.onAudioChunk({
      mimeType: "audio/pcm;rate=16000",
      data: base64Data
    });
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Start monitoring audio levels
   */
  private startAudioLevelMonitoring(): void {
    if (!this.analyser || !this.dataArray) return;

    this.levelMonitoringActive = true;
    
    const updateLevel = () => {
      if (!this.levelMonitoringActive || !this.analyser || !this.dataArray) return;
      
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Calculate average amplitude
      const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
      const level = Math.min(100, (average / 128) * 100);
      
      this.onAudioLevel(level);
      
      // Continue monitoring
      requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  }

  /**
   * Play audio response from Gemini using streaming approach
   */
  async playAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      if (!this.audioStreamer) {
        await this.initializeAudioStreamer();
      }
      
      // Convert ArrayBuffer to Uint8Array for the streamer
      const uint8Array = new Uint8Array(audioData);
      this.audioStreamer!.addPCM16(uint8Array);
      
      this.isPlaying = true;
      console.log('🔊 Streaming audio chunk:', uint8Array.length, 'bytes');
    } catch (error) {
      console.error("❌ Failed to play audio:", error);
      this.onError(new Error(`Failed to play audio: ${(error as Error).message}`));
    }
  }

  /**
   * Initialize audio streamer for proper audio playback
   */
  private async initializeAudioStreamer(): Promise<void> {
    if (!this.playbackContext) {
      this.playbackContext = new AudioContext({ sampleRate: 24000 }); // Gemini uses 24kHz for output
    }
    
    if (this.playbackContext.state === 'suspended') {
      await this.playbackContext.resume();
    }
    
    this.audioStreamer = new AudioStreamer(this.playbackContext);
    this.audioStreamer.onComplete = () => {
      this.isPlaying = false;
      console.log('🔊 Audio playback completed');
    };
  }

  /**
   * Stop audio playback
   */
  stopAudio(): void {
    if (this.audioStreamer) {
      this.audioStreamer.stop();
      this.isPlaying = false;
    }
  }

  /**
   * Detect voice activity
   */
  detectVoiceActivity(): boolean {
    if (!this.analyser || !this.dataArray) return false;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    return average > this.config.vadThreshold;
  }

  /**
   * Get current audio level (0-100)
   */
  getCurrentAudioLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    return Math.min(100, (average / 128) * 100);
  }

  /**
   * Check if currently recording
   */
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * Check if currently playing audio
   */
  getPlayingStatus(): boolean {
    return this.isPlaying;
  }

  /**
   * Get audio configuration
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Update audio configuration
   */
  updateConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopRecording();
    this.stopAudio();
    if (this.playbackContext) {
      this.playbackContext.close();
      this.playbackContext = null;
    }
    this.audioStreamer = null;
    this.isPlaying = false;
  }
}