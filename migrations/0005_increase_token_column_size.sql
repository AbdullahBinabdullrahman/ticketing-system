-- Migration: Replace token columns with sessionId
-- Date: 2025-11-08
-- Description: Remove token and refresh_token columns, add sessionId column
-- Tokens are stored in localStorage on client-side, we only track session validity

-- Drop the old token columns
ALTER TABLE user_sessions DROP COLUMN IF EXISTS token;
ALTER TABLE user_sessions DROP COLUMN IF EXISTS refresh_token;

-- Add sessionId column
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) NOT NULL DEFAULT '' UNIQUE;

-- Remove default after adding the column
ALTER TABLE user_sessions 
ALTER COLUMN session_id DROP DEFAULT;

-- Verify the changes
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_sessions' AND column_name = 'session_id';

