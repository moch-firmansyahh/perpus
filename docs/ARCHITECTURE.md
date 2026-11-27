# ARCHITECTURE — Smart Campus Library

Dokumen ini menjelaskan arsitektur **aplikasi** (logis) dan pola komunikasinya. Arsitektur **cloud** (EC2, ALB, ASG) ada di `AWS_DEPLOYMENT.md` dan `CLOUD_ANALYSIS.md`.

## 1. Gaya Arsitektur: Three-Tier

```
┌────────────────────────────────────────────────────────────┐
│ TIER 1 — PRESENTATION                                      │
│ Next.js 14 (App Router) + Tailwind + Shadcn UI   :3001     │
│ Halaman: login, register, dashboard, buku, anggota,        │
│          sirkulasi, riwayat                                │
└───────────────┬────────────────────────────────────────────┘
                │ HTTP / JSON  (lib/api.js, NEXT_PUBLIC_API_URL)
┌───────────────▼────────────────────────────────────────────┐
│ TIER 2 — APPLICATION                                       │
│ Express.js REST API (stateless)                  :8000     │
│ routes → controllers → services → store                    │
│ Auth JWT · validasi · aturan bisnis · GET /health          │
└───────────────┬────────────────────────────────────────────┘
                │ pemanggilan fungsi (in-process)
┌───────────────▼────────────────────────────────────────────┐
│ TIER 3 — DATA                                              │
│ In-memory store: backend/data/store.js                     │
│ arrays: buku[], anggota[], peminjaman[], users[]           │
│ (TANPA database — ketentuan tugas)                         │
└────────────────────────────────────────────────────────────┘
```

Alasan three-tier: pemisahan tanggung jawab, tiap tier bisa di-scale terpisah, dan menjadi dasar arsitektur usulan di AWS (Soal 5).

## 2. Komponen

| Komponen | Tanggung Jawab | Catatan |
|---|---|---|
| Browser | Menjalankan UI Next.js | Memanggil backend langsung via HTTP |
| Frontend (Next.js) | Render halaman, form, validasi UX, simpan JWT | Port 3001 |
| `lib/api.js` | Wrapper `fetch` tunggal: base URL, header `Authorization`, parse envelope, error handling | Satu-satunya titik HTTP |
| Backend (Express) | REST API CRUD, auth, checkout, pengembalian, ringkasan | Port 8000, stateless |
| `services/` | Logika bisnis (checkout, pengembalian, denda, status terlambat) | Dipisah dari controller agar mudah diuji |
| `data/store.js` | Penyimpan data in-memory + seed + helper id | Satu-satunya tempat data |
| `GET /health` | Status layanan untuk load balancer | Tanpa akses ke store yang berat |

## 3. Alur Utama

### 3.1 Checkout Peminjaman (lintas entitas)

```
Pustakawan/Mahasiswa → Form Sirkulasi (pilih anggota, buku, durasi)
  → POST /api/sirkulasi/pinjam
      1. cari anggota   → 404 bila tidak ada
      2. anggota.statusAktif == true → 422 bila false
      3. cari buku      → 404 bila tidak ada
      4. buku.tersedia > 0 → 422 bila 0
      5. buku.tersedia -= 1
      6. buat Peminjaman {status: DIPINJAM, batasKembali = +durasi}
  ← 201 { data: peminjaman }
```
Langkah 1–6 berjalan **sinkron** di satu proses Node.js sehingga atomik (tidak ada interleaving antar request di satu instance).

### 3.2 Pengembalian dan Denda

```
POST /api/sirkulasi/kembali { peminjamanId }
  1. cari peminjaman; 404 bila tidak ada; 422 bila sudah DIKEMBALIKAN
  2. tanggalKembali = sekarang
  3. hariTerlambat = max(0, ceil((tanggalKembali - batasKembali) / 1 hari))
  4. denda = hariTerlambat × 2000
  5. buku.tersedia += 1
  6. status = DIKEMBALIKAN
```

### 3.3 Autentikasi

```
POST /api/auth/login → verifikasi bcrypt → JWT (exp 2 jam)
Frontend simpan token (memory/cookie) → header Authorization: Bearer <token>
Middleware auth → decode JWT → req.user {id, role}
```
Tidak ada sesi di server → instance mana pun dapat memvalidasi token selama `JWT_SECRET` sama (penting saat scale-out).

