-- Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- Policy: Allow Authenticated Uploads to 'private-documents'
create policy "Allow Authenticated Uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'private-documents'
);

-- Policy: Allow Users to View/Select their own files in 'private-documents'
-- Assumes file path structure is: {user_id}/{filename}
create policy "Allow Individual View"
on storage.objects for select
to authenticated
using (
  bucket_id = 'private-documents' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure profiles table allows updates by owner (already in schema.sql but good to double check/re-apply if needed)
-- create policy "Users can update own profile" on public.profiles
--   for update using (auth.uid() = id);
