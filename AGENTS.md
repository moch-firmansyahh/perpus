# AGENTS.md — Smart Campus Library

Panduan untuk AI coding agent (Claude Code, Cursor, Copilot, dll) dan anggota tim yang bekerja di repo ini.
**Baca file ini dulu, lalu baca dokumen di `docs/` sesuai tugas yang dikerjakan.**

---

## 1. Ringkasan Proyek

**Smart Campus Library** adalah aplikasi web manajemen perpustakaan kampus (katalog buku, data anggota, transaksi peminjaman) untuk mata kuliah **CAK3EAB3 Komputasi Awan dan Terdistribusi** (Telkom University, Tugas-11).

- Aplikasi **dipakai ulang sepanjang semester** (Tugas 9 → 10 → 11 dan seterusnya), jadi jangan mengubah nama entitas, atribut, atau endpoint yang sudah dijanjikan di Tugas 9.
- Tujuan akhir bukan aplikasinya semata, tetapi **di-deploy dan dianalisis di AWS** (IaaS/EC2, load balancer, auto scaling).

## 2. Tech Stack (WAJIB, jangan diganti)

| Layer | Teknologi | Port |
|---|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Shadcn UI | **3001** |
| Backend | Node.js + Express.js (REST API, stateless) | **8000** |
| Data | **Tanpa database.** In-memory array JavaScript di `backend/data/store.js` | — |
| Komunikasi | HTTP (REST, JSON) frontend → backend | — |
| Cloud | AWS EC2 (IaaS), ALB, Auto Scaling Group | — |

## 3. Struktur Repo

```
smart-campus-library/
├── AGENTS.md
├── README.md
├── docs/                  # semua dokumen perancangan (file ini merujuk ke sini)
├── scripts/               # bash script untuk EC2
├── backend/
│   ├── package.json
│   ├── server.js          # entry point, port 8000
│   ├── app.js             # express app (cors, json, routes, error handler)
│   ├── data/store.js      # SEMUA data in-memory + seed
│   ├── routes/            # auth, buku, anggota, peminjaman, sirkulasi, health
│   ├── controllers/
│   ├── services/          # logika bisnis (checkout, pengembalian, denda)
│   ├── middleware/        # auth, validate, errorHandler
│   └── utils/             # response helper, id generator, tanggal
└── frontend/
    ├── package.json
    ├── app/               # App Router: login, register, dashboard, buku, anggota, sirkulasi, riwayat
    ├── components/        # ui/ (shadcn) + komponen reusable
    └── lib/api.js         # SATU-SATUNYA tempat pemanggilan HTTP ke backend
```

## 4. Perintah Umum

```bash
# Backend
cd backend && npm install
npm run dev            # nodemon, port 8000
npm start              # production
curl http://localhost:8000/health

# Frontend
cd frontend && npm install
npm run dev -- -p 3001
npm run build && npm start -- -p 3001
```

Variabel lingkungan:

| File | Variabel | Contoh |
|---|---|---|
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |
| `backend/.env` | `PORT`, `JWT_SECRET`, `CORS_ORIGIN` | `8000`, `ganti-ini`, `http://localhost:3001` |

Jangan pernah commit `.env`. Sediakan `.env.example`.

## 5. Aturan Wajib (Hard Rules)

1. **Dilarang memakai database** (SQL, NoSQL, SQLite, file JSON yang ditulis ulang ke disk, Redis). Data hanya di memori `store.js`. Alasan: ketentuan tugas.
2. **Setiap entitas harus punya CRUD lengkap**: Buku, Anggota, Peminjaman.
3. **Minimal satu fitur lintas entitas** (sudah ada: Checkout, Pengembalian + Denda, Dashboard). Jangan dihapus.
4. **Backend harus stateless** (tidak menyimpan sesi di memori selain data domain; auth memakai JWT) agar siap scale-out.
5. **`GET /health` wajib ada** dan mengembalikan `200` ringan tanpa dependensi, untuk health check load balancer.
6. **Semua panggilan HTTP dari frontend lewat `lib/api.js`**. Jangan menulis `fetch('http://localhost:8000')` langsung di komponen.
7. **Jangan hardcode URL/secret**. Pakai environment variable.
8. **Jangan ubah kontrak API** di `docs/API.md` tanpa memperbarui dokumen dan memberi tahu anggota yang mengerjakan sisi lainnya.
9. **Jangan menambah storage** (EBS tambahan, S3, RDS, DynamoDB) untuk studi kasus Tugas 11 — ini batasan soal.
10. **Hindari biaya AWS tak terduga**: setiap resource yang dibuat harus tercatat dan **dihapus** setelah dokumentasi selesai (lihat `docs/AWS_DEPLOYMENT.md` bagian teardown).

