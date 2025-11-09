import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Fail fast in development if env vars are missing
  // eslint-disable-next-line no-console
  console.warn('Supabase environment variables are not set. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default supabase
