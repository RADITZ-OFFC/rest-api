-- =============================================
-- Migration v3 — Role Premium & Super Premium
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. Update constraint role di tabel users
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'premium', 'super_premium', 'admin'));

-- 2. Buat tabel plan_orders (upgrade request)
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

-- 3. Index
CREATE INDEX IF NOT EXISTS plan_orders_user_id_idx ON public.plan_orders(user_id);
CREATE INDEX IF NOT EXISTS plan_orders_status_idx  ON public.plan_orders(status);
