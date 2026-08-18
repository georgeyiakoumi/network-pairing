-- ─────────────────────────────────────────────────────────────
-- Migration: profiles table
-- ─────────────────────────────────────────────────────────────

create table public.profiles (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null unique references auth.users(id) on delete cascade,
  first_name                text not null,
  last_name                 text not null,
  avatar_url                text,
  graduation_year           integer check (graduation_year >= 1960 and graduation_year <= 2030),
  location_id               uuid references public.locations(id),
  primary_profession_id     uuid not null references public.professions(id),
  primary_experience        smallint not null check (primary_experience >= 1 and primary_experience <= 5),
  secondary_profession_id   uuid references public.professions(id),
  secondary_experience      smallint check (secondary_experience >= 1 and secondary_experience <= 5),
  intake_method             text not null check (intake_method in ('direct', 'guided')),
  intake_transcript         jsonb,
  open_to_connect           boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  -- if secondary profession set, experience must also be set
  constraint secondary_experience_required check (
    secondary_profession_id is null or secondary_experience is not null
  )
);

-- index for common query patterns
create index profiles_user_id_idx on public.profiles(user_id);
create index profiles_primary_profession_idx on public.profiles(primary_profession_id);
create index profiles_open_to_connect_idx on public.profiles(open_to_connect) where open_to_connect = true;

-- auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.profiles enable row level security;

-- users can read any active profile (needed for matching)
create policy "Authenticated users can read profiles"
  on public.profiles for select to authenticated using (true);

-- users can only insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = user_id);

-- users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = user_id);
