-- Create general_information table

CREATE TABLE IF NOT EXISTS public.general_information (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  father_name text,
  mother_name text,
  office_address text,
  blood_group text,
  current_position_joining_date date,
  correction_date date,
  special_case boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure user_id references profiles(id) if profiles table exists
ALTER TABLE public.general_information
  ADD CONSTRAINT fk_general_information_user
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Index for quick lookup by user_id
CREATE INDEX IF NOT EXISTS idx_general_information_user_id ON public.general_information(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_general_information ON public.general_information;
CREATE TRIGGER trg_touch_general_information
BEFORE UPDATE ON public.general_information
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
