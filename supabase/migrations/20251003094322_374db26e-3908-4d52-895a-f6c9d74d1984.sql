-- Add employee_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employee_id TEXT;