# Smart Campus Library

Aplikasi web manajemen perpustakaan kampus — katalog buku, data anggota, dan transaksi peminjaman dalam satu sistem.
Proyek mata kuliah **CAK3EAB3 Komputasi Awan dan Terdistribusi**, Telkom University (Kelompok *Networking Ala Hilmi*, IF-48-REG08).

## Fitur Utama

- CRUD **Buku**, **Anggota**, dan **Peminjaman**
- **Checkout peminjaman** dengan validasi anggota aktif dan stok tersedia
- **Pengembalian** otomatis memulihkan stok dan menghitung denda (Rp2.000/hari)
- **Dashboard** ringkasan koleksi, anggota, dan transaksi terlambat
- Login dan Register
- `GET /health` untuk health check load balancer

## Tech Stack

| | |
|---|---|
| Frontend | Next.js 14 (App Router) · Tailwind CSS · Shadcn UI · port 3001 |
| Backend | Node.js · Express.js · port 8000 |
| Data | In-memory (tanpa database) |
| Cloud | AWS EC2 · Application Load Balancer · Auto Scaling Group |

## Menjalankan Lokal

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npm run dev                         # http://localhost:8000
curl http://localhost:8000/health

# 2. Frontend (terminal lain)
cd frontend
cp .env.example .env.local          # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev -- -p 3001              # http://localhost:3001
```

> Data tersimpan di memori. Setiap restart backend, data kembali ke seed awal.

## Akun Demo (seed)

| Peran | Username (NIM/NIP) | Password |
|---|---|---|
| Pustakawan | `admin` | `admin123` |
| Mahasiswa | `1301210001` | `mahasiswa123` |

> Hanya untuk demo. Jangan dipakai di lingkungan nyata.

## Dokumentasi

Semua dokumen perancangan ada di folder [`docs/`](./docs). Mulai dari [`AGENTS.md`](./AGENTS.md).

| Dokumen | Isi |
|---|---|
| [PROJECT_BRIEF](./docs/PROJECT_BRIEF.md) | Soal dan rubrik penilaian |
| [CONSTRAINTS](./docs/CONSTRAINTS.md) | Batasan teknis, akademik, biaya |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | Arsitektur aplikasi |
| [DATA_MODEL](./docs/DATA_MODEL.md) | Entitas dan aturan validasi |
| [API](./docs/API.md) | Kontrak REST API |
| [DESIGN](./docs/DESIGN.md) | Design system dan wireframe |
| [AWS_DEPLOYMENT](./docs/AWS_DEPLOYMENT.md) | EC2, bash script, teardown |
| [CLOUD_ANALYSIS](./docs/CLOUD_ANALYSIS.md) | Masalah arsitektur dan arsitektur usulan |
| [TASK_DISTRIBUTION](./docs/TASK_DISTRIBUTION.md) | Pembagian kerja tim |
| [CHECKLIST](./docs/CHECKLIST.md) | Checklist pengumpulan |

## Tim

| Nama | NIM |
|---|---|
| Moch Firmansyah | 103012400137 |
| Listianto Hilmi Fauzaan | 103012400094 |
| Muhammad Daffa | 103012400110 |
| Oktafiana Ramadhan | 103012400221 |

Dosen: Immanuel Sembiring, S.T., M.T.
