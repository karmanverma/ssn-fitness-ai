'use client';

import { useState } from 'react';
import { useEnhancedAIAssistant } from '@/contexts/enhanced-ai-assistant-context';

export function GeminiTest() {
  const [testMessage, setTestMessage] = useState('Hello, can you help me with React components?');
  const { 
    connectionStatus, 
    messages, 
    isStreaming, 
    currentResponse,
    sendTextMessage,
    connect 
  } = useEnhancedAIAssistant();

  const handleTest = async () => {
    if (connectionStatus === 'disconnected') {
      await connect();
    }
    sendTextMessage(testMessage);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Gemini Integration Test</h2>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span>Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
            connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={3}
          placeholder="Enter test message..."
        />
      </div>

      <button
        onClick={handleTest}
        disabled={isStreaming}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isStreaming ? 'Sending...' : 'Send Test Message'}
      </button>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Messages:</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'bg-gray-50 border-l-4 border-gray-500'
              }`}
            >
              <div className="font-medium text-sm text-gray-600 mb-1">
                {message.role === 'user' ? 'You' : 'Gemini'}
              </div>
              <div className="text-gray-800">{message.content.text}</div>
            </div>
          ))}
          
          {isStreaming && currentResponse && (
            <div className="p-3 rounded-lg bg-gray-50 border-l-4 border-gray-500">
              <div className="font-medium text-sm text-gray-600 mb-1">
                Gemini (streaming...)
              </div>
              <div className="text-gray-800">{currentResponse}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}