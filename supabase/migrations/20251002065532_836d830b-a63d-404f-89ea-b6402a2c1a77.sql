-- Create profiles table with detailed user information
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
  id_proof_url TEXT,
  passport_photo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- Users can update their own profile (but not is_verified field)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create storage bucket for ID proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-proofs', 'id-proofs', false);

-- Create storage bucket for passport photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('passport-photos', 'passport-photos', false);

-- Storage policies for ID proofs
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

-- Storage policies for passport photos
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();