-- Create children_information table
CREATE TABLE public.children_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  marital_status TEXT NOT NULL,
  special_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.children_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own children information"
  ON public.children_information
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children information"
  ON public.children_information
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children information"
  ON public.children_information
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children information"
  ON public.children_information
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_children_information_updated_at
  BEFORE UPDATE ON public.children_information
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
