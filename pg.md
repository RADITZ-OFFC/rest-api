# Payment Gateway — OrderKuota QRIS Integration

---

## Arsitektur

```
lib/payment.js                  ← Core library (QrisAjaib functions)
app/api/payment/
  qris/route.js                 ← POST /api/payment/qris
  history/route.js              ← GET  /api/payment/history
  status/[id]/route.js          ← GET  /api/payment/status/[id]
database.sql                    ← Tabel payments (migration v4)
```

---

## Environment Variables

```
# .env
ORKUT_USERNAME=your_username
ORKUT_TOKEN=your_token
```

Dibaca otomatis oleh `lib/payment.js` via `process.env`.

---

## Database Schema — `payments` table

```sql
CREATE TABLE IF NOT EXISTS public.payments (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references public.orders(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  qris_id      text,
  qrcode_url   text,
  amount       integer not null,
  status       text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'failed')),
  expired_at   timestamptz,
  paid_at      timestamptz,
  raw_response jsonb,
  created_at   timestamptz not null default now()
);
```

---

## API Endpoints

### 1. POST `/api/payment/qris`

Generate QRIS pembayaran untuk order tertentu.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "orderId": "uuid-order"
}
```

**Response 201:**

```json
{
  "message": "QRIS berhasil dibuat.",
  "payment": {
    "id": "uuid-payment",
    "order_id": "uuid-order",
    "user_id": "uuid-user",
    "qris_id": "123456",
    "qrcode_url": "https://app.orderkuota.com/...",
    "amount": 50000,
    "status": "pending",
    "expired_at": "2026-06-24T12:00:00Z",
    "created_at": "2026-06-24T11:00:00Z"
  },
  "qris": {
    "id": "123456",
    "amount": 50000,
    "qrcode_url": "https://app.orderkuota.com/...",
    "name": "QRIS Payment",
    "status": "pending",
    "info": "...",
    "date": "2026-06-24",
    "expired": 1750779600
  }
}
```

**Error Responses:**

- `400` — orderId tidak ada atau order sudah diproses
- `401` — Unauthorized
- `404` — Order tidak ditemukan atau bukan milik user
- `500` — Gagal membuat QRIS

---

### 2. GET `/api/payment/history`

Ambil riwayat pembayaran dari OrderKuota + data lokal dari database.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Params:**
| Param | Default | Deskripsi |
|-------|---------|-----------|
| `page` | `1` | Halaman history |
| `all` | `false` | `true` untuk ambil semua history |

**Response 200:**

```json
{
  "message": "History berhasil diambil.",
  "remote": {
    "total": 100,
    "page": 1,
    "pages": 5,
    "results": [
      {
        "id": "123456",
        "amount": 50000,
        "status": "sukses",
        "date": "2026-06-24",
        "info": "..."
      }
    ]
  },
  "local": [
    {
      "id": "uuid-payment",
      "order_id": "uuid-order",
      "qris_id": "123456",
      "amount": 50000,
      "status": "paid",
      "expired_at": "2026-06-24T12:00:00Z",
      "paid_at": "2026-06-24T11:30:00Z",
      "created_at": "2026-06-24T11:00:00Z"
    }
  ]
}
```

---

### 3. GET `/api/payment/status/[id]`

Cek status pembayaran berdasarkan payment ID. Otomatis update status jika sudah expired.

**Headers:**

```
Authorization: Bearer <token>
```

**Path Params:**
| Param | Deskripsi |
|-------|-----------|
| `id` | UUID dari payments table |

**Response 200:**

```json
{
  "payment": {
    "id": "uuid-payment",
    "order_id": "uuid-order",
    "qris_id": "123456",
    "qrcode_url": "https://app.orderkuota.com/...",
    "amount": 50000,
    "status": "pending",
    "status_label": "Menunggu pembayaran",
    "expired_at": "2026-06-24T12:00:00Z",
    "paid_at": null,
    "created_at": "2026-06-24T11:00:00Z"
  }
}
```

**Status Values:**
| Status | Label | Deskripsi |
|--------|-------|-----------|
| `pending` | Menunggu pembayaran | QRIS aktif, menunggu scan |
| `sukses` | Pembayaran berhasil | Pembayaran diterima |
| `expired` | QRIS kadaluarsa | QRIS sudah lewat waktu |
| `failed` | Pembayaran gagal | Pembayaran gagal |

**Error Responses:**

- `401` — Unauthorized
- `404` — Pembayaran tidak ditemukan

---

## Flow Penggunaan

```
1. User buat order
   POST /api/orders  →  { orderId }

2. Generate QRIS
   POST /api/payment/qris  →  { orderId }
   → Return qrcode_url, amount, expired

3. User scan QRIS & bayar

4. Cek status
   GET /api/payment/status/{paymentId}
   → Return status (pending/sukses/expired)

5. Lihat history
   GET /api/payment/history?page=1
```

---

## File Structure

```
rest-api/
├── lib/
│   └── payment.js              ← Core functions: createQris, getHistory, getAllHistory, checkStatus, isQrisExpired, getQrisStatus
├── app/
│   └── api/
│       └── payment/
│           ├── qris/
│           │   └── route.js    ← POST create QRIS
│           ├── history/
│           │   └── route.js    ← GET payment history
│           └── status/
│               └── [id]/
│                   └── route.js ← GET check status
└── database.sql                ← payments table (migration v4)
```

---

## Cara Setup

1. Isi `ORKUT_USERNAME` dan `ORKUT_TOKEN` di `.env`
2. Jalankan SQL migration di Supabase SQL Editor (copy dari `database.sql` bagian migration v4)
3. Restart server: `npm run dev`
4. Test endpoint sesuai dokumentasi di atas
