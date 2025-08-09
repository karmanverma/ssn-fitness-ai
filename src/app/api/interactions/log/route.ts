import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { logs } = body;

    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: 'Invalid logs format' }, { status: 400 });
    }

    // Add user_id to all logs and validate
    const validatedLogs = logs.map(log => ({
      ...log,
      user_id: user.id,
      timestamp: log.timestamp || new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    // Insert logs into database
    const { error } = await supabase
      .from('interactions_log')
      .insert(validatedLogs);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save logs' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: validatedLogs.length 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('interactions_log')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    return NextResponse.json({ 
      logs: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}