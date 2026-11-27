# CONSTRAINTS — Batasan Proyek

Semua batasan yang **tidak boleh dilanggar**. Jika ada konflik antar dokumen, file ini yang menang.

## 1. Batasan Akademik

| ID | Batasan | Sumber |
|---|---|---|
| A1 | Dikerjakan kelompok; semua anggota wajib berkontribusi dan memahami seluruh jawaban | Ketentuan lembar soal |
| A2 | Tidak mencontek dan tidak memberikan jawaban ke kelompok lain | Pernyataan (d), (e) |
| A3 | Soal 1 berlabel **AI-Level 2 – Onsite**; ikuti aturan penggunaan AI dari dosen | Soal 1 |
| A4 | Perhitungan wajib menuliskan langkah pengerjaan | Ketentuan 3 |
| A5 | Kode di-host di **GitHub** dan `.zip` tetap diunggah ke LMS | Soal 2 |
| A6 | Pengerjaan kode boleh dicicil, maksimal **minggu 13** | Soal 2 |
| A7 | Tabel pernyataan harus lengkap sebelum nilai diinput | Ketentuan 7 |

## 2. Batasan Teknis Aplikasi

| ID | Batasan | Alasan |
|---|---|---|
| T1 | **Tanpa database.** Data hanya di memori (`backend/data/store.js`) | Ketentuan Tugas 9 |
| T2 | Minimal **3 entitas** dengan CRUD penuh: Buku, Anggota, Peminjaman | Ketentuan Tugas 9 |
| T3 | Minimal **1 fitur lintas entitas** di backend | Ketentuan Tugas 9 |
| T4 | Frontend dan backend **terpisah**, komunikasi **HTTP** | Soal 2 |
| T5 | Backend Express di port **8000**, frontend Next.js di port **3001** | Keputusan Tugas 9 |
| T6 | `GET /health` wajib dan harus ringan | Health check ALB |
| T7 | Backend **stateless** (JWT, tanpa sesi server) | Syarat scale-out |
| T8 | Frontend mengakses backend hanya lewat `lib/api.js` dan `NEXT_PUBLIC_API_URL` | Portabilitas antar environment |
| T9 | Tanpa upload file dan tanpa penyimpanan ke disk | Tidak ada storage tambahan |
| T10 | Stack tidak diganti (Next.js 14, Express, Tailwind, Shadcn UI) | Konsistensi dengan Tugas 9 |

## 3. Batasan Cloud (Soal 3–6)

| ID | Batasan | Catatan |
|---|---|---|
| C1 | Platform: **AWS**, layanan IaaS **EC2** | Soal 3 |
| C2 | OS **Linux** (disarankan Ubuntu 24.04 LTS atau Amazon Linux 2023) | Soal 3 |
| C3 | Kapasitas disk disesuaikan budget (disarankan **8 GB**, minimum yang cukup) | Soal 3 |
| C4 | Wajib ada **script bash sederhana** yang berjalan di Linux | Soal 3 |
| C5 | **Tidak menambah storage** pada arsitektur usulan (tanpa RDS, S3, EFS, EBS tambahan, DynamoDB) | Soal 5 |
| C6 | Arsitektur usulan memakai konsep **three-tier** + Load Balancer, AZ, Auto Scaling, Redundancy, Latency | Soal 5 |
| C7 | Semua resource **wajib dihapus** setelah dokumentasi dan dibuktikan dengan screenshot | Soal 6 |
| C8 | Pakai **voucher/kredit gratis** dan pantau batasnya (kredit akun: $100) | Soal 6 |
| C9 | Hindari resource berbayar yang terus berjalan: NAT Gateway, Elastic IP tidak terpakai, ALB yang lupa dihapus, volume EBS yatim | Biaya |

## 4. Batasan Keamanan

- Jangan commit `.env`, key pair `.pem`, `JWT_SECRET`, atau AWS access key.
- Security Group: SSH (22) **hanya dari IP sendiri**, bukan `0.0.0.0/0`.
- Password disimpan sebagai **hash** (bcrypt) walaupun di memori; jangan tampilkan password di response.
- CORS dibatasi ke origin frontend (`CORS_ORIGIN`), bukan `*`, pada deployment.
- Aktifkan **AWS Budgets** (alarm biaya) sebelum membuat resource.
- Input divalidasi di backend; jangan percaya validasi frontend.

## 5. Batasan Kualitas (Definition of Done)

- Semua endpoint di `API.md` mengembalikan envelope dan status code yang benar.
- Aturan bisnis di `DATA_MODEL.md` terpenuhi (stok tidak pernah negatif, `tersedia <= stok`).
- Frontend menampilkan state **loading**, **empty**, dan **error**.
- UI konsisten dengan `DESIGN.md`.
- Tidak ada `console.error` tak tertangani saat alur utama dijalankan.

## 6. Keterbatasan Arsitektur yang Diketahui (Wajib Diakui di Laporan)

> **Data in-memory + banyak instance = data tiap server bisa berbeda.**

Karena T1 (tanpa database) dan C5 (tanpa storage tambahan), saat backend di-scale-out ke beberapa instance di belakang ALB, **setiap instance memegang salinan data sendiri**. Konsekuensinya: data hasil Create/Update/Delete di satu instance tidak terlihat di instance lain, dan scale-in/restart menghapus perubahan.

Cara menanganinya di laporan (jujur, tanpa melanggar batasan):

1. Akui sebagai **keterbatasan** studi kasus.
2. Fokuskan analisis pada aspek yang memang dijawab oleh arsitektur: **availability, redundancy, latency, elastisitas**.
3. Sebut bahwa pada sistem produksi, state dipindah ke penyimpanan bersama (database terkelola) — sebagai pekerjaan lanjutan, bukan bagian arsitektur usulan Tugas 11.
4. Untuk demo, seed data identik di semua instance sehingga operasi **baca** konsisten.
5. Opsi mitigasi ringan tanpa storage baru: *sticky sessions* ALB agar satu pengguna konsisten ke instance yang sama (bukan solusi sempurna, hanya mengurangi gejala).
