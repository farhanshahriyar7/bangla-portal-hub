-- =====================================================
-- COMPLETE DATABASE EXPORT FOR YOUR SUPABASE ACCOUNT
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- Make sure to run it in order!

-- =====================================================
-- 1. CREATE ENUM TYPES
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Profiles table with detailed user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  nid_number TEXT,
  designation TEXT,
  department TEXT,
  office_name TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  employee_id TEXT,
  grade TEXT,
  current_position TEXT,
  joining_date DATE,
  id_proof_url TEXT,
  passport_photo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Office information table with UTF-8 support for Bengali text
CREATE TABLE public.office_information (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ministry TEXT NOT NULL,
  directorate TEXT NOT NULL,
  identity_number TEXT,
  nid TEXT NOT NULL,
  tin TEXT,
  birth_place TEXT NOT NULL,
  village TEXT NOT NULL,
  upazila TEXT NOT NULL,
  district TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to protect verification fields
CREATE OR REPLACE FUNCTION public.protect_verification_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can modify is_verified or verified_at
  IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified OR NEW.verified_at IS DISTINCT FROM OLD.verified_at) THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only administrators can modify verification status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to protect status field
CREATE OR REPLACE FUNCTION public.protect_status_field()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can modify status
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only administrators can modify status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update updated_at on office_information
CREATE TRIGGER update_office_information_updated_at
  BEFORE UPDATE ON public.office_information
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to protect verification fields
CREATE TRIGGER protect_verification_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_verification_fields();

-- Trigger to protect status field
CREATE TRIGGER protect_status_trigger
  BEFORE UPDATE ON public.office_information
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_status_field();

-- =====================================================
-- 6. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_office_information_user_id ON public.office_information(user_id);

-- =====================================================
-- 7. CREATE RLS POLICIES - PROFILES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile, admins can update any
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 8. CREATE RLS POLICIES - OFFICE INFORMATION
-- =====================================================

CREATE POLICY "Users can view their own office information" 
  ON public.office_information 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own office information" 
  ON public.office_information 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update office information" 
  ON public.office_information 
  FOR UPDATE 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own office information" 
  ON public.office_information 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 9. CREATE RLS POLICIES - USER ROLES
-- =====================================================

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 10. CREATE STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('id-proofs', 'id-proofs', false),
  ('passport-photos', 'passport-photos', false);

-- =====================================================
-- 11. CREATE STORAGE POLICIES - ID PROOFS
-- =====================================================

CREATE POLICY "Users can upload their own ID proof"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'id-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own ID proof"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'id-proofs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own ID proof"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'id-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own ID proof"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'id-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 12. CREATE STORAGE POLICIES - PASSPORT PHOTOS
-- =====================================================

CREATE POLICY "Users can upload their own passport photo"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'passport-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own passport photo"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'passport-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own passport photo"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'passport-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own passport photo"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'passport-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Update your frontend environment variables:
--    - VITE_SUPABASE_URL=your_new_supabase_url
--    - VITE_SUPABASE_PUBLISHABLE_KEY=your_new_anon_key
-- 2. Export your data from the current database
-- 3. Import your data into the new database
-- 4. Configure Auth settings in Supabase dashboard:
--    - Enable Email provider
--    - Disable email confirmation for testing
--    - Set Site URL and Redirect URLs
-- =====================================================