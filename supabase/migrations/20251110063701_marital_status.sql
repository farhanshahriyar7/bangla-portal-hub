-- Create marital_information table
CREATE TABLE IF NOT EXISTS public.marital_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marital_status TEXT NOT NULL CHECK (marital_status IN ('married', 'unmarried', 'widow', 'divorced', 'widower')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create spouse_information table
CREATE TABLE IF NOT EXISTS public.spouse_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marital_info_id UUID NOT NULL REFERENCES public.marital_information(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occupation TEXT,
  nid TEXT,
  tin TEXT,
  district TEXT,
  employee_id TEXT,
  designation TEXT,
  office_address TEXT,
  office_phone TEXT,
  business_name TEXT,
  business_type TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_reg_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.marital_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spouse_information ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marital_information
CREATE POLICY "Users can view own marital info"
  ON public.marital_information FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marital info"
  ON public.marital_information FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marital info"
  ON public.marital_information FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own marital info"
  ON public.marital_information FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for spouse_information
CREATE POLICY "Users can view own spouse info"
  ON public.spouse_information FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spouse info"
  ON public.spouse_information FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spouse info"
  ON public.spouse_information FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spouse info"
  ON public.spouse_information FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_marital_information_updated_at
  BEFORE UPDATE ON public.marital_information
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_spouse_information_updated_at
  BEFORE UPDATE ON public.spouse_information
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
