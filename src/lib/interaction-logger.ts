/**
 * Robust Interaction Logger for Gemini Live API
 * Handles real-time logging without blocking the Live API
 */

import { createClient } from '@/lib/supabase/client';

export interface InteractionLog {
  session_id: string;
  user_id?: string;
  interaction_type: 'user_message' | 'assistant_response' | 'tool_call' | 'tool_response' | 
                   'audio_input' | 'audio_output' | 'session_start' | 'session_end' | 'error';
  content: any;
  metadata?: any;
  timestamp?: string;
}

export class InteractionLogger {
  private static instance: InteractionLogger;
  private supabase = createClient();
  private logQueue: InteractionLog[] = [];
  private isProcessing = false;
  private batchSize = 10;
  private flushInterval = 2000; // 2 seconds
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  static getInstance(): InteractionLogger {
    if (!InteractionLogger.instance) {
      InteractionLogger.instance = new InteractionLogger();
    }
    return InteractionLogger.instance;
  }

  private constructor() {
    // Start periodic flush
    setInterval(() => this.flushLogs(), this.flushInterval);
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushLogs());
      window.addEventListener('pagehide', () => this.flushLogs());
    }
  }

  /**
   * Log an interaction (non-blocking)
   */
  async log(logEntry: InteractionLog): Promise<void> {
    try {
      // Validate required fields
      if (!logEntry.session_id || !logEntry.interaction_type) {
        console.warn('Invalid log entry - missing required fields:', logEntry);
        return;
      }

      // Add timestamp if not provided
      if (!logEntry.timestamp) {
        logEntry.timestamp = new Date().toISOString();
      }

      // Add to queue
      this.logQueue.push(logEntry);

      // Flush if queue is full
      if (this.logQueue.length >= this.batchSize) {
        this.flushLogs();
      }
    } catch (error) {
      console.error('Failed to queue interaction log:', error);
    }
  }

  /**
   * Log session start
   */
  async logSessionStart(sessionId: string, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'session_start',
      content: { event: 'session_started' },
      metadata: {
        ...metadata,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Log session end
   */
  async logSessionEnd(sessionId: string, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'session_end',
      content: { event: 'session_ended' },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
    
    // Force flush on session end
    await this.flushLogs();
  }

  /**
   * Log user message
   */
  async logUserMessage(sessionId: string, message: string, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'user_message',
      content: {
        text: message,
        length: message.length
      },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Log assistant response
   */
  async logAssistantResponse(sessionId: string, response: string, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'assistant_response',
      content: {
        text: response,
        length: response.length
      },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Log audio input
   */
  async logAudioInput(sessionId: string, audioData: { duration?: number, size?: number }, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'audio_input',
      content: {
        audio_duration_ms: audioData.duration,
        audio_size_bytes: audioData.size
      },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Log audio output
   */
  async logAudioOutput(sessionId: string, audioData: { duration?: number, size?: number }, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'audio_output',
      content: {
        audio_duration_ms: audioData.duration,
        audio_size_bytes: audioData.size
      },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Log tool call
   */
  async logToolCall(sessionId: string, toolCall: any, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'tool_call',
      content: {
        function_name: toolCall.name,
        arguments: toolCall.args,
        call_id: toolCall.id
      },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Log tool response
   */
  async logToolResponse(sessionId: string, toolResponse: any, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'tool_response',
      content: {
        response: toolResponse.response,
        success: toolResponse.success,
        call_id: toolResponse.id
      },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Log error
   */
  async logError(sessionId: string, error: any, userId?: string, metadata?: any): Promise<void> {
    await this.log({
      session_id: sessionId,
      user_id: userId,
      interaction_type: 'error',
      content: {
        error_message: error.message || String(error),
        error_type: error.name || 'Unknown',
        stack: error.stack
      },
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Flush logs to database (with retry logic and server fallback)
   */
  private async flushLogs(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logsToProcess = [...this.logQueue];
    this.logQueue = [];

    let retryCount = 0;
    while (retryCount < this.maxRetries) {
      try {
        // Try direct Supabase client first
        const { error } = await this.supabase
          .from('interactions_log')
          .insert(logsToProcess);

        if (error) {
          throw error;
        }

        console.log(`✅ Flushed ${logsToProcess.length} interaction logs to database`);
        break;
      } catch (error) {
        retryCount++;
        console.error(`❌ Failed to flush logs (attempt ${retryCount}/${this.maxRetries}):`, error);
        
        if (retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * retryCount));
        } else {
          // Try server-side API as fallback
          try {
            const response = await fetch('/api/interactions/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logs: logsToProcess })
            });
            
            if (response.ok) {
              console.log(`✅ Flushed ${logsToProcess.length} logs via server API`);
              break;
            } else {
              throw new Error(`Server API failed: ${response.status}`);
            }
          } catch (serverError) {
            console.error('❌ Server API fallback failed:', serverError);
            // Re-queue failed logs for next attempt
            this.logQueue.unshift(...logsToProcess);
            console.error('❌ All methods failed, logs re-queued');
          }
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get session logs
   */
  async getSessionLogs(sessionId: string, userId?: string): Promise<any[]> {
    try {
      let query = this.supabase
        .from('interactions_log')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get session logs:', error);
      return [];
    }
  }

  /**
   * Get user interaction history
   */
  async getUserInteractionHistory(userId: string, limit = 100): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('interactions_log')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user interaction history:', error);
      return [];
    }
  }

  /**
   * Force flush all pending logs
   */
  async forceFlush(): Promise<void> {
    await this.flushLogs();
    
    // If there are still logs in queue after flush, try server API
    if (this.logQueue.length > 0) {
      const remainingLogs = [...this.logQueue];
      this.logQueue = [];
      
      try {
        const response = await fetch('/api/interactions/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: remainingLogs })
        });
        
        if (response.ok) {
          console.log(`✅ Force flushed ${remainingLogs.length} logs via server API`);
        } else {
          console.error('❌ Force flush via server API failed');
          // Put logs back in queue
          this.logQueue.unshift(...remainingLogs);
        }
      } catch (error) {
        console.error('❌ Force flush server API error:', error);
        // Put logs back in queue
        this.logQueue.unshift(...remainingLogs);
      }
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { queueSize: number, isProcessing: boolean } {
    return {
      queueSize: this.logQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Export singleton instance
export const interactionLogger = InteractionLogger.getInstance();