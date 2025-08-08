const WebSocket = require('ws');

const apiKey = 'AIzaSyCau0LtaCVk4Ob9d4Fgu2j2PKbV-XLYo6w';
const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

console.log('🔌 Testing Gemini Live API WebSocket connection...');

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully');
  
  const setupMessage = {
    setup: {
      model: 'gemini-2.5-flash-exp-native-audio-thinking-dialog',
      generationConfig: {
        responseModalities: ['TEXT'],
        temperature: 0.7
      },
      systemInstruction: {
        parts: [{ text: 'You are a helpful AI assistant.' }]
      }
    }
  };
  
  console.log('📤 Sending setup message...');
  ws.send(JSON.stringify(setupMessage));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('📨 Received:', JSON.stringify(message, null, 2));
  
  if (message.setupComplete) {
    console.log('✅ Setup complete! Sending test message...');
    
    const testMessage = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text: 'Hello, can you respond with a simple greeting?' }]
        }],
        turnComplete: true
      }
    };
    
    ws.send(JSON.stringify(testMessage));
  }
  
  if (message.serverContent && message.serverContent.modelTurn) {
    console.log('🎉 Received AI response!');
    setTimeout(() => {
      console.log('✅ Test completed successfully');
      ws.close();
    }, 1000);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
  process.exit(0);
});

setTimeout(() => {
  console.log('⏰ Test timeout - closing connection');
  ws.close();
}, 30000);