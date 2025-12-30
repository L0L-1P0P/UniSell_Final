-- Update foreign key constraints to allow CASCADE delete
-- This allows deleting a user profile to automatically delete all related data

-- Drop and recreate items.seller_id foreign key with CASCADE
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_seller_id_fkey;
ALTER TABLE items 
  ADD CONSTRAINT items_seller_id_fkey 
  FOREIGN KEY (seller_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Drop and recreate items.buyer_id foreign key with CASCADE (if it exists)
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_buyer_id_fkey;
ALTER TABLE items 
  ADD CONSTRAINT items_buyer_id_fkey 
  FOREIGN KEY (buyer_id) 
  REFERENCES profiles(id) 
  ON DELETE SET NULL;

-- Drop and recreate conversations foreign keys with CASCADE
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_buyer_id_fkey;
ALTER TABLE conversations 
  ADD CONSTRAINT conversations_buyer_id_fkey 
  FOREIGN KEY (buyer_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_seller_id_fkey;
ALTER TABLE conversations 
  ADD CONSTRAINT conversations_seller_id_fkey 
  FOREIGN KEY (seller_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Drop and recreate messages.sender_id foreign key with CASCADE
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Drop and recreate reviews foreign keys with CASCADE
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_buyer_id_fkey;
ALTER TABLE reviews 
  ADD CONSTRAINT reviews_buyer_id_fkey 
  FOREIGN KEY (buyer_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_seller_id_fkey;
ALTER TABLE reviews 
  ADD CONSTRAINT reviews_seller_id_fkey 
  FOREIGN KEY (seller_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Note: Reports table constraints skipped - column names may differ in actual schema
-- If reports table exists with different column names, update manually

-- Drop and recreate favorites.user_id foreign key with CASCADE
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE favorites 
  ADD CONSTRAINT favorites_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT items_seller_id_fkey ON items IS 'Cascade delete items when seller is deleted';
COMMENT ON CONSTRAINT conversations_buyer_id_fkey ON conversations IS 'Cascade delete conversations when buyer is deleted';
COMMENT ON CONSTRAINT conversations_seller_id_fkey ON conversations IS 'Cascade delete conversations when seller is deleted';
COMMENT ON CONSTRAINT messages_sender_id_fkey ON messages IS 'Cascade delete messages when sender is deleted';
COMMENT ON CONSTRAINT reviews_buyer_id_fkey ON reviews IS 'Cascade delete reviews when buyer is deleted';
COMMENT ON CONSTRAINT reviews_seller_id_fkey ON reviews IS 'Cascade delete reviews when seller is deleted';
COMMENT ON CONSTRAINT favorites_user_id_fkey ON favorites IS 'Cascade delete favorites when user is deleted';
