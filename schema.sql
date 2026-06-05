-- AirDosa Database Schema Setup SQL
-- Paste this script directly into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Create the 'todos' table to store drone flight logs
create table if not exists public.todos (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamp with time zone not null default now()
);

-- 2. Enable Row-Level Security (RLS) on the table (Critical Security Best Practice)
alter table public.todos enable row level security;

-- 3. Create RLS Policy: Users can only view their own flight logs
create policy "Users can view their own flights"
  on public.todos
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- 4. Create RLS Policy: Users can only insert their own flight logs
create policy "Users can insert their own flights"
  on public.todos
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

-- 5. Create RLS Policy: Users can only update their own flight logs
create policy "Users can update their own flights"
  on public.todos
  for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

-- 6. Create RLS Policy: Users can only delete their own flight logs
create policy "Users can delete their own flights"
  on public.todos
  for delete
  to authenticated
  using ( (select auth.uid()) = user_id );

-- 7. Add an index on 'user_id' to optimize query speeds (Performance Best Practice)
create index if not exists idx_todos_user_id on public.todos (user_id);
