-- migration: create uploaded_files table
-- This migration creates a simple table to track uploaded files in Supabase Storage.

-- Enable pgcrypto for gen_random_uuid (Supabase typically has this available)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.uploaded_files (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name text NOT NULL,
	path text NOT NULL,
	bucket text NOT NULL DEFAULT 'uploads',
	size bigint NOT NULL,
	content_type text,
	metadata jsonb,
	uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS uploaded_files_uploaded_at_idx ON public.uploaded_files (uploaded_at DESC);
