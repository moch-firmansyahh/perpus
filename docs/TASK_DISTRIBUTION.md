# TASK DISTRIBUTION — Pembagian Kerja 4 Orang

Total **100 poin → 25 poin per orang**. Pembagian murni pengerjaan soal (tanpa formatting). Nama anggota di bawah hanya label peran; **tukar sesuai kesepakatan tim**.

| Peran | Anggota (usulan, bisa ditukar) |
|---|---|
| Orang 1 | _________ |
| Orang 2 | _________ (pemegang akun AWS: Moch Firmansyah — sebaiknya Orang 2 atau beri akses IAM) |
| Orang 3 | _________ |
| Orang 4 | _________ |

## Pembagian

| Anggota | Bagian | Poin |
|---|---|---|
| **Orang 1** | **Soal 1a** — tabel desain + wireframe high-fidelity **Login, Register, Dashboard** (10) · **Soal 5** — gambar arsitektur usulan (10) · **Soal 4** — gambar arsitektur EC2 awal (5) | **25** |
| **Orang 2** | **Soal 3** — EC2 Linux + script bash + analisis (10) · **Soal 6** — hapus semua resource + screenshot bukti (10) · **Soal 4** — masalah ke-1 + penjelasan (5) | **25** |
| **Orang 3** | **Soal 1b** — wireframe high-fidelity **Katalog Buku (+modal), Data Anggota, Sirkulasi, Riwayat** (10) · **Soal 2** — front-end Next.js (10) · **Soal 4** — masalah ke-2 + penjelasan (5) | **25** |
| **Orang 4** | **Soal 2** — back-end Express (10) · **Soal 5** — justifikasi arsitektur (10) · **Soal 4** — masalah ke-3 + penjelasan (5) | **25** |

Verifikasi: 25 + 25 + 25 + 25 = **100**.

## Rincian Output per Orang

### Orang 1
- [ ] Tabel keputusan desain terisi (`DESIGN.md` bagian 1)
- [ ] Wireframe Login, Register, Dashboard (high-fidelity)
- [ ] Diagram arsitektur awal 1 EC2 (`CLOUD_ANALYSIS.md` Bagian A)
- [ ] Diagram arsitektur usulan (Bagian C): ALB, 2 AZ, ASG, three-tier
- [ ] Rujukan: `DESIGN.md`, `CLOUD_ANALYSIS.md`

### Orang 2
- [ ] EC2 Ubuntu 24.04, `t3.micro`, 8 GiB, screenshot pembuatan
- [ ] `ec2-bootstrap.sh` dan `healthcheck.sh` dijalankan, screenshot output
- [ ] Analisis (latency, ketersediaan, utilisasi, biaya) dengan data nyata
- [ ] Masalah ke-1 (lihat Bagian B)
- [ ] **Teardown** semua resource + screenshot bukti (`AWS_DEPLOYMENT.md` bagian 8)
- ⚠️ Teardown dilakukan **setelah** semua anggota selesai membutuhkan akses AWS/screenshot.

### Orang 3
- [ ] Wireframe Katalog Buku + modal form, Data Anggota (baru), Sirkulasi, Riwayat (baru)
- [ ] Frontend Next.js: semua halaman, `lib/api.js`, state loading/empty/error
- [ ] Masalah ke-2 (lihat Bagian B)
- [ ] Rujukan: `DESIGN.md`, `API.md`

### Orang 4
- [ ] Backend Express: CRUD 3 entitas, auth, sirkulasi, `/health`, store + seed
- [ ] Justifikasi arsitektur (D.1–D.3 di `CLOUD_ANALYSIS.md`)
- [ ] Masalah ke-3 (lihat Bagian B)
- [ ] Rujukan: `DATA_MODEL.md`, `API.md`, `ARCHITECTURE.md`

## Pembagian Pengerjaan Kode (Soal 2) antara Orang 3 dan Orang 4

| Area | Orang 4 (Backend) | Orang 3 (Frontend) |
|---|---|---|
| Kontrak | Menjaga `API.md` | Mengonsumsi `API.md` |
| Auth | `/api/auth/*`, JWT, bcrypt | Halaman login/register, simpan token, guard route |
| Buku | CRUD + validasi + 409 | Halaman katalog, modal, hapus dengan konfirmasi |
| Anggota | CRUD + unik NIM/email | Halaman anggota |
| Peminjaman | CRUD | Halaman riwayat |
| Sirkulasi | checkout, kembali, ringkasan | Halaman sirkulasi, dashboard |
| Health | `/health` | `BackendStatus` di navbar |

Dua orang memakai **satu repo GitHub** dengan branch `feat/backend-*` dan `feat/frontend-*`, merge ke `main` via PR.

## Ketergantungan dan Urutan Kerja

```
[Semua] sepakati 3 masalah (Soal 4) ───────────────┐
[Orang 3+4] sepakati format API (API.md) ──┐        │
[Orang 1] tabel desain ──► [Orang 3] wireframe 1b   │
                         └► coding frontend         │
[Orang 4] backend ──► (frontend terhubung)          │
[Orang 2] EC2 + dokumentasi ──► [Orang 1] gambar    │
                                [Orang 4] justifikasi◄┘
semua selesai ──► [Orang 2] teardown + bukti
```

## Cara Menjaga Keadilan dan Memenuhi Pernyataan (a–e)

1. Tiap anggota menjelaskan bagiannya ke tiga anggota lain (pernyataan b) — sisihkan sesi presentasi singkat sebelum pengumpulan.
2. Tiap anggota membaca dan memahami bagian teman (pernyataan c).
3. Isi kolom **Kontribusi Tugas** di tabel pernyataan sesuai pembagian di atas.
4. Bila beban tidak seimbang di tengah jalan, tukar sub-bagian dengan nilai poin setara (mis. 5 poin masalah ↔ 5 poin gambar arsitektur).
5. Catat kontribusi lewat commit GitHub dan riwayat dokumen sebagai bukti.
6. Anggota yang tidak berkontribusi bernilai nol dan namanya tidak ditulis di tabel (ketentuan lembar soal).

## Catatan

- Soal 1 berlabel **AI-Level 2 – Onsite**: ikuti aturan dosen.
- Data Anggota dan Riwayat **belum punya wireframe** di Tugas 9/10 — buat baru.
- Login/Register membutuhkan endpoint auth yang **belum ada** di Tugas 9 — lihat `API.md` bagian 3.
- **Jangan menyalin** arsitektur irigasi IoT dari Tugas 10 no. 5.