## 4. Pola dan Prinsip

- **Stateless API**: tidak ada sesi; state hanya data domain di store.
- **Layered backend**: `routes → controllers → services → data`. Controller tipis, logika di service.
- **Envelope response seragam** (lihat `API.md`).
- **Fail fast**: validasi di awal, error dilempar ke `errorHandler` terpusat.
- **12-factor config**: konfigurasi via environment variable.
- **Health endpoint terpisah** dari logika bisnis.
- **Idempotensi baca**: semua `GET` bebas efek samping.

## 5. Kesiapan Cloud

| Kebutuhan | Cara dipenuhi |
|---|---|
| Health check ALB | `GET /health` → 200 `{status:"ok"}` |
| Scale-out | Stateless + JWT + konfigurasi via env |
| Identifikasi instance (demo load balancing) | `/health` menyertakan `instance` (hostname) |
| Graceful shutdown (connection draining) | Tangani `SIGTERM`: berhenti menerima koneksi baru, selesaikan yang berjalan, lalu exit |
| Frontend tahu alamat backend | `NEXT_PUBLIC_API_URL` saat build; di AWS bisa diarahkan ke DNS ALB |
| Bootstrap otomatis (ASG) | `scripts/ec2-bootstrap.sh` sebagai user-data |

Keterbatasan: lihat `CONSTRAINTS.md` bagian 6 (data in-memory per instance).

## 6. Keputusan Arsitektur (ADR Singkat)

| # | Keputusan | Alasan | Konsekuensi |
|---|---|---|---|
| ADR-1 | In-memory store | Ketentuan tugas | Data hilang saat restart; beda antar instance |
| ADR-2 | JWT, bukan sesi server | Stateless untuk scale-out | Tidak bisa revoke token sebelum kedaluwarsa (diterima untuk tugas) |
| ADR-3 | Express terpisah dari Next.js | Soal mewajibkan front/back terpisah via HTTP | Perlu CORS |
| ADR-4 | Service layer | Mudah diuji, controller tipis | Sedikit boilerplate |
| ADR-5 | Envelope `{success,message,data}` | Frontend sederhana dan konsisten | — |
| ADR-6 | Round-robin default ALB | Server homogen, request relatif seragam | Tidak sadar beban; lihat Tugas 9 untuk perbandingan algoritma |

## 7. Struktur Folder Backend (target)

```
backend/
├── server.js            # listen(PORT), SIGTERM handler
├── app.js               # express(), cors, json, routes, errorHandler
├── data/store.js        # seed + arrays + helper nextId()
├── routes/
│   ├── health.routes.js
│   ├── auth.routes.js
│   ├── buku.routes.js
│   ├── anggota.routes.js
│   ├── peminjaman.routes.js
│   └── sirkulasi.routes.js
├── controllers/         # satu per route
├── services/
│   ├── buku.service.js
│   ├── anggota.service.js
│   ├── peminjaman.service.js
│   └── sirkulasi.service.js   # checkout, pengembalian, ringkasan, hitung denda
├── middleware/          # auth.js, requireRole.js, validate.js, errorHandler.js
└── utils/               # response.js, dates.js, ids.js
```

## 8. Struktur Folder Frontend (target)

```
frontend/
├── app/
│   ├── layout.jsx
│   ├── (auth)/login/page.jsx
│   ├── (auth)/register/page.jsx
│   ├── (app)/layout.jsx            # Navbar + guard auth
│   ├── (app)/dashboard/page.jsx
│   ├── (app)/buku/page.jsx
│   ├── (app)/anggota/page.jsx
│   ├── (app)/sirkulasi/page.jsx
│   └── (app)/riwayat/page.jsx
├── components/
│   ├── ui/                         # shadcn: button, input, dialog, table, badge, card, toast
│   ├── Navbar.jsx
│   ├── StatCard.jsx
│   ├── DataTable.jsx
│   ├── StatusBadge.jsx
│   ├── SearchBar.jsx
│   ├── FormDialog.jsx
│   ├── ConfirmDialog.jsx
│   └── BackendStatus.jsx
└── lib/
    ├── api.js
    ├── auth.js
    └── format.js                   # tanggal, rupiah
```