## 6. Konvensi Kode

- **Bahasa kode**: identifier, nama field, dan endpoint mengikuti Bahasa Indonesia seperti di Tugas 9 (`judul`, `pengarang`, `tersedia`, `/api/buku`). Komentar boleh Indonesia atau Inggris, konsisten per file.
- **Style**: ES Modules (`import/export`), `const` default, async/await, tanpa `var`.
- **Format**: Prettier (2 spasi, single quote, titik koma). ESLint bila tersedia.
- **Penamaan file**: backend `kebab-case` atau `camelCase` konsisten; komponen React `PascalCase.jsx`.
- **Commit**: Conventional Commits, mis. `feat(backend): tambah endpoint checkout`, `fix(frontend): validasi form buku`.
- **Branch**: `main` (stabil) ← `feat/<nama-fitur>`. Satu PR = satu fitur kecil.
- **Response API**: selalu pakai envelope di `docs/API.md` (`success`, `message`, `data`).
- **Validasi**: dilakukan di backend (sumber kebenaran) dan di frontend (UX).
- **Error handling**: jangan `console.log` lalu diam; kembalikan status code yang benar (400/401/404/409/422/500).
- **Aksesibilitas dasar**: label pada input, kontras warna cukup, tombol punya teks atau `aria-label`.

## 7. Aturan Domain (Business Rules)

- Durasi pinjam default **7 hari**; `batasKembali = tanggalPinjam + durasi`.
- Denda **Rp2.000 per hari** keterlambatan; `denda = hariTerlambat × 2000`.
- Checkout ditolak bila: anggota tidak ada / `statusAktif=false`, buku tidak ada, atau `tersedia <= 0`.
- Checkout: `tersedia -= 1` dan buat Peminjaman `DIPINJAM` dalam **satu operasi sinkron** (atomik di single process).
- Pengembalian: isi `tanggalKembali`, hitung denda, `tersedia += 1`, set status `DIKEMBALIKAN`.
- Status `TERLAMBAT` dihitung saat dibaca bila belum dikembalikan dan sekarang > `batasKembali`.
- Hapus Buku/Anggota **ditolak (409)** bila masih punya peminjaman aktif.
- Detail lengkap: `docs/DATA_MODEL.md` dan `docs/API.md`.

## 8. Peta Dokumen

| File | Isi |
|---|---|
| `docs/PROJECT_BRIEF.md` | Soal Tugas-11, ketentuan, rubrik, deliverable |
| `docs/CONSTRAINTS.md` | Semua batasan teknis, akademik, biaya |
| `docs/ARCHITECTURE.md` | Arsitektur aplikasi (3-tier) dan pola komunikasi |
| `docs/DATA_MODEL.md` | Entitas, atribut, relasi, seed data, aturan validasi |
| `docs/API.md` | Kontrak REST API lengkap |
| `docs/DESIGN.md` | Design system, wireframe, navigation flow, komponen reusable |
| `docs/AWS_DEPLOYMENT.md` | Langkah EC2, bash script, analisis, teardown |
| `docs/CLOUD_ANALYSIS.md` | 3 masalah arsitektur awal + arsitektur usulan + justifikasi |
| `docs/TASK_DISTRIBUTION.md` | Pembagian kerja 4 orang (25 poin masing-masing) |
| `docs/CHECKLIST.md` | Checklist pengumpulan dan definisi selesai |

## 9. Yang Harus Dilakukan Agent Sebelum Selesai

- [ ] Backend jalan di port 8000, `/health` mengembalikan 200.
- [ ] Frontend jalan di port 3001 dan memanggil backend lewat `lib/api.js`.
- [ ] Tidak ada database, tidak ada secret yang ter-commit.
- [ ] Perubahan kontrak API sudah tercermin di `docs/API.md`.
- [ ] Fitur yang disentuh diuji manual (lihat `docs/CHECKLIST.md`).

## 10. Integritas Akademik

Tugas dikerjakan kelompok; setiap anggota wajib berkontribusi dan memahami seluruh jawaban (pernyataan a–e di lembar soal). Bagian yang ditandai **AI-Level 2** dan **Onsite** harus dikerjakan sesuai ketentuan dosen. Agent membantu implementasi dan dokumentasi, tetapi anggota harus bisa menjelaskan hasilnya sendiri.
