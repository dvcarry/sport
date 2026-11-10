-- Run in the Supabase SQL Editor. Enable Authentication > Providers > Anonymous sign-ins.
create table if not exists public.training_diaries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.training_diaries enable row level security;
revoke all on public.training_diaries from anon;
grant select, insert, update, delete on public.training_diaries to authenticated;
create policy "Users read own diary" on public.training_diaries for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own diary" on public.training_diaries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own diary" on public.training_diaries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own diary" on public.training_diaries for delete to authenticated using ((select auth.uid()) = user_id);

