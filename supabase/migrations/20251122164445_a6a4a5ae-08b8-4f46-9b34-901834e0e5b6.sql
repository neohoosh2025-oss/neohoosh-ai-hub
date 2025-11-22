-- Fix neohi_chats schema: ensure created_by is auto-populated and not null

-- Drop existing default first
ALTER TABLE neohi_chats
ALTER COLUMN created_by DROP DEFAULT;

-- Set new default to auth.uid()
ALTER TABLE neohi_chats
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Update any existing NULL values
UPDATE neohi_chats SET created_by = auth.uid() WHERE created_by IS NULL;

-- Set NOT NULL constraint
ALTER TABLE neohi_chats
ALTER COLUMN created_by SET NOT NULL;

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can create chats" ON neohi_chats;
DROP POLICY IF EXISTS "Users can create chats as themselves" ON neohi_chats;

-- Create the correct insert policy
CREATE POLICY "Users can create chats"
ON neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());