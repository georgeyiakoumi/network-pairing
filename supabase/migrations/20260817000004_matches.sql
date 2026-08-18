-- ─────────────────────────────────────────────────────────────
-- Migration: matches and match_ratings tables
-- ─────────────────────────────────────────────────────────────

create table public.matches (
  id            uuid primary key default gen_random_uuid(),
  profile_a_id  uuid not null references public.profiles(id) on delete cascade,
  profile_b_id  uuid not null references public.profiles(id) on delete cascade,
  match_score   numeric(4,2),
  match_reason  text,
  status        text not null default 'pending'
                  check (status in ('pending', 'accepted', 'rejected')),
  created_at    timestamptz not null default now(),
  -- prevent duplicate match pairs
  constraint no_duplicate_matches unique (profile_a_id, profile_b_id),
  -- prevent self-matching
  constraint no_self_match check (profile_a_id != profile_b_id)
);

create index matches_profile_a_idx on public.matches(profile_a_id);
create index matches_profile_b_idx on public.matches(profile_b_id);
create index matches_status_idx on public.matches(status);

create table public.match_ratings (
  id                    uuid primary key default gen_random_uuid(),
  match_id              uuid not null references public.matches(id) on delete cascade,
  rated_by_profile_id   uuid not null references public.profiles(id) on delete cascade,
  rating                smallint not null check (rating >= 1 and rating <= 5),
  created_at            timestamptz not null default now(),
  -- one rating per user per match
  unique (match_id, rated_by_profile_id)
);

create index match_ratings_match_idx on public.match_ratings(match_id);

-- RLS
alter table public.matches enable row level security;
alter table public.match_ratings enable row level security;

-- users can see matches they're part of
create policy "Users can read own matches"
  on public.matches for select to authenticated
  using (
    profile_a_id in (select id from public.profiles where user_id = auth.uid()) or
    profile_b_id in (select id from public.profiles where user_id = auth.uid())
  );

-- only the server (service role) can insert matches — AI generates them
create policy "Service role can insert matches"
  on public.matches for insert to service_role with check (true);

-- users can update status on their own matches (accept/reject)
create policy "Users can update own match status"
  on public.matches for update to authenticated
  using (profile_a_id in (select id from public.profiles where user_id = auth.uid()));

-- users can rate matches they're part of
create policy "Users can read match_ratings"
  on public.match_ratings for select to authenticated
  using (
    match_id in (
      select id from public.matches where
        profile_a_id in (select id from public.profiles where user_id = auth.uid()) or
        profile_b_id in (select id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Users can insert own match_ratings"
  on public.match_ratings for insert to authenticated
  with check (
    rated_by_profile_id in (select id from public.profiles where user_id = auth.uid())
  );
