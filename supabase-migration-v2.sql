-- =============================================
-- Migration v2 — Tambah kolom name & description di api_keys
-- Jalankan di Supabase SQL Editor jika sudah ada database v1
-- =============================================

-- Tambah kolom name dan description ke api_keys (kalau belum ada)
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS name        text,
  ADD COLUMN IF NOT EXISTS description text;

-- Update default quota_total jadi 1000 untuk key baru
ALTER TABLE public.api_keys
  ALTER COLUMN quota_total SET DEFAULT 1000;

-- Izinkan product_id null (key bisa dibuat tanpa produk)
ALTER TABLE public.api_keys
  ALTER COLUMN product_id DROP NOT NULL;
