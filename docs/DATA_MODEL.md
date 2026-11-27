# DATA MODEL — Smart Campus Library

Data disimpan **in-memory** di `backend/data/store.js` (tanpa database). Dokumen ini adalah sumber kebenaran skema dan aturan validasi.

## 1. Diagram Relasi

```
Anggota (1) ───< Peminjaman >─── (1) Buku
   id              anggotaId           id
                   bukuId
```
Satu Anggota punya banyak Peminjaman; satu Buku muncul di banyak Peminjaman (one-to-many dari kedua sisi). Integritas relasi dijaga validasi di backend, bukan foreign key database.

## 2. Entitas Buku

| Atribut | Tipe | Wajib | Aturan |
|---|---|---|---|
| `id` | String (PK) | auto | Format `BK-001`, `BK-002`, … |
| `isbn` | String | tidak | Boleh kosong; bila diisi 10–17 karakter (angka dan `-`) |
| `judul` | String | **ya** | 1–200 karakter |
| `pengarang` | String | **ya** | 1–120 karakter |
| `penerbit` | String | tidak | maks 120 karakter |
| `tahunTerbit` | Number | tidak | Integer 1900 – tahun sekarang |
| `kategori` | String | tidak | Contoh: Komputasi Awan, Rekayasa Perangkat Lunak, Jaringan Komputer, DevOps & Cloud, Informatika |
| `stok` | Number | **ya** | Integer ≥ 0; total eksemplar |
| `tersedia` | Number | auto | `0 ≤ tersedia ≤ stok`; = `stok − jumlah peminjaman aktif` |

Aturan:
- Create: `tersedia = stok`.
- Update `stok`: tolak (422) bila `stok < jumlah peminjaman aktif buku itu`; selain itu hitung ulang `tersedia = stok − dipinjamAktif`.
- Delete: tolak (**409**) bila ada peminjaman aktif (`DIPINJAM`/`TERLAMBAT`).

## 3. Entitas Anggota

| Atribut | Tipe | Wajib | Aturan |
|---|---|---|---|
| `id` | String (PK) | auto | Format `MB-001`, … |
| `nim` | String | **ya** | NIM mahasiswa atau NIP dosen; **unik** (409 bila duplikat) |
| `nama` | String | **ya** | 1–120 karakter |
| `email` | String | **ya** | Format email valid; unik |
| `jurusan` | String | tidak | Program studi/fakultas |
| `noTelepon` | String | tidak | Pola `08xxxxxxxxxx` (9–14 digit) |
| `statusAktif` | Boolean | auto | Default `true`; `false` = dibekukan, tidak boleh meminjam |

Aturan:
- Delete: tolak (**409**) bila ada peminjaman aktif.
- Menonaktifkan anggota (`statusAktif=false`) **tidak** menghapus riwayatnya.

## 4. Entitas Peminjaman

| Atribut | Tipe | Wajib | Aturan |
|---|---|---|---|
| `id` | String (PK) | auto | Format `LN-001`, … |
| `kodePeminjaman` | String | auto | `PINJAM-YYYYMM-NNN`, mis. `PINJAM-202611-001` (NNN urut per bulan) |
| `anggotaId` | String (FK) | **ya** | Harus ada di Anggota |
| `bukuId` | String (FK) | **ya** | Harus ada di Buku |
| `tanggalPinjam` | String ISO | auto | Waktu transaksi |
| `batasKembali` | String ISO | auto | `tanggalPinjam + durasi` (default 7 hari) |
| `tanggalKembali` | String ISO / null | auto | `null` selama belum dikembalikan |
| `status` | String | auto | `DIPINJAM`, `DIKEMBALIKAN`, `TERLAMBAT` |
| `denda` | Number | auto | Rupiah; default 0 |

Aturan status:
- Belum dikembalikan dan sekarang ≤ `batasKembali` → `DIPINJAM`.
- Belum dikembalikan dan sekarang > `batasKembali` → `TERLAMBAT` (dihitung saat dibaca; `denda` ditampilkan sebagai estimasi berjalan).
- Sudah dikembalikan → `DIKEMBALIKAN`, `denda` final.

Rumus denda:
```
hariTerlambat = max(0, ceil((tanggalKembali_atau_sekarang − batasKembali) / 24 jam))
denda         = hariTerlambat × 2000
```

Peminjaman aktif = `status ∈ {DIPINJAM, TERLAMBAT}`.

## 5. Entitas Pendukung: User (Autentikasi)

