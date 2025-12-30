-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type public.campus_enum as enum ('Main', 'Engineering', 'Health');
create type public.role_enum as enum ('student', 'staff', 'admin');
create type public.status_enum as enum ('pending', 'verified', 'rejected');
create type public.item_status as enum ('available', 'sold', 'hidden');

-- Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  matric_no text,
  campus public.campus_enum not null,
  usm_role public.role_enum default 'student'::public.role_enum,
  verification_status public.status_enum default 'pending'::public.status_enum,
  ic_document_path text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
-- Users can view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Users can update their own profile (restricted fields should be handled by app logic or separate policies, but for now allow update)
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Items Table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) not null,
  title text not null,
  price numeric not null,
  campus public.campus_enum not null, -- Inherited from seller
  status public.item_status default 'available'::public.item_status,
  images text[],
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on items
alter table public.items enable row level security;

-- Items Policies

-- 4.1. The "Campus Silo" Rule
-- Users can ONLY query items where items.campus matches their own profiles.campus
create policy "Campus Silo: View items from same campus" on public.items
  for select using (
    campus = (select campus from public.profiles where id = auth.uid())
  );

-- 4.2. The "Verified Only" Gatekeeper
-- RLS policy for INSERT on items table must check if verification_status is 'verified'
create policy "Verified Only: Create items" on public.items
  for insert with check (
    auth.uid() = seller_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and verification_status = 'verified'
    )
  );

-- Users can update their own items
create policy "Users can update own items" on public.items
  for update using (auth.uid() = seller_id);

-- Storage Buckets (Policies to be applied in Storage settings, but documenting intent)
-- Bucket A: private-documents (For IC/Matric Cards) - Only uploader AND Admins
-- Bucket B: public-items (For Product Photos) - Public read access
