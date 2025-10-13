-- Create enum for user roles
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS policies for user_roles table
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
  on public.user_roles for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
  on public.user_roles for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Create trigger function to protect is_verified field
create or replace function public.protect_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only admins can modify is_verified or verified_at
  if (NEW.is_verified is distinct from OLD.is_verified OR NEW.verified_at is distinct from OLD.verified_at) then
    if not public.has_role(auth.uid(), 'admin') then
      raise exception 'Only administrators can modify verification status';
    end if;
  end if;
  return NEW;
end;
$$;

-- Create trigger function to protect status field
create or replace function public.protect_status_field()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only admins can modify status
  if NEW.status is distinct from OLD.status then
    if not public.has_role(auth.uid(), 'admin') then
      raise exception 'Only administrators can modify status';
    end if;
  end if;
  return NEW;
end;
$$;

-- Update profiles table policies
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

create trigger protect_verification_trigger
  before update on public.profiles
  for each row
  execute function public.protect_verification_fields();

-- Update office_information policies
drop policy if exists "Users can update their own office information" on public.office_information;

create policy "Users can update office information"
  on public.office_information for update
  using (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

create trigger protect_status_trigger
  before update on public.office_information
  for each row
  execute function public.protect_status_field();

-- Add storage UPDATE and DELETE policies for passport-photos bucket
create policy "Users can update their own passport photo"
  on storage.objects for update
  using (
    bucket_id = 'passport-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own passport photo"
  on storage.objects for delete
  using (
    bucket_id = 'passport-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add storage UPDATE and DELETE policies for id-proofs bucket
create policy "Users can update their own ID proof"
  on storage.objects for update
  using (
    bucket_id = 'id-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own ID proof"
  on storage.objects for delete
  using (
    bucket_id = 'id-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );