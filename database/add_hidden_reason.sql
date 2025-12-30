-- Add hidden_reason column to items table for admin feedback when hiding listings
ALTER TABLE items ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

COMMENT ON COLUMN items.hidden_reason IS 'Admin-provided reason when a listing is hidden';
