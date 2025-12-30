-- Modify announcements table to support text-only banners
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'carousel_image'; -- 'carousel_image' or 'text_banner'
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS content TEXT; -- For text banner content

-- Make image fields optional since text banners won't have images
ALTER TABLE announcements ALTER COLUMN image_url DROP NOT NULL;
ALTER TABLE announcements ALTER COLUMN image_path DROP NOT NULL;

-- Update existing records to be carousel images
UPDATE announcements SET type = 'carousel_image' WHERE type IS NULL;

-- Create index for type filtering
CREATE INDEX IF NOT EXISTS announcements_type_active_idx ON announcements(type, is_active);
