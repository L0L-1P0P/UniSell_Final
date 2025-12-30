# Supabase Storage Bucket Setup for Announcements

## Instructions

You need to create a storage bucket in Supabase for announcement images.

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `announcements`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`
5. Click **"Create bucket"**

### Option 2: Via SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcements', 'announcements', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Public can view announcements"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcements');

CREATE POLICY "Authenticated admins can upload announcements"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'announcements' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.usm_role = 'admin'
  )
);

CREATE POLICY "Authenticated admins can delete announcements"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'announcements' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.usm_role = 'admin'
  )
);
```

### Verify Setup

After creating the bucket, verify:

1. Bucket name is exactly `announcements` (lowercase)
2. Public access is enabled
3. You can see the bucket in the Storage section

### Usage

Once the bucket is created:

1. Go to `/admin/announcements` in your app
2. Click "Upload Announcement"
3. Upload a test image (recommended: 1920x500px)
4. The image should appear in the carousel on the home page

### Troubleshooting

If uploads fail:

- Check bucket name matches exactly: `announcements`
- Verify public access is enabled
- Check RLS policies are applied
- Ensure user has admin role (`usm_role = 'admin'`)
