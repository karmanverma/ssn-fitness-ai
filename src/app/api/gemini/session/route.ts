import { NextRequest, NextResponse } from 'next/server';

interface SessionData {
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  messageCount: number;
}

const sessions = new Map<string, SessionData>();

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId } = await request.json();
    
    switch (action) {
      case 'create':
        const newSessionId = generateSessionId();
        const sessionData: SessionData = {
          sessionId: newSessionId,
          createdAt: Date.now(),
          lastActivity: Date.now(),
          messageCount: 0
        };
        sessions.set(newSessionId, sessionData);
        return NextResponse.json({ sessionId: newSessionId });
      
      case 'update':
        if (sessions.has(sessionId)) {
          const session = sessions.get(sessionId)!;
          session.lastActivity = Date.now();
          session.messageCount++;
          sessions.set(sessionId, session);
          return NextResponse.json({ updated: true });
        }
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      
      case 'end':
        sessions.delete(sessionId);
        return NextResponse.json({ ended: true });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Session operation failed:', error);
    return NextResponse.json(
      { error: 'Session operation failed' }, 
      { status: 500 }
    );
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}