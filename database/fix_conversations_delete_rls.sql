-- Fix RLS policies to allow DELETE on conversations table
-- Run this in your Supabase SQL Editor

-- Add DELETE policy for conversations
DROP POLICY IF EXISTS "Users can delete conversations" ON conversations;

CREATE POLICY "Users can delete conversations"
  ON conversations FOR DELETE
  USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Verify all policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'conversations' ORDER BY cmd;
