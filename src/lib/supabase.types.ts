import type { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define utility types
type Tables = Database['public']['Tables'];
type TablesNames = keyof Tables;

// Type for select query with related tables
export type RelationalQuery<T extends TablesNames, R extends TablesNames[]> = {
  [P in T]: Tables[P]['Row'] & {
    [K in R[number]]: Tables[K]['Row'][];
  };
};

// Typed client helper
export type TypedSupabaseClient = SupabaseClient<Database>;

// Type for query result with relations
export type WithRelations<T extends TablesNames> = Tables[T]['Row'] & {
  [K in TablesNames]?: Tables[K]['Row'][];
};