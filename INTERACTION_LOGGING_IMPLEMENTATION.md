# Interaction Logging Implementation for Gemini Live API

## Overview

This implementation provides a robust, real-time logging system for all Gemini Live API conversations and interactions. The system is designed to handle the challenges of Live API sessions where clients can disconnect unexpectedly.

## Architecture

### 1. Database Schema

**Table: `interactions_log`**
```sql
- id: UUID (Primary Key)
- session_id: TEXT (Gemini session identifier)
- user_id: UUID (References auth.users)
- interaction_type: TEXT (Enum: user_message, assistant_response, tool_call, tool_response, audio_input, audio_output, session_start, session_end, error)
- content: JSONB (Flexible content storage)
- metadata: JSONB (Additional metadata)
- timestamp: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

**Indexes:**
- `idx_interactions_log_session_id` - For session-based queries
- `idx_interactions_log_user_id` - For user-based queries
- `idx_interactions_log_timestamp` - For time-based queries
- `idx_interactions_log_type` - For interaction type filtering
- `idx_interactions_log_user_timestamp` - Composite for user history

### 2. Logging Service (`InteractionLogger`)

**Key Features:**
- **Non-blocking**: Queues logs and flushes in batches
- **Retry Logic**: Automatic retry with exponential backoff
- **Server Fallback**: Falls back to API route if direct DB fails
- **Session Management**: Tracks complete session lifecycle
- **Memory Efficient**: Batches logs to prevent memory buildup

**Robustness Features:**
- Automatic flush every 2 seconds
- Force flush on page unload/hide
- Queue size monitoring
- Multiple retry attempts with backoff
- Server-side API fallback

### 3. Integration Points

**Enhanced AI Assistant Context:**
- Session start/end logging
- User message logging
- Assistant response logging
- Audio input/output logging
- Tool call/response logging
- Error logging
- Automatic user ID detection

**Event-Driven Logging:**
```typescript
// Session lifecycle
client.on('open', () => interactionLogger.logSessionStart(...))
client.on('close', () => interactionLogger.logSessionEnd(...))

// Message flow
client.on('content', (content) => interactionLogger.logAssistantResponse(...))
sendTextMessage() -> interactionLogger.logUserMessage(...)

// Audio flow
client.on('audio', (data) => interactionLogger.logAudioOutput(...))
onAudioChunk() -> interactionLogger.logAudioInput(...)

// Tool flow
client.on('toolcall', (call) => interactionLogger.logToolCall(...))
sendToolResponse() -> interactionLogger.logToolResponse(...)
```

## API Endpoints

### 1. `/api/interactions/log`
- **POST**: Batch insert logs (server-side fallback)
- **GET**: Retrieve user's interaction logs
- Query params: `session_id`, `limit`, `offset`

### 2. `/api/interactions/stats`
- **GET**: Get interaction statistics
- Query params: `days` (default: 7)
- Returns: Total interactions, sessions, type breakdown, daily stats

## Usage Examples

### Basic Logging
```typescript
import { interactionLogger } from '@/lib/interaction-logger';

// Log user message
await interactionLogger.logUserMessage(sessionId, message, userId);

// Log assistant response
await interactionLogger.logAssistantResponse(sessionId, response, userId, {
  tokens: 150,
  finishReason: 'stop'
});

// Log audio interaction
await interactionLogger.logAudioInput(sessionId, {
  duration: 2500,
  size: 1024
}, userId);
```

### Session Management
```typescript
// Start session
await interactionLogger.logSessionStart(sessionId, userId, {
  model: 'gemini-2.0-flash-exp',
  mode: 'voice',
  voice: 'Aoede'
});

// End session
await interactionLogger.logSessionEnd(sessionId, userId, {
  reason: 'user_disconnect',
  duration: 120000
});
```

### Retrieving Logs
```typescript
// Get session logs
const logs = await interactionLogger.getSessionLogs(sessionId, userId);

