-- =============================================
-- ApiStore — Supabase Database Schema
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ───────────────────────────────────
create table public.users (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null unique,
  password    text not null,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- ─── PRODUCTS ────────────────────────────────
create table public.products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text not null,
  category    text not null,
  base_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── PACKAGES ────────────────────────────────
create table public.packages (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products(id) on delete cascade,
  name          text not null,
  price         integer not null,        -- dalam rupiah
  quota         integer not null,        -- jumlah request
  duration_days integer,                 -- null = tidak ada expired
  created_at    timestamptz not null default now()
);

-- ─── ORDERS ──────────────────────────────────
create table public.orders (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  package_id  uuid not null references public.packages(id),
  product_id  uuid not null references public.products(id),
  status      text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  total_price integer not null,
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ─── API KEYS ─────────────────────────────────
create table public.api_keys (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  order_id    uuid references public.orders(id),
  key         text not null unique,
  name        text,
  description text,
  quota_total integer not null default 1000,
  quota_used  integer not null default 0,
  is_active   boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- ─── USAGE LOGS ──────────────────────────────
create table public.usage_logs (
  id          uuid primary key default uuid_generate_v4(),
  api_key_id  uuid not null references public.api_keys(id) on delete cascade,
  endpoint    text,
  status_code integer,
  ip_address  text,
  created_at  timestamptz not null default now()
);

-- ─── FUNCTION: increment quota_used ──────────
create or replace function increment_api_key_usage(key_id uuid)
returns void as $$
  update public.api_keys
  set quota_used = quota_used + 1
  where id = key_id;
$$ language sql;

-- ─── INDEXES ──────────────────────────────────
create index on public.orders (user_id);
create index on public.orders (status);
create index on public.api_keys (user_id);
create index on public.api_keys (key);
create index on public.usage_logs (api_key_id);

-- ─── ADMIN USER (ganti email & password hash) ─
-- Password default: Admin@12345
-- Hash ini hanya contoh, generate ulang dengan bcrypt
-- insert into public.users (name, email, password, role)
-- values (
--   'Admin',
--   'admin@apistore.com',
--   '$2a$12$GANTI_DENGAN_HASH_BCRYPT_KAMU',
--   'admin'
-- );
