-- Enable real-time for messages table
-- Run this in your Supabase SQL Editor

-- Enable real-time replication for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Verify the publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