*Tidak ada di Tugas 9; ditambahkan untuk Login/Register (Tugas 10).*

| Atribut | Tipe | Aturan |
|---|---|---|
| `id` | String | `US-001`, … |
| `username` | String | NIM/NIP atau email; unik |
| `passwordHash` | String | bcrypt; **tidak pernah dikirim ke client** |
| `role` | String | `PUSTAKAWAN` atau `MAHASISWA` |
| `anggotaId` | String / null | Tautan ke Anggota (untuk MAHASISWA) |

Register membuat **Anggota baru + User** (role `MAHASISWA`) sekaligus. Akun `PUSTAKAWAN` hanya dari seed.

## 6. Seed Data (4–5 per entitas)

### Buku
| id | judul | pengarang | kategori | tahun | stok | tersedia |
|---|---|---|---|---|---|---|
| BK-001 | Cloud Computing: Architecture and Patterns | Thomas Erl | Komputasi Awan | 2021 | 5 | 4 |
| BK-002 | Desain Sistem Terdistribusi Modern | Brendan Burns | Sistem Terdistribusi | 2022 | 4 | 3 |
| BK-003 | Clean Architecture: A Craftsman's Guide | Robert C. Martin | Rekayasa PL | 2020 | 6 | 5 |
| BK-004 | Site Reliability Engineering (SRE) | Niall Murphy | DevOps & Cloud | 2023 | 3 | 2 |
| BK-005 | Algoritma Pemrograman & Struktur Data | Rinaldi Munir | Ilmu Komputer | 2021 | 7 | 7 |

> Angka stok mengikuti sketsa Tugas 9. Pastikan `tersedia` konsisten dengan seed peminjaman aktif (hitung ulang saat seed dibuat, jangan hardcode asal).

### Anggota
| id | nim | nama | jurusan | statusAktif |
|---|---|---|---|---|
| MB-001 | 1301210001 | Muhammad Firman | Informatika | true |
| MB-002 | 1301210002 | Alya Zahra Salsabila | Sistem Informasi | true |
| MB-003 | 1301210003 | Budi Santoso | Informatika | true |
| MB-004 | 1301210004 | Citra Lestari | Teknologi Informasi | true |
| MB-005 | 1301210005 | Dimas Pratama | Informatika | **false** |

### Peminjaman
| id | kode | anggotaId | bukuId | tanggalPinjam | batasKembali | status |
|---|---|---|---|---|---|---|
| LN-001 | PINJAM-202611-001 | MB-001 | BK-001 | 2026-11-08 | 2026-11-15 | DIPINJAM |
| LN-002 | PINJAM-202611-002 | MB-002 | BK-002 | 2026-11-10 | 2026-11-17 | DIPINJAM |
| LN-003 | PINJAM-202610-003 | MB-003 | BK-004 | 2026-10-17 | 2026-10-24 | TERLAMBAT |
| LN-004 | PINJAM-202610-004 | MB-004 | BK-003 | 2026-10-01 | 2026-10-08 | DIKEMBALIKAN |

> Tanggal seed boleh dibuat relatif terhadap "hari ini" agar status TERLAMBAT tetap muncul saat demo.

### User
| username | role | password (demo) |
|---|---|---|
| `admin` | PUSTAKAWAN | `admin123` |
| `1301210001` | MAHASISWA (→ MB-001) | `mahasiswa123` |

## 7. Pembuatan ID

```js
// utils/ids.js
const pad = (n, w = 3) => String(n).padStart(w, '0');
// nextId('BK', buku) -> 'BK-006' (angka terbesar + 1, bukan length + 1,
// agar tidak bentrok setelah ada penghapusan)
```

## 8. Invarian yang Harus Selalu Benar

1. `0 ≤ buku.tersedia ≤ buku.stok`.
2. `buku.tersedia = buku.stok − (jumlah peminjaman aktif untuk buku itu)`.
3. Peminjaman **aktif** selalu menunjuk Anggota dan Buku yang ada (delete induk ditolak 409 selama masih ada peminjaman aktif). Riwayat lama (`DIKEMBALIKAN`) boleh menunjuk induk yang sudah dihapus; frontend menampilkan "(data dihapus)" pada kasus itu. Untuk anggota yang sudah lulus, lebih disarankan menonaktifkan (`statusAktif=false`) daripada menghapus.
4. `nim` dan `email` anggota unik; `username` user unik.
5. `denda ≥ 0` dan kelipatan 2000.
