import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get interaction statistics
    const { data: stats, error: statsError } = await supabase
      .from('interactions_log')
      .select('interaction_type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (statsError) {
      console.error('Stats query error:', statsError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Get session count
    const { data: sessions, error: sessionsError } = await supabase
      .from('interactions_log')
      .select('session_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'session_start')
      .gte('created_at', startDate.toISOString());

    if (sessionsError) {
      console.error('Sessions query error:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Process statistics
    const typeStats = (stats || []).reduce((acc: any, log: any) => {
      acc[log.interaction_type] = (acc[log.interaction_type] || 0) + 1;
      return acc;
    }, {});

    const dailyStats = (stats || []).reduce((acc: any, log: any) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      total_interactions: stats?.length || 0,
      total_sessions: sessions?.length || 0,
      interaction_types: typeStats,
      daily_breakdown: dailyStats,
      period_days: days
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}