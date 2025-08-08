/**
 * Enhanced Gemini Live Client based on official @google/genai SDK
 * Provides event-driven interface for real-time voice and text communication
 */

import {
  Content,
  GoogleGenAI,
  LiveCallbacks,
  LiveClientToolResponse,
  LiveConnectConfig,
  LiveServerContent,
  LiveServerMessage,
  LiveServerToolCall,
  LiveServerToolCallCancellation,
  Part,
  Session,
} from "@google/genai";

import { EventEmitter } from "eventemitter3";
import { difference } from "lodash";

export interface StreamingLog {
  date: Date;
  type: string;
  message: any;
}

export interface LiveClientOptions {
  apiKey: string;
}

/**
 * Event types that can be emitted by the GeminiLiveClient
 */
export interface LiveClientEventTypes {
  // Connection events
  open: () => void;
  close: (event: CloseEvent) => void;
  error: (error: ErrorEvent) => void;
  
  // Setup events
  setupcomplete: () => void;
  
  // Content events
  content: (data: LiveServerContent) => void;
  audio: (data: ArrayBuffer) => void;
  
  // Turn management
  turncomplete: () => void;
  interrupted: () => void;
  
  // Tool events
  toolcall: (toolCall: LiveServerToolCall) => void;
  toolcallcancellation: (toolcallCancellation: LiveServerToolCallCancellation) => void;
  
  // Logging
  log: (log: StreamingLog) => void;
}

/**
 * Enhanced Gemini Live Client with proper error handling and state management
 */
export class GeminiLiveClient extends EventEmitter<LiveClientEventTypes> {
  private client: GoogleGenAI;
  private _session: Session | null = null;
  private _status: "connected" | "disconnected" | "connecting" = "disconnected";
  private _model: string | null = null;
  private config: LiveConnectConfig | null = null;

  public get session() {
    return this._session;
  }

  public get status() {
    return this._status;
  }

  public get model() {
    return this._model;
  }

  public getConfig() {
    return { ...this.config };
  }

  constructor(options: LiveClientOptions) {
    super();
    this.client = new GoogleGenAI(options);
    
    // Bind methods to preserve context
    this.send = this.send.bind(this);
    this.onopen = this.onopen.bind(this);
    this.onerror = this.onerror.bind(this);
    this.onclose = this.onclose.bind(this);
    this.onmessage = this.onmessage.bind(this);
  }

  /**
   * Log events for debugging and monitoring
   */
  private log(type: string, message: any) {
    const log: StreamingLog = {
      date: new Date(),
      type,
      message,
    };
    this.emit("log", log);
  }

