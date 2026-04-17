create table if not exists companions (
  id text primary key,
  name text not null,
  persona text not null,
  style_prompt text not null,
  signature text not null,
  badge_color text not null
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  holdings text[] not null default '{}',
  sectors text[] not null default '{}',
  companion_id text references companions(id),
  created_at timestamptz not null default now()
);

create table if not exists feed_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  companion_id text references companions(id),
  content text not null,
  tone_tag text,
  created_at timestamptz not null default now()
);