// Get user history
const history = await interactionLogger.getUserInteractionHistory(userId, 50);
```

## Robustness Features

### 1. Queue Management
- **Batch Processing**: Groups logs into batches of 10
- **Automatic Flush**: Every 2 seconds
- **Memory Protection**: Prevents unbounded queue growth
- **Status Monitoring**: Real-time queue status

### 2. Error Handling
- **Retry Logic**: Up to 3 attempts with exponential backoff
- **Server Fallback**: API route fallback if direct DB fails
- **Error Logging**: Logs its own errors for debugging
- **Graceful Degradation**: Continues operation even if logging fails

### 3. Session Persistence
- **Page Unload**: Force flush on beforeunload/pagehide
- **Component Unmount**: Cleanup and flush on context destruction
- **Connection Loss**: Logs session end on WebSocket close
- **Error States**: Logs errors and maintains session state

### 4. Performance Optimization
- **Non-blocking**: Never blocks Live API operations
- **Batched Inserts**: Reduces database load
- **Indexed Queries**: Optimized database access
- **Memory Efficient**: Automatic queue management

## Testing

### Test Page: `/test-logger`
- Interactive testing interface
- Queue status monitoring
- Log retrieval and display
- Statistics viewing
- Force flush testing

### Test Functions
```typescript
// Run comprehensive test
await testLogging();

// Check queue status
const status = interactionLogger.getQueueStatus();

// Force flush pending logs
await interactionLogger.forceFlush();
```

## Data Structure Examples

### User Message Log
```json
{
  "session_id": "session_1704067200_abc123",
  "user_id": "user-uuid",
  "interaction_type": "user_message",
  "content": {
    "text": "How do I create a workout plan?",
    "length": 32
  },
  "metadata": {
    "timestamp": 1704067200000
  }
}
```

### Assistant Response Log
```json
{
  "session_id": "session_1704067200_abc123",
  "user_id": "user-uuid",
  "interaction_type": "assistant_response",
  "content": {
    "text": "I'll help you create a personalized workout plan...",
    "length": 156
  },
  "metadata": {
    "tokens": 45,
    "finishReason": "stop",
    "timestamp": 1704067201000
  }
}
```

### Audio Input Log
```json
{
  "session_id": "session_1704067200_abc123",
  "user_id": "user-uuid",
  "interaction_type": "audio_input",
  "content": {
    "audio_duration_ms": 2500,
    "audio_size_bytes": 1024
  },
  "metadata": {
    "mime_type": "audio/pcm",
    "timestamp": 1704067202000
  }
}
```

### Tool Call Log
```json
{
  "session_id": "session_1704067200_abc123",
  "user_id": "user-uuid",
  "interaction_type": "tool_call",
  "content": {
    "function_name": "generateFitnessReport",
    "arguments": {
      "title": "Custom Workout Plan",
      "category": "fitness"
    },
    "call_id": "call_123"
  },
  "metadata": {
    "timestamp": 1704067203000
  }
}
```

## Monitoring and Analytics

### Queue Monitoring
```typescript
const status = interactionLogger.getQueueStatus();
// { queueSize: 5, isProcessing: false }
```

### Statistics API
```typescript
const stats = await fetch('/api/interactions/stats?days=7');
// {
//   total_interactions: 150,
//   total_sessions: 12,
//   interaction_types: {
//     user_message: 45,
//     assistant_response: 45,
//     audio_input: 30,
//     tool_call: 15
//   },
//   daily_breakdown: { ... }
// }
```

## Security Features

- **RLS Policies**: Users can only access their own logs
- **Authentication**: All API routes require authentication
- **Input Validation**: Server-side validation of log data
- **Data Sanitization**: Prevents injection attacks
- **User Isolation**: Complete data isolation per user

## Benefits

1. **Complete Conversation History**: Every interaction is logged
2. **Real-time Analytics**: Immediate insights into usage patterns
3. **Debugging Support**: Detailed error and session tracking
4. **User Experience**: No impact on Live API performance
5. **Data Persistence**: Survives page refreshes and disconnections
6. **Scalable**: Handles high-volume interactions efficiently
7. **Reliable**: Multiple fallback mechanisms ensure data integrity

This implementation provides a production-ready logging system that captures all Gemini Live API interactions without impacting performance or user experience.