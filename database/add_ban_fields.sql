-- Add ban-related columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.banned_until IS 'Timestamp until which the user is banned. NULL means not banned. Check this on login to redirect to /banned page.';
COMMENT ON COLUMN profiles.ban_reason IS 'Admin-provided reason for the ban, shown to the user on the banned page.';

-- Create index for efficient ban checks
CREATE INDEX IF NOT EXISTS idx_profiles_banned_until ON profiles(banned_until) WHERE banned_until IS NOT NULL;
