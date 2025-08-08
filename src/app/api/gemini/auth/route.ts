import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { duration = 1800 } = await request.json();
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/authTokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        authToken: {
          expireTime: new Date(Date.now() + duration * 1000).toISOString()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create auth token');
    }
    
    const token = await response.json();
    return NextResponse.json({ token: token.name });
  } catch (error) {
    console.error('Auth token creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create auth token' }, 
      { status: 500 }
    );
  }
}