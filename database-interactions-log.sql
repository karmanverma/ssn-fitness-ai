-- Create interactions_log table for AI assistant logging
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
  
  -- Indexes for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interactions_log_session_id ON interactions_log(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_log_user_id ON interactions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_log_timestamp ON interactions_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_interactions_log_type ON interactions_log(interaction_type);

-- Enable Row Level Security
ALTER TABLE interactions_log ENABLE ROW LEVEL SECURITY;

-- Create policies for interactions_log
-- Allow users to view their own interactions
CREATE POLICY "Users can view own interactions" ON interactions_log
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow viewing anonymous interactions
    );

-- Allow users to insert their own interactions
CREATE POLICY "Users can insert own interactions" ON interactions_log
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow anonymous interactions
    );

-- Allow service role to manage all interactions (for system operations)
CREATE POLICY "Service role can manage all interactions" ON interactions_log
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to clean up old interactions (optional)
CREATE OR REPLACE FUNCTION cleanup_old_interactions()
RETURNS void AS $$
BEGIN
    DELETE FROM interactions_log 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old interactions (run weekly)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-interactions', '0 2 * * 0', 'SELECT cleanup_old_interactions();');