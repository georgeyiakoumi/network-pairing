-- ─────────────────────────────────────────────────────────────
-- Migration: junction tables (profile_offers, profile_needs)
-- ─────────────────────────────────────────────────────────────

create table public.profile_offers (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  offer_id   uuid not null references public.offers(id) on delete cascade,
  primary key (profile_id, offer_id)
);

create table public.profile_needs (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  need_id    uuid not null references public.needs(id) on delete cascade,
  primary key (profile_id, need_id)
);

-- indexes for matching queries
create index profile_offers_offer_idx on public.profile_offers(offer_id);
create index profile_needs_need_idx on public.profile_needs(need_id);

-- RLS
alter table public.profile_offers enable row level security;
alter table public.profile_needs enable row level security;

create policy "Authenticated users can read profile_offers"
  on public.profile_offers for select to authenticated using (true);

create policy "Users can manage own profile_offers"
  on public.profile_offers for all to authenticated
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

create policy "Authenticated users can read profile_needs"
  on public.profile_needs for select to authenticated using (true);

create policy "Users can manage own profile_needs"
  on public.profile_needs for all to authenticated
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));
