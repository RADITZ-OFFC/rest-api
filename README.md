# ApiStore — REST API Marketplace

Platform marketplace API untuk developer Indonesia. Pengguna bisa membeli akses API, mengelola API key, memantau penggunaan, dan upgrade plan — semua dalam satu dashboard.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT dengan httpOnly cookie (jose + jsonwebtoken)
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Password Hashing:** bcryptjs

---

## Fitur Utama

### User
- Register & login dengan JWT session
- Dashboard manajemen API key
- Beli produk API dan lihat riwayat order
- Monitor penggunaan & request logs
- Upgrade plan (Free → Premium → Super Premium)
- Analitik penggunaan API

### Admin
- Dashboard statistik platform
- Manajemen produk API (CRUD)
- Manajemen user
- Approval transaksi & upgrade plan
- Monitoring semua aktivitas

---

## Subscription Plans

| Plan | Harga | Credits/hari | Max Keys | Rate Limit |
|------|-------|--------------|----------|------------|
| **Free** | Gratis | 500 | 1 key | 30 req/menit |
| **Premium / Pro** | Rp 25.000 | 10.000 | 5 keys | 120 req/menit |
| **Super Premium / VVIP** | Rp 50.000 | 100.000 | 10 keys | 300 req/menit |

Pembayaran manual — user upload bukti bayar, admin konfirmasi, API key otomatis aktif.

---

## API Endpoints

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Daftar akun baru |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Info user yang sedang login |

### API Keys
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/keys` | List semua API key milik user |
| POST | `/api/keys/create` | Buat API key baru |
| PUT | `/api/keys/[id]` | Update API key |
| DELETE | `/api/keys/[id]` | Hapus API key |

### Products
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/products` | List semua produk API |
| GET | `/api/products/[id]` | Detail produk |

### Orders & Lainnya
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST | `/api/orders` | Riwayat order / buat order baru |
| GET | `/api/logs` | Log penggunaan API |
| GET/PUT | `/api/profile` | Lihat & update profil |
| POST | `/api/upgrade` | Request upgrade plan |

### Admin (butuh role admin)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/stats` | Statistik platform |
| GET/POST/PUT/DELETE | `/api/admin/products` | Manajemen produk |
| GET | `/api/admin/users` | Daftar semua user |
| GET/PATCH | `/api/admin/transactions` | Approval transaksi |
| GET/PATCH | `/api/admin/upgrade` | Approval upgrade plan |

---

## Database Schema

```
users          — id, email, password, name, role, plan, credits
products       — id, name, description, category, price, endpoint
packages       — id, name, price, credits, max_keys, rate_limit
orders         — id, user_id, product_id, status, created_at
api_keys       — id, user_id, key, name, is_active, usage_count
usage_logs     — id, api_key_id, endpoint, status_code, created_at
plan_orders    — id, user_id, package_id, status, payment_proof
```

---

## Setup & Instalasi

### Prerequisites
- Node.js 18+
- Akun [Supabase](https://supabase.com)

### 1. Clone & Install

```bash
git clone https://github.com/RADITZ-OFFC/rest-api.git
cd rest-api
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan file `supabase-schema.sql`
3. Jalankan juga `supabase-migration-v3.sql` untuk data terbaru

### 3. Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-string
```

Nilai `NEXT_PUBLIC_SUPABASE_URL` dan key bisa didapat dari **Supabase → Settings → API**.

### 4. Buat Admin User

Jalankan query ini di **Supabase SQL Editor** setelah register akun:

```sql
UPDATE users SET role = 'admin' WHERE email = 'email-kamu@example.com';
```

### 5. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables di Vercel dashboard
4. Deploy

---

## Struktur Folder

```
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── admin/           # Admin dashboard
│   ├── dashboard/       # User dashboard
│   ├── api/             # API route handlers
│   └── page.jsx         # Landing page
├── components/          # Reusable UI components
├── lib/                 # Utilities (auth, supabase, plans, dll)
├── middleware.js        # Route protection & auth middleware
└── supabase-schema.sql  # Database schema
```

---

## Lisensi

MIT License — bebas digunakan dan dimodifikasi.
