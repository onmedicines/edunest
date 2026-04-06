-- Study Room — Supabase Schema
-- Run this in the Supabase Dashboard → SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Rooms ──────────────────────────────────────────────────────────────────
create table if not exists rooms (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  code        text not null unique,
  created_by  uuid references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  is_public   boolean not null default true
);

-- ── Messages ───────────────────────────────────────────────────────────────
create table if not exists messages (
  id         uuid primary key default uuid_generate_v4(),
  room_id    uuid not null references rooms(id) on delete cascade,
  user_id    uuid not null,
  username   text not null,
  content    text not null,
  created_at timestamptz not null default now(),
  reactions  jsonb not null default '{}'::jsonb
);

create index if not exists messages_room_id_created_at
  on messages (room_id, created_at);

-- ── Notes ──────────────────────────────────────────────────────────────────
create table if not exists notes (
  id         uuid primary key default uuid_generate_v4(),
  room_id    uuid not null unique references rooms(id) on delete cascade,
  content    text not null default '',
  updated_by uuid,
  updated_at timestamptz not null default now()
);

-- ── Resources ──────────────────────────────────────────────────────────────
create table if not exists resources (
  id             uuid primary key default uuid_generate_v4(),
  room_id        uuid not null references rooms(id) on delete cascade,
  url            text not null,
  title          text not null,
  resource_type  text not null default 'link',
  added_by       uuid not null,
  added_username text not null default '',
  added_at       timestamptz not null default now()
);

create index if not exists resources_room_id on resources (room_id);

-- ── Room State (timer + video) ─────────────────────────────────────────────
create table if not exists room_state (
  room_id          uuid primary key references rooms(id) on delete cascade,
  timer_started_at timestamptz,
  timer_duration   int not null default 1500,
  timer_is_running boolean not null default false,
  timer_remaining  int not null default 1500,
  video_id         text,
  video_is_playing boolean not null default false,
  video_time       float not null default 0
);

-- ── Todos ──────────────────────────────────────────────────────────────────
create table if not exists todos (
  id             uuid primary key default uuid_generate_v4(),
  room_id        uuid not null references rooms(id) on delete cascade,
  content        text not null,
  is_done        boolean not null default false,
  added_by       uuid not null,
  added_username text not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists todos_room_id on todos (room_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Allow authenticated users to read/write everything (simple setup for MVP)
-- You can tighten these policies later.

alter table rooms enable row level security;
alter table messages enable row level security;
alter table notes enable row level security;
alter table resources enable row level security;
alter table room_state enable row level security;
alter table todos enable row level security;

-- Rooms: anyone authenticated can read; authenticated users can insert
create policy "rooms_select" on rooms for select to authenticated using (true);
create policy "rooms_insert" on rooms for insert to authenticated with check (auth.uid() = created_by);
create policy "rooms_update" on rooms for update to authenticated using (auth.uid() = created_by);

-- Messages: anyone authenticated can read/insert
create policy "messages_select" on messages for select to authenticated using (true);
create policy "messages_insert" on messages for insert to authenticated with check (auth.uid() = user_id);
create policy "messages_update" on messages for update to authenticated using (true);

-- Notes: anyone in a room can read/write
create policy "notes_select" on notes for select to authenticated using (true);
create policy "notes_insert" on notes for insert to authenticated with check (true);
create policy "notes_update" on notes for update to authenticated using (true);

-- Resources: anyone authenticated can read/insert/delete
create policy "resources_select" on resources for select to authenticated using (true);
create policy "resources_insert" on resources for insert to authenticated with check (auth.uid() = added_by);
create policy "resources_delete" on resources for delete to authenticated using (true);

-- Room state: anyone authenticated can read/insert/update
create policy "room_state_select" on room_state for select to authenticated using (true);
create policy "room_state_insert" on room_state for insert to authenticated with check (true);
create policy "room_state_update" on room_state for update to authenticated using (true);

-- Todos: anyone authenticated can read/insert/update/delete
create policy "todos_select" on todos for select to authenticated using (true);
create policy "todos_insert" on todos for insert to authenticated with check (auth.uid() = added_by);
create policy "todos_update" on todos for update to authenticated using (true);
create policy "todos_delete" on todos for delete to authenticated using (true);

-- ── Enable Realtime ────────────────────────────────────────────────────────
-- In Supabase Dashboard → Database → Replication, enable these tables:
-- messages, notes, resources, room_state, todos
-- OR run:
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    messages, notes, resources, room_state, todos;
commit;
