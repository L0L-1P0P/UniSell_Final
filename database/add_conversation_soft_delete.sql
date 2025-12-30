-- Add soft-delete fields to conversations table
-- Run this in your Supabase SQL Editor

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS buyer_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seller_deleted BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_deleted ON conversations(buyer_id, buyer_deleted);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_deleted ON conversations(seller_id, seller_deleted);

-- Verify the columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
AND column_name IN ('buyer_deleted', 'seller_deleted');
