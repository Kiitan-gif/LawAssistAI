-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

-- Profiles: one row per signed-up user (lawyer or client)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('lawyer', 'client')),
  practice_area text,
  years_experience int,
  state text,
  rate text,
  bio text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Reviews: clients leave written reviews on lawyers
create table reviews (
  id bigint generated always as identity primary key,
  lawyer_id uuid references profiles(id) on delete cascade,
  client_id uuid references profiles(id) on delete cascade,
  client_name text not null,
  comment text not null,
  created_at timestamp with time zone default now()
);

alter table reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select using (true);

create policy "Clients can insert reviews"
  on reviews for insert with check (auth.uid() = client_id);

-- Matters: cases/matters tracked per client, optionally assigned to a lawyer
create table matters (
  id bigint generated always as identity primary key,
  client_id uuid references profiles(id) on delete cascade,
  lawyer_id uuid references profiles(id) on delete set null,
  title text not null,
  status text not null default 'Open',
  stage text not null default 'Just created',
  due_date text,
  created_at timestamp with time zone default now()
);

alter table matters enable row level security;

create policy "Clients can view their own matters"
  on matters for select using (auth.uid() = client_id or auth.uid() = lawyer_id);

create policy "Clients can insert their own matters"
  on matters for insert with check (auth.uid() = client_id);

-- Compliance items: reminders tracked per user (client or lawyer/business)
create table compliance_items (
  id bigint generated always as identity primary key,
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Annual Returns', 'Tax Obligations', 'License Renewals', 'Regulatory Filings', 'Corporate Governance', 'Other')),
  due_date text,
  status text not null default 'On track',
  created_at timestamp with time zone default now()
);

alter table compliance_items enable row level security;

create policy "Users can view their own compliance items"
  on compliance_items for select using (auth.uid() = owner_id);

create policy "Users can insert their own compliance items"
  on compliance_items for insert with check (auth.uid() = owner_id);

create policy "Users can update their own compliance items"
  on compliance_items for update using (auth.uid() = owner_id);

create policy "Users can delete their own compliance items"
  on compliance_items for delete using (auth.uid() = owner_id);

