# ApiStore — Panduan Setup

## Prerequisites
- Node.js 18+
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [Vercel](https://vercel.com) (gratis)

---

## 1. Install Dependencies

```bash
cd my-api-store
npm install
```

---

## 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** di dashboard Supabase
3. Copy isi file `supabase-schema.sql` dan jalankan
4. Ambil credentials dari **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi semua nilai yang dibutuhkan.

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 4. Buat Akun Admin

Setelah database siap, jalankan script ini di terminal (satu kali):

```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('AdminPassword123', 12).then(h => console.log(h));
"
```

Copy hash-nya, lalu jalankan di Supabase SQL Editor:

```sql
insert into public.users (name, email, password, role)
values ('Admin', 'admin@email.com', 'HASH_DI_SINI', 'admin');
```

---

## 5. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 6. Deploy ke Vercel

1. Push project ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables dari `.env.local`
4. Deploy!

---

## Struktur Halaman

| URL | Akses | Deskripsi |
|-----|-------|-----------|
| `/` | Public | Landing page |
| `/products` | Public | Katalog API |
| `/products/:id` | Public | Detail & beli |
| `/login` | Guest | Login |
| `/register` | Guest | Daftar |
| `/dashboard` | User | Dashboard user |
| `/dashboard/keys` | User | Semua API key |
| `/orders` | User | Riwayat order |
| `/admin` | Admin | Dashboard admin |
| `/admin/products` | Admin | Kelola produk |
| `/admin/users` | Admin | Kelola user |
| `/admin/transactions` | Admin | Konfirmasi order |
