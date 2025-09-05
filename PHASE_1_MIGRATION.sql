-- PHASE 1: Critical Database Migration
-- Run this in your Supabase SQL Editor to fix 403 errors

CREATE TABLE IF NOT EXISTS interactions_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'user_message', 'assistant_response', 'tool_call', 'tool_response', 
    'audio_input', 'audio_output', 'session_start', 'session_end', 'error'
  )),
  content JSONB,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interactions_log_session_id ON interactions_log(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_log_user_id ON interactions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_log_timestamp ON interactions_log(timestamp);

-- Enable RLS
ALTER TABLE interactions_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own interactions" ON interactions_log
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own interactions" ON interactions_log
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);