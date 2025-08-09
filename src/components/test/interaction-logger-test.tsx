'use client';

import { useState, useEffect } from 'react';
import { interactionLogger } from '@/lib/interaction-logger';

export function InteractionLoggerTest() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState({ queueSize: 0, isProcessing: false });

  const testSessionId = `test_${Date.now()}`;

  useEffect(() => {
    // Update queue status every second
    const interval = setInterval(() => {
      setQueueStatus(interactionLogger.getQueueStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const testLogging = async () => {
    console.log('🧪 Testing interaction logging...');
    
    // Test session start
    await interactionLogger.logSessionStart(testSessionId, undefined, {
      test: true,
      browser: navigator.userAgent
    });

    // Test user message
    await interactionLogger.logUserMessage(testSessionId, 'Hello, this is a test message');

    // Test assistant response
    await interactionLogger.logAssistantResponse(testSessionId, 'This is a test response from the assistant');

    // Test audio input
    await interactionLogger.logAudioInput(testSessionId, {
      duration: 2500,
      size: 1024
    });

    // Test tool call
    await interactionLogger.logToolCall(testSessionId, {
      name: 'testFunction',
      args: { param1: 'value1' },
      id: 'test_call_123'
    });

    // Test tool response
    await interactionLogger.logToolResponse(testSessionId, {
      id: 'test_call_123',
      response: { success: true, result: 'Test completed' },
      success: true
    });

    // Test error
    await interactionLogger.logError(testSessionId, new Error('Test error message'));

    // Test session end
    await interactionLogger.logSessionEnd(testSessionId, undefined, {
      test: true,
      duration: 30000
    });

    console.log('✅ Test logging completed');
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/interactions/log?session_id=${testSessionId}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/interactions/stats?days=1');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const forceFlush = async () => {
    await interactionLogger.forceFlush();
    console.log('🚀 Force flush completed');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Interaction Logger Test</h2>
      
      {/* Queue Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Queue Status</h3>
        <p>Queue Size: {queueStatus.queueSize}</p>
        <p>Processing: {queueStatus.isProcessing ? 'Yes' : 'No'}</p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 space-x-4">
        <button
          onClick={testLogging}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Test Logging
        </button>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Fetch Logs
        </button>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Fetch Stats
        </button>
        <button
          onClick={forceFlush}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Force Flush
        </button>
      </div>

      {/* Stats Display */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Statistics (Last {stats.period_days} days)</h3>
          <p>Total Interactions: {stats.total_interactions}</p>
          <p>Total Sessions: {stats.total_sessions}</p>
          <div className="mt-2">
            <h4 className="font-medium">Interaction Types:</h4>
            <pre className="text-sm bg-white p-2 rounded mt-1">
              {JSON.stringify(stats.interaction_types, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Logs Display */}
      <div className="space-y-4">
        <h3 className="font-semibold">Recent Logs ({logs.length})</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs found. Run test logging first.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm bg-blue-100 px-2 py-1 rounded">
                    {log.interaction_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="mb-1">
                    <strong>Content:</strong>
                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.content, null, 2)}
                    </pre>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div>
                      <strong>Metadata:</strong>
                      <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}