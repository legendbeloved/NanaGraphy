-- NanaGraphy Supabase (PostgreSQL) migration
-- Tables: categories, posts, portfolio_items, bookings, newsletter_subscribers
-- RLS: public read where applicable, admin-only write, public booking/newsletter insert
-- Utilities: booking reference generator, updated_at trigger, indexes

begin;

-- Extensions (gen_random_uuid)
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Admin check (expects Supabase Auth JWT app_metadata.role = 'admin')
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$
;

-- Auto-updated timestamp trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as
$$
begin
  new.updated_at = now();
  return new;
end;
$$
;

-- Booking reference generator: 'NG-' + random 6-char uppercase alphanumeric
create or replace function public.nanography_ref()
returns text
language plpgsql
volatile
as
$$
declare
  alphabet text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  out_text text := 'NG-';
  i int;
  idx int;
begin
  for i in 1..6 loop
    idx := floor(random() * length(alphabet))::int + 1;
    out_text := out_text || substr(alphabet, idx, 1);
  end loop;
  return out_text;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- 2) categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_categories_set_updated_at on public.categories;
create trigger trg_categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- 1) posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null,
  excerpt text,
  cover_image text,
  cover_image_alt text,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  read_time_minutes integer,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  seo_title text,
  seo_description text,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

drop trigger if exists trg_posts_set_updated_at on public.posts;
create trigger trg_posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- 3) portfolio_items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  images text[] not null default '{}'::text[],
  image_alts text[] not null default '{}'::text[],
  category text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

drop trigger if exists trg_portfolio_items_set_updated_at on public.portfolio_items;
create trigger trg_portfolio_items_set_updated_at
before update on public.portfolio_items
for each row execute function public.set_updated_at();

-- 4) bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  phone text,
  service_type text,
  preferred_date date,
  preferred_time text,
  location_preference text,
  vision_description text,
  budget_range text,
  style_tags text[] not null default '{}'::text[],
  additional_notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  booking_reference text not null unique default public.nanography_ref(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_bookings_set_updated_at on public.bookings;
create trigger trg_bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

-- 5) newsletter_subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Indexes (requested)
-- ---------------------------------------------------------------------------

-- posts
create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_posts_status on public.posts (status);
create index if not exists idx_posts_published_at on public.posts (published_at);

-- bookings
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_email on public.bookings (email);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.bookings enable row level security;
alter table public.newsletter_subscribers enable row level security;

alter table public.categories force row level security;
alter table public.posts force row level security;
alter table public.portfolio_items force row level security;
alter table public.bookings force row level security;
alter table public.newsletter_subscribers force row level security;

-- ---- categories policies ----
drop policy if exists categories_public_select on public.categories;
create policy categories_public_select
on public.categories
for select
to public
using (true);

drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert
on public.categories
for insert
to authenticated
with check (public.is_admin());

drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update
on public.categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete
on public.categories
for delete
to authenticated
using (public.is_admin());

-- ---- posts policies ----
drop policy if exists posts_public_select_published on public.posts;
create policy posts_public_select_published
on public.posts
for select
to public
using (status = 'published' and deleted_at is null);

drop policy if exists posts_admin_insert on public.posts;
create policy posts_admin_insert
on public.posts
for insert
to authenticated
with check (public.is_admin());

drop policy if exists posts_admin_update on public.posts;
create policy posts_admin_update
on public.posts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists posts_admin_delete on public.posts;
create policy posts_admin_delete
on public.posts
for delete
to authenticated
using (public.is_admin());

-- ---- portfolio_items policies ----
drop policy if exists portfolio_public_select on public.portfolio_items;
create policy portfolio_public_select
on public.portfolio_items
for select
to public
using (deleted_at is null);

drop policy if exists portfolio_admin_insert on public.portfolio_items;
create policy portfolio_admin_insert
on public.portfolio_items
for insert
to authenticated
with check (public.is_admin());

drop policy if exists portfolio_admin_update on public.portfolio_items;
create policy portfolio_admin_update
on public.portfolio_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists portfolio_admin_delete on public.portfolio_items;
create policy portfolio_admin_delete
on public.portfolio_items
for delete
to authenticated
using (public.is_admin());

-- ---- bookings policies ----
drop policy if exists bookings_public_insert on public.bookings;
create policy bookings_public_insert
on public.bookings
for insert
to public
with check (true);

drop policy if exists bookings_admin_select on public.bookings;
create policy bookings_admin_select
on public.bookings
for select
to authenticated
using (public.is_admin());

drop policy if exists bookings_admin_update on public.bookings;
create policy bookings_admin_update
on public.bookings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---- newsletter_subscribers policies ----
drop policy if exists newsletter_public_insert on public.newsletter_subscribers;
create policy newsletter_public_insert
on public.newsletter_subscribers
for insert
to public
with check (true);

drop policy if exists newsletter_admin_select on public.newsletter_subscribers;
create policy newsletter_admin_select
on public.newsletter_subscribers
for select
to authenticated
using (public.is_admin());

commit;