-- Migration: create educational_qualifications table


create table if not exists public.educational_qualifications (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  degree_title text,
  institution_name text,
  board_university text,
  subject text,
  passing_year integer,
  result_division text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to update updated_at
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.educational_qualifications;
create trigger set_timestamp
  before update on public.educational_qualifications
  for each row execute function public.trigger_set_timestamp();
