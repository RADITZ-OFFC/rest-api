-- =============================================
-- ApiStore — Complete Database Setup
-- Jalankan seluruh file ini di Supabase SQL Editor
-- =============================================



-- ═══════════════════════════════════════════
-- SCHEMA (v1) — Tabel utama
-- ═══════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────
CREATE TABLE public.users (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null unique,
  password    text not null,
  role        text not null default 'user' check (role in ('user', 'premium', 'super_premium', 'admin')),
  created_at  timestamptz not null default now()
);

-- ─── PRODUCTS ────────────────────────────────
CREATE TABLE public.products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text not null,
  category    text not null,
  base_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── PACKAGES ────────────────────────────────
CREATE TABLE public.packages (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products(id) on delete cascade,
  name          text not null,
  price         integer not null,        -- dalam rupiah
  quota         integer not null,        -- jumlah request
  duration_days integer,                 -- null = tidak ada expired
  created_at    timestamptz not null default now()
);

-- ─── ORDERS ──────────────────────────────────
CREATE TABLE public.orders (
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
CREATE TABLE public.api_keys (
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
CREATE TABLE public.usage_logs (
  id          uuid primary key default uuid_generate_v4(),
  api_key_id  uuid not null references public.api_keys(id) on delete cascade,
  endpoint    text,
  status_code integer,
  ip_address  text,
  created_at  timestamptz not null default now()
);



-- ═══════════════════════════════════════════
-- MIGRATION v3 — Tabel plan_orders (upgrade plan)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.plan_orders (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  plan          text not null check (plan IN ('premium', 'super_premium')),
  status        text not null default 'pending' check (status IN ('pending', 'approved', 'rejected')),
  price         integer not null,   -- harga dalam rupiah
  note          text,               -- catatan dari user (opsional)
  processed_by  uuid references public.users(id),
  processed_at  timestamptz,
  created_at    timestamptz not null default now()
);



-- ═══════════════════════════════════════════
-- MIGRATION v4 — Tabel payments (QRIS payment)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payments (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid references public.orders(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  qris_id     text,
  qrcode_url  text,
  amount      integer not null,
  status      text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'failed')),
  expired_at  timestamptz,
  paid_at     timestamptz,
  raw_response jsonb,
  created_at  timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);



-- ═══════════════════════════════════════════
-- FUNCTION & INDEXES
-- ═══════════════════════════════════════════

-- Function: increment quota_used saat API digunakan
CREATE OR REPLACE FUNCTION increment_api_key_usage(key_id uuid)
RETURNS void AS $$
  UPDATE public.api_keys
  SET quota_used = quota_used + 1
  WHERE id = key_id;
$$ LANGUAGE sql;

-- Indexes untuk performa query
CREATE INDEX ON public.orders (user_id);
CREATE INDEX ON public.orders (status);
CREATE INDEX ON public.api_keys (user_id);
CREATE INDEX ON public.api_keys (key);
CREATE INDEX ON public.usage_logs (api_key_id);
CREATE INDEX IF NOT EXISTS plan_orders_user_id_idx ON public.plan_orders(user_id);
CREATE INDEX IF NOT EXISTS plan_orders_status_idx  ON public.plan_orders(status);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);



-- ═══════════════════════════════════════════
-- ADMIN USER (opsional)
-- ═══════════════════════════════════════════
-- Uncomment dan isi hash bcrypt kamu, atau buat via register lalu update role manual:
-- UPDATE public.users SET role = 'admin' WHERE email = 'email-kamu@example.com';

-- insert into public.users (name, email, password, role)
-- values (
--   'Admin',
--   'admin@apistore.com',
--   '$2a$12$GANTI_DENGAN_HASH_BCRYPT_KAMU',
--   'admin'
-- );
