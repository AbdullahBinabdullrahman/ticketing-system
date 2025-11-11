-- Migration: Fix user_sessions table structure
-- Date: 2025-11-08
-- Description: Remove token and refresh_token columns, add sessionId column

-- Step 1: Clear all existing sessions (they're using old token system)
TRUNCATE TABLE user_sessions CASCADE;

-- Step 2: Drop the old token columns if they exist
ALTER TABLE user_sessions DROP COLUMN IF EXISTS token;
ALTER TABLE user_sessions DROP COLUMN IF EXISTS refresh_token;

-- Step 3: Drop old indexes if they exist
DROP INDEX IF EXISTS idx_user_sessions_token;
DROP INDEX IF EXISTS idx_user_sessions_refresh_token;
DROP INDEX IF EXISTS user_sessions_token_key;
DROP INDEX IF EXISTS user_sessions_refresh_token_key;

-- Step 4: Add session_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_sessions' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN session_id VARCHAR(100) NOT NULL UNIQUE;
  END IF;
END $$;

-- Step 5: Verify the changes
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;



