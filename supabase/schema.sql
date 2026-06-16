-- ============================================
-- StyleMatch Database Schema + RLS + Triggers
-- Run this entire file in the Supabase SQL Editor (once per project)
-- ============================================

-- Enable necessary extensions (usually already on)
create extension if not exists "uuid-ossp";

-- =====================
-- TABLES
-- =====================

-- Core users table (1 row per auth user). Points and subscription live here.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  points_balance integer not null default 0,
  subscription_status text not null default 'free', -- 'free' | 'active'
  created_at timestamptz not null default now()
);

-- Every time someone studies a creator (generation performed)
create table if not exists public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  watcher_id uuid not null references public.users(id) on delete cascade,
  creator_handle text not null,
  topic text not null,
  generated_posts jsonb not null,   -- array of strings
  created_at timestamptz not null default now()
);

-- Silent log of every study action (used by creator dashboard)
create table if not exists public.watcher_log (
  id uuid primary key default uuid_generate_v4(),
  watcher_id uuid not null references public.users(id) on delete cascade,
  creator_handle text not null,
  timestamp timestamptz not null default now()
);

-- Record of all money movements (top-ups and subscriptions)
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('topup', 'subscription')),
  amount integer not null,                    -- cents for money, or points for topup type
  stripe_payment_id text,
  created_at timestamptz not null default now()
);

-- =====================
-- INDEXES (performance)
-- =====================
create index if not exists idx_study_sessions_watcher on public.study_sessions(watcher_id);
create index if not exists idx_watcher_log_handle on public.watcher_log(creator_handle);
create index if not exists idx_watcher_log_watcher on public.watcher_log(watcher_id);
create index if not exists idx_transactions_user on public.transactions(user_id);

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

alter table public.users enable row level security;
alter table public.study_sessions enable row level security;
alter table public.watcher_log enable row level security;
alter table public.transactions enable row level security;

-- Users can read/update only their own user row
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile (points etc managed server-side)"
  on public.users for update
  using (auth.uid() = id);

-- Study sessions: users can only see their own generations
create policy "Users can view own study sessions"
  on public.study_sessions for select
  using (auth.uid() = watcher_id);

create policy "Users can insert own study sessions"
  on public.study_sessions for insert
  with check (auth.uid() = watcher_id);

-- Watcher log: only the watcher can see their own logs (creators see via server with service role)
create policy "Users can view own watcher logs"
  on public.watcher_log for select
  using (auth.uid() = watcher_id);

create policy "Users can insert own watcher logs"
  on public.watcher_log for insert
  with check (auth.uid() = watcher_id);

-- Transactions: only the owner
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Service can insert transactions"
  on public.transactions for insert
  with check (true);   -- We'll use service role from API routes

-- =====================
-- TRIGGER: Auto-create public.users row + give 5 points on signup
-- =====================

-- Function that runs when a new user is created in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, points_balance, subscription_status)
  values (new.id, new.email, 5, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Attach the trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- HELPER (optional but useful): function to atomically deduct points
-- =====================

create or replace function public.deduct_points(user_id uuid, points_to_deduct int)
returns boolean
language plpgsql
security definer
as $$
declare
  current_balance int;
begin
  select points_balance into current_balance
  from public.users
  where id = user_id
  for update;   -- lock the row

  if current_balance is null or current_balance < points_to_deduct then
    return false;
  end if;

  update public.users
  set points_balance = points_balance - points_to_deduct
  where id = user_id;

  return true;
end;
$$;

-- Grant execute to authenticated (we will mostly call via service role from server anyway)
grant execute on function public.deduct_points(uuid, int) to authenticated;

-- =====================
-- DONE
-- After running this, go to Authentication > Providers and enable Email + Password.
-- Recommended for MVP testing: turn OFF "Enable email confirmations" temporarily.
-- ============================================
