-- Club Unique · Check-in de presença
-- Execute no SQL Editor do projeto: https://msaypacojvayckmetlie.supabase.co

create table if not exists public.presence_confirmations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  company text not null,
  edition text not null default '2026-10-24',
  created_at timestamptz not null default now()
);

create index if not exists presence_confirmations_edition_idx
  on public.presence_confirmations (edition);

create index if not exists presence_confirmations_created_at_idx
  on public.presence_confirmations (created_at desc);

alter table public.presence_confirmations
  add column if not exists terms_accepted_at timestamptz;

alter table public.presence_confirmations
  alter column edition set default '2026-10-24';

alter table public.presence_confirmations enable row level security;

drop policy if exists "Allow anonymous insert" on public.presence_confirmations;
create policy "Allow anonymous insert"
  on public.presence_confirmations
  for insert
  to anon
  with check (true);

drop policy if exists "Allow authenticated read" on public.presence_confirmations;
create policy "Allow authenticated read"
  on public.presence_confirmations
  for select
  to authenticated
  using (true);

drop policy if exists "Allow anonymous read" on public.presence_confirmations;
create policy "Allow anonymous read"
  on public.presence_confirmations
  for select
  to anon
  using (true);

-- Depois de rodar este SQL:
-- 1. Copie a anon key do projeto para js/supabase-config.js
