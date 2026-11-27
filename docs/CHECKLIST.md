# CHECKLIST — Definisi Selesai dan Pengumpulan

Centang sebelum mengunggah ke LMS.

## 1. Backend (Soal 2)

- [ ] `npm run dev` berjalan di port **8000**
- [ ] `GET /health` → 200 `{status:"ok", ...}`
- [ ] Login admin berhasil, token JWT diterima
- [ ] CRUD **Buku**: create, read (search/filter), update, delete
- [ ] CRUD **Anggota**: create, read, update, delete
- [ ] CRUD **Peminjaman**: create, read (filter status), update, delete
- [ ] **Checkout**: sukses mengurangi `tersedia`; ditolak bila anggota nonaktif (422) atau stok 0 (422)
- [ ] **Pengembalian**: stok +1, denda dihitung (Rp2.000/hari), status `DIKEMBALIKAN`
- [ ] **Ringkasan** dashboard benar terhadap data
- [ ] Hapus Buku/Anggota dengan peminjaman aktif → **409**
- [ ] NIM/email duplikat → **409**
- [ ] Invarian: `0 ≤ tersedia ≤ stok`
- [ ] Tanpa database; data hanya di `store.js` dengan seed 4–5 per entitas
- [ ] `.env.example` ada; `.env` **tidak** ter-commit

## 2. Frontend (Soal 2)

- [ ] `npm run dev -- -p 3001` berjalan
- [ ] Semua panggilan HTTP lewat `lib/api.js` dan `NEXT_PUBLIC_API_URL`
- [ ] Halaman: Login, Register, Dashboard, Katalog Buku (+modal), Data Anggota, Sirkulasi, Riwayat
- [ ] State **loading / empty / error** ada di setiap tabel dan form
- [ ] Konfirmasi sebelum Hapus
- [ ] Toast sukses/gagal
- [ ] `BackendStatus` menampilkan online/offline
- [ ] Mahasiswa tidak melihat menu/aksi khusus pustakawan
- [ ] Tampilan sesuai `DESIGN.md` (warna, font, komponen)
- [ ] `npm run build` tanpa error

## 3. Repo GitHub dan ZIP

- [ ] Repo berisi `backend/`, `frontend/`, `docs/`, `scripts/`, `README.md`, `AGENTS.md`
- [ ] README menjelaskan cara menjalankan
- [ ] Tidak ada secret/`.pem`/`node_modules` ter-commit (`.gitignore` benar)
- [ ] Commit dari semua anggota yang relevan
- [ ] `.zip` kode (tanpa `node_modules`) diunggah ke LMS
- [ ] URL repo dicantumkan di lembar jawaban

## 4. Wireframe dan Tabel Desain (Soal 1)

- [ ] Tabel keputusan desain terisi lengkap
- [ ] 7 layar + modal form: Login, Register, Dashboard, Katalog, Modal Buku, Data Anggota, Sirkulasi, Riwayat
- [ ] High-fidelity (warna, font, komponen konsisten)
- [ ] Alur navigasi tiap use case jelas

## 5. AWS (Soal 3)

- [ ] Budget alarm aktif
- [ ] EC2 Linux dibuat (tipe, AMI, **disk 8 GiB**) + screenshot
- [ ] Script bash dijalankan + screenshot output
- [ ] Analisis memuat data nyata (bukan teks generik)
- [ ] Kode script dilampirkan di lembar jawaban

## 6. Arsitektur (Soal 4 dan 5)

- [ ] Gambar arsitektur awal (1 EC2)
- [ ] **3 masalah** masing-masing dijelaskan lengkap (apa, mengapa, pemicu, dampak, ukur)
- [ ] Gambar arsitektur usulan: three-tier, ALB, ≥2 AZ, Auto Scaling, redundancy
- [ ] Justifikasi menjawab **ketiga** masalah
- [ ] Konsep Load Balancer, AZ, Auto Scaling, Redundancy, Latency semuanya dibahas
- [ ] **Tidak** menambah storage
- [ ] Keterbatasan data in-memory diakui

## 7. Teardown (Soal 6)

- [ ] Semua resource dihapus sesuai urutan di `AWS_DEPLOYMENT.md` bagian 8
- [ ] Screenshot bukti: Instances, Volumes, Load Balancers, Target Groups, ASG, Elastic IP, Security Groups
- [ ] Region terlihat di screenshot
- [ ] Billing/Credits dicek; sisa kredit dicatat

## 8. Lembar Jawaban

- [ ] Tabel pernyataan: nama, NIM, kontribusi tugas, **tanda tangan** semua anggota yang berkontribusi
- [ ] Setiap anggota sudah menjelaskan dan memahami jawaban satu sama lain
- [ ] Tidak ada jawaban yang disalin dari kelompok lain
- [ ] Salin dari Tugas 10 no. 5 (arsitektur irigasi IoT) **tidak** terbawa
- [ ] Diunggah ke LMS oleh satu perwakilan

## 9. Uji Manual Singkat (skenario demo)

1. Login sebagai `admin`.
2. Dashboard menampilkan ringkasan dan peminjaman aktif.
3. Tambah buku baru di Katalog → muncul di tabel.
4. Sirkulasi: checkout `BK-003` untuk `MB-002` → `tersedia` turun 1.
5. Coba checkout untuk `MB-005` (nonaktif) → ditolak.
6. Kembalikan `LN-003` (terlambat) → denda tampil, stok naik 1.
7. Hapus `BK-004` selagi dipinjam → ditolak (409).
8. Logout → login sebagai mahasiswa → hanya Katalog dan Riwayat milik sendiri.
9. Matikan backend → `BackendStatus` berubah merah.