  /**
   * Connect to Gemini Live API
   */
  async connect(model: string, config: LiveConnectConfig): Promise<boolean> {
    // If already connecting, wait for it to complete
    if (this._status === "connecting") {
      console.warn("Already connecting, waiting...");
      return false;
    }

    // If already connected, disconnect first
    if (this._status === "connected") {
      console.log("Already connected, disconnecting first...");
      this.disconnect();
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this._status = "connecting";
    this.config = config;
    this._model = model;

    const callbacks: LiveCallbacks = {
      onopen: this.onopen,
      onmessage: this.onmessage,
      onerror: this.onerror,
      onclose: this.onclose,
    };

    try {
      console.log("🔌 Connecting to Gemini Live API...");
      this._session = await this.client.live.connect({
        model,
        config,
        callbacks,
      });
      
      // Status will be set to "connected" in onopen callback
      console.log("✅ Connection initiated, waiting for open event...");
      return true;
    } catch (error) {
      console.error("❌ Error connecting to Gemini Live API:", error);
      this._status = "disconnected";
      this.emit("error", error as ErrorEvent);
      return false;
    }
  }

  /**
   * Disconnect from Gemini Live API
   */
  public disconnect(): boolean {
    if (!this.session) {
      this._status = "disconnected";
      return false;
    }

    console.log("🔌 Disconnecting from Gemini Live API...");
    try {
      this.session.close();
    } catch (error) {
      console.warn("Error during disconnect:", error);
    }
    this._session = null;
    this._status = "disconnected";
    this.log("client.close", "Disconnected");
    return true;
  }

  /**
   * Handle connection open
   */
  private onopen() {
    console.log("✅ Gemini Live API connection opened");
    this._status = "connected";
    this.log("client.open", "Connected");
    this.emit("open");
  }

  /**
   * Handle connection error
   */
  private onerror(error: ErrorEvent) {
    console.error("❌ Gemini Live API error:", error);
    this.log("server.error", error.message);
    this.emit("error", error);
  }

  /**
   * Handle connection close
   */
  private onclose(event: CloseEvent) {
    console.log("🔌 Gemini Live API connection closed:", event.reason);
    this._status = "disconnected";
    this.log("server.close", `disconnected ${event.reason ? `with reason: ${event.reason}` : ""}`);
    this.emit("close", event);
  }

  /**
   * Handle incoming messages from Gemini
   */
  private async onmessage(message: LiveServerMessage) {
    // Handle setup complete
    if (message.setupComplete) {
      console.log("✅ Gemini setup complete");
      this.log("server.send", "setupComplete");
      this.emit("setupcomplete");
      return;
    }

    // Handle tool calls
    if (message.toolCall) {
      console.log("🔧 Tool call received:", message.toolCall);
      this.log("server.toolCall", message);
      this.emit("toolcall", message.toolCall);
      return;
    }

    // Handle tool call cancellation
    if (message.toolCallCancellation) {
      console.log("❌ Tool call cancellation:", message.toolCallCancellation);
      this.log("server.toolCallCancellation", message);
      this.emit("toolcallcancellation", message.toolCallCancellation);
      return;
    }

    // Handle server content
    if (message.serverContent) {
      const { serverContent } = message;

      // Handle interruption
      if ("interrupted" in serverContent) {
        console.log("⚠️ Response interrupted");
        this.log("server.content", "interrupted");
        this.emit("interrupted");
        return;
      }

      // Handle turn complete
      if ("turnComplete" in serverContent) {
        console.log("✅ Turn complete");
        this.log("server.content", "turnComplete");
        this.emit("turncomplete");
      }

      // Handle model turn (actual content)
      if ("modelTurn" in serverContent) {
        const parts: Part[] = serverContent.modelTurn?.parts || [];

        // Separate audio and other parts
        const audioParts = parts.filter(
          (p) => p.inlineData && p.inlineData.mimeType?.startsWith("audio/pcm")
        );
        const otherParts = difference(parts, audioParts);

        // Process audio parts
        audioParts.forEach((audioPart) => {
          if (audioPart.inlineData?.data) {
            const audioData = this.base64ToArrayBuffer(audioPart.inlineData.data);
            console.log("🔊 Audio response received:", audioData.byteLength, "bytes");
            this.emit("audio", audioData);
            this.log("server.audio", `buffer (${audioData.byteLength})`);
          }
        });

        // Process text/other parts
        if (otherParts.length > 0) {
          const content: { modelTurn: Content } = { modelTurn: { parts: otherParts } };
          console.log("💬 Content response received");
          this.emit("content", content);
          this.log("server.content", message);
        }
      }
    } else {
      console.warn("⚠️ Received unmatched message:", message);
    }
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Send realtime input (audio/video chunks)
   */
  sendRealtimeInput(chunks: Array<{ mimeType: string; data: string }>) {
    if (!this.session) {
      console.warn("⚠️ Cannot send realtime input: no active session");
      return;
    }

    let hasAudio = false;
    let hasVideo = false;

    for (const chunk of chunks) {
      this.session.sendRealtimeInput({ media: chunk });
      
      if (chunk.mimeType.includes("audio")) {
        hasAudio = true;
      }
      if (chunk.mimeType.includes("image")) {
        hasVideo = true;
      }
    }

    const message = hasAudio && hasVideo ? "audio + video" : hasAudio ? "audio" : hasVideo ? "video" : "unknown";
    this.log("client.realtimeInput", message);
  }

  /**
   * Send tool response
   */
  sendToolResponse(toolResponse: LiveClientToolResponse) {
    if (!this.session) {
      console.warn("⚠️ Cannot send tool response: no active session");
      return;
    }

    if (toolResponse.functionResponses && toolResponse.functionResponses.length) {
      this.session.sendToolResponse({
        functionResponses: toolResponse.functionResponses,
      });
      this.log("client.toolResponse", toolResponse);
    }
  }

  /**
   * Send normal content (text messages)
   */
  send(parts: Part | Part[], turnComplete: boolean = true) {
    if (!this.session) {
      console.warn("⚠️ Cannot send content: no active session");
      return;
    }

    const partsArray = Array.isArray(parts) ? parts : [parts];
    this.session.sendClientContent({ turns: partsArray, turnComplete });
    this.log("client.send", {
      turns: partsArray,
      turnComplete,
    });
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this._status === "connected" && this._session !== null;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    return this._status;
  }
}