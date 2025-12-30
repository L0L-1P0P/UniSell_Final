-- Fix RLS policies for conversations table to allow soft-delete
-- Run this in your Supabase SQL Editor

-- First, check existing policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'conversations';

-- Drop existing UPDATE policy if it exists (it might be too restrictive)
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

-- Create new UPDATE policy that allows users to update their deleted field
CREATE POLICY "Users can update conversation deleted status"
  ON conversations FOR UPDATE
  USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  )
  WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Verify the policy was created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'conversations';
