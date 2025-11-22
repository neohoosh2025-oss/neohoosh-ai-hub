-- Fix neohi_chats schema: set default and not null for created_by
ALTER TABLE neohi_chats
ALTER COLUMN created_by SET DEFAULT auth.uid();

ALTER TABLE neohi_chats
ALTER COLUMN created_by SET NOT NULL;

-- Drop the existing incorrect insert policy
DROP POLICY IF EXISTS "Users can create chats as themselves" ON neohi_chats;

-- Create the correct insert policy
CREATE POLICY "Users can create chats"
ON neohi_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);