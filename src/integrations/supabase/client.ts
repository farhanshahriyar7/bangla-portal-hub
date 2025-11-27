// Supabase client singleton (HMR-safe).
// This file exports a single Supabase client instance and guards against
// multiple instantiations during HMR or repeated imports.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

declare global {
  interface Window {
    __SUPABASE_CLIENT__?: unknown;
  }
}

const globalRef: any = typeof window !== 'undefined' ? window : globalThis;

if (!globalRef.__SUPABASE_CLIENT__) {
  globalRef.__SUPABASE_CLIENT__ = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Export the singleton client. Cast to unknown to avoid TypeScript issues
// with ReturnType of a generic factory; consumers import the typed client.
export const supabase = globalRef.__SUPABASE_CLIENT__ as unknown as ReturnType<typeof createClient>;
