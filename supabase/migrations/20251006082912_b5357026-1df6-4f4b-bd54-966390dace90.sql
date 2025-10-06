-- First, update any invalid status values to 'pending'
UPDATE public.office_information 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'active', 'rejected');

-- Drop the existing check constraint
ALTER TABLE public.office_information DROP CONSTRAINT IF EXISTS office_information_status_check;

-- Add updated check constraint with 'rejected' status
ALTER TABLE public.office_information ADD CONSTRAINT office_information_status_check 
CHECK (status IN ('pending', 'active', 'rejected'));