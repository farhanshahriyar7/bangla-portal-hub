-- Create office_information table with proper UTF-8 support for Bengali text
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.office_information ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own office information" 
ON public.office_information 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own office information" 
ON public.office_information 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own office information" 
ON public.office_information 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own office information" 
ON public.office_information 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_office_information_updated_at
BEFORE UPDATE ON public.office_information
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better query performance
CREATE INDEX idx_office_information_user_id ON public.office_information(user_id);