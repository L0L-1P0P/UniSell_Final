# Project Name: UniSell (USM Marketplace)

## 1. Project Overview
A secure, campus-exclusive second-hand marketplace for Universiti Sains Malaysia (USM) students and staff. The platform enforces strict campus isolation (Main Campus students only see Main Campus listings) and requires identity verification (IC/Matric Card) before trading.

## 2. Tech Stack
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS.
* **Backend/DB:** Supabase (Postgres, Auth, Storage, Realtime).
* **UI/Components:** shadcn/ui, lucide-react.
* **State/Theming:** next-themes.

## 3. Database Schema (Supabase)

### 3.1. Enums
* `campus_enum`: 'Main', 'Engineering', 'Health'
* `role_enum`: 'student', 'staff', 'admin'
* `status_enum`: 'pending', 'verified', 'rejected'
* `item_status`: 'available', 'sold', 'hidden'

### 3.2. Table: `profiles` (Extends `auth.users`)
* `id`: uuid (Primary Key, references `auth.users`)
* `email`: text (Unique)
* `full_name`: text
* `matric_no`: text
* `campus`: `campus_enum` (User CANNOT change this after registration)
* `usm_role`: `role_enum` (Default: 'student')
* `verification_status`: `status_enum` (Default: 'pending')
* `ic_document_path`: text (Path to private storage)
* `joined_at`: timestamp

### 3.3. Table: `items`
* `id`: uuid (Primary Key)
* `seller_id`: uuid (Foreign Key -> `profiles.id`)
* `title`: text
* `price`: numeric
* `campus`: `campus_enum` (Inherited automatically from `profiles.campus`)
* `status`: `item_status` (Default: 'available')
* `images`: text[] (Array of image URLs)
* `category`: text
* `created_at`: timestamp

## 4. Critical Logic & Security Rules (RLS)

### 4.1. The "Campus Silo" Rule (Strict Isolation)
* **Requirement:** Users can ONLY query items where `items.campus` matches their own `profiles.campus`.
* **Implementation:** Apply a Row Level Security (RLS) policy on the `items` table:
  (User's campus must equal Item's campus).

### 4.2. The "Verified Only" Gatekeeper
* **Requirement:** Unverified users can log in, but they CANNOT Create Listings or Chat.
* **Implementation:**
    * **Frontend:** If `verification_status` != 'verified', redirect users to `/onboarding/status` (Status Page).
    * **Database:** RLS policy for INSERT on `items` table must check if `verification_status` is 'verified'.

### 4.3. Data Privacy (Storage Buckets)
* **Bucket A: `private-documents` (For IC/Matric Cards)**
    * **Policy:** Only the uploader AND Admins can view/download. STRICTLY NO PUBLIC ACCESS.
* **Bucket B: `public-items` (For Product Photos)**
    * **Policy:** Public read access for everyone.

## 5. Module Specifications

### Module A: Authentication & Onboarding
* **Sign Up:** Validate email domains (`@student.usm.my`, `@usm.my`).
* **Onboarding Flow:**
  1. User Signs Up.
  2. User is redirected to `/onboarding` form.
  3. User selects Campus, enters Matric No, uploads IC.
  4. Profile is created with `status: pending`.

### Module B: Admin Dashboard (`/admin`)
* **Middleware:** Protect route. Redirect if `usm_role` != 'admin'.
* **Verification Queue:** Table listing all profiles where `status` is 'pending'.
* **Action:** Admin views IC image + Matric No -> Clicks "Verify" or "Reject".

## 6. UI/UX Design System Specification

### 6.1. Design Philosophy
* **Style:** Ultra-minimalist, functional, high-contrast.
* **Component Library:** `shadcn/ui` (Buttons, Inputs, Cards).

### 6.2. Color Palette
* **Primary Theme:** **Dark Cyan / Teal** (approx `#0e7490`).
    * Usage: Primary buttons, active states.
* **Background Colors:**
    * **Light Mode:** White (`#ffffff`).
    * **Dark Mode:** **`#1e1e1e`** (Strict Requirement - Dark Grey, not Black).
* **Surface/Card:** Slightly lighter than background in Dark Mode (e.g., `#2d2d2d`).

### 6.3. Logo Asset
* **File:** `public/logo.png` (User provided).
* **Usage:** Center of Landing Page (Large), Navbar (Small).

### 6.4. Landing Page Specification (Route: `/`)
* **Constraint:** **Strictly Minimalist.** No feature grids, testimonials, or footers.
* **Layout:** Centered Flexbox (Vertical & Horizontal Center). Full Viewport Height (`h-screen`).
* **Elements (Order Top to Bottom):**
    1.  **Logo:** Large `logo.png` (approx 150-200px width).
    2.  **Spacing:** Proper whitespace.
    3.  **Button Group:**
        * `[Sign Up]` -> Primary Color (Dark Cyan), Solid.
        * `[Sign In]` -> Outline/Ghost variant.
* **Theme Toggle:** Dropdown Menu (Light/Dark/System) in top-right corner.