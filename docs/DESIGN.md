# DESIGN — Design System, Wireframe, dan Navigation Flow

Dokumen ini menjawab **Soal 1 Tugas-11** (tabel keputusan desain) dan menjadi acuan visual frontend.

> ⚠️ **Verifikasi nilai warna dan font** terhadap file wireframe Tugas 10 (Figma/gambar) sebelum final. Hex di bawah adalah **estimasi** dari tampilan wireframe (palet merah–navy–krem–kuning, font bergaya Poppins). Jika berbeda, perbarui tabel ini dan `tailwind.config.js`.

## 1. Tabel Keputusan Desain (format soal)

| Component | Answer |
|---|---|
| Main Color & Secondary Color | Main: Merah `#DC2626` (aksi utama, brand). Secondary: Navy `#14213D` (navbar/panel gelap, teks heading) |
| Accent / Neutral | Aksen: Kuning `#F4B13E`; Slate-biru `#3E4C78`; Background krem `#F6F4F0`; Putih `#FFFFFF` |
| Status Colors | Success `#16A34A` (Dikembalikan/Tersedia), Warning `#D97706` (Dipinjam), Danger `#DC2626` (Terlambat/Hapus), Info `#2563EB` |
| Main Font & Secondary Font | Main: **Poppins** (heading, tombol, label). Secondary: **Inter** (body, tabel). Monospace: **JetBrains Mono** (kode transaksi, ISBN) |
| Navigation flow for each use case | Lihat bagian 4 |
| Reusable elements | Button, StatCard, DataTable, StatusBadge, SearchBar, FormDialog (Modal), ConfirmDialog, Navbar, BackendStatus pill, Input/Select, Toast, EmptyState, Skeleton |
| Layout & Grid | Container maks 1200px, grid 12 kolom, gap 16/24px; Login/Register split-screen 50:50 |
| Spacing & Radius | Skala 4px (4/8/12/16/24/32); radius kartu 12px, tombol dan input 8px, badge penuh (pill) |
| Iconography | `lucide-react`, stroke 1.75px, ukuran 16/20px |
| Responsive breakpoint | Tailwind default: `sm 640`, `md 768`, `lg 1024`, `xl 1280`; tabel scroll horizontal di mobile |
| Feedback & state | Loading (skeleton/spinner di tombol), Empty, Error (toast + pesan inline), Success (toast) |
| Validation style | Label di atas input, pesan error merah di bawah field, tanda `*` untuk wajib |

## 2. Design Tokens

### Warna (Tailwind)
```js
// tailwind.config.js → theme.extend.colors
colors: {
  brand:   { DEFAULT: '#DC2626', hover: '#B91C1C', soft: '#FEE2E2' },
  navy:    { DEFAULT: '#14213D', 700: '#1E2D50', 500: '#3E4C78' },
  cream:   '#F6F4F0',
  accent:  '#F4B13E',
  success: { DEFAULT: '#16A34A', soft: '#DCFCE7' },
  warning: { DEFAULT: '#D97706', soft: '#FEF3C7' },
  danger:  { DEFAULT: '#DC2626', soft: '#FEE2E2' },
  ink:     { DEFAULT: '#111827', muted: '#6B7280', line: '#E5E7EB' },
}
```

### Tipografi

| Peran | Font | Ukuran / Berat |
|---|---|---|
| H1 | Poppins | 28–32px / 600 |
| H2 | Poppins | 20–24px / 600 |
| H3 / judul kartu | Poppins | 16–18px / 600 |
| Body | Inter | 14–16px / 400 |
| Label & tombol | Poppins | 13–14px / 500 |
| Caption | Inter | 12px / 400 |
| Kode (ISBN, PINJAM-…) | JetBrains Mono | 12–13px / 400 |

Muat lewat `next/font/google` (Poppins, Inter, JetBrains_Mono).

### Elevasi
Kartu: `border 1px ink-line` + shadow tipis (`0 1px 2px rgba(0,0,0,.05)`). Modal: shadow `0 20px 40px rgba(0,0,0,.18)` dan overlay `navy/60`.

## 3. Komponen Reusable

| Komponen | Props utama | Varian / Perilaku |
|---|---|---|
| `Button` | `variant`, `size`, `loading`, `disabled` | `primary` (merah), `outline` (hijau tipis untuk "Kembalikan"), `ghost`, `danger`; `loading` menampilkan spinner dan menonaktifkan klik |
| `StatCard` | `icon`, `label`, `value`, `hint` | Dipakai 4× di Dashboard; ikon dalam kotak berwarna lembut |
| `DataTable` | `columns`, `rows`, `loading`, `emptyText` | Header abu muda, baris hover, scroll-x di mobile |
| `StatusBadge` | `status` | `DIPINJAM`=kuning lembut, `TERLAMBAT`=merah lembut, `DIKEMBALIKAN`=hijau lembut, `Aktif`/`Nonaktif` |
| `SearchBar` | `value`, `onChange`, `placeholder` | Debounce 300ms; ikon cari di kiri |
| `FormDialog` | `title`, `onSubmit`, `onClose`, `loading` | Modal; tombol **Batal** dan **Simpan**; validasi wajib; grid 2–3 kolom |
| `ConfirmDialog` | `title`, `message`, `onConfirm` | Wajib untuk aksi Hapus |
| `Navbar` | `active`, `user` | Logo "TL Smart Campus Library", menu, avatar + Logout, `BackendStatus` |
| `BackendStatus` | — | Pill "Backend: Online (Port 8000)"; polling `GET /health` tiap 30 detik; merah bila gagal |
| `Toast` | `type`, `message` | Sukses/gagal setelah aksi |
| `EmptyState` | `title`, `action` | Saat data kosong |

## 4. Daftar Halaman dan Wireframe

| # | Halaman | Route | Sumber wireframe | Status |
|---|---|---|---|---|
| 1 | Login | `/login` | Tugas 10 | ✅ ada |
| 2 | Register | `/register` | Tugas 10 | ✅ ada |
| 3 | Dashboard | `/dashboard` | Tugas 10 (lebih rapi) / Tugas 9 | ✅ ada |
| 4 | Katalog Buku | `/buku` | Tugas 9 | ✅ ada |
| 5 | Form Tambah/Ubah Buku (modal) | `/buku` (modal) | Tugas 9 | ✅ ada |
| 6 | Sirkulasi | `/sirkulasi` | Tugas 9 | ✅ ada |
| 7 | Data Anggota | `/anggota` | — | ❌ **perlu dibuat** |
| 8 | Riwayat Peminjaman | `/riwayat` | — | ❌ **perlu dibuat** |

### Isi tiap halaman

**Login** — Panel kiri navy (logo, headline "Perpustakaan kampus, dalam satu sistem.", ilustrasi batang berwarna). Panel kanan krem: field NIM/NIP atau email, Password, link "Lupa password?", tombol **Login**, link "Daftar sekarang".

**Register** — Panel kiri navy (headline "Satu akun untuk seluruh layanan pustaka.", 3 poin manfaat dengan ceklis). Form: Nama lengkap, NIM/NIP + No. telepon (2 kolom), Email kampus, Jurusan, Password + Konfirmasi (2 kolom), tombol **Daftar**, link "Sudah punya akun? Login".

**Dashboard** — Navbar; judul "Dashboard Perpustakaan" + tombol **Catat Peminjaman**; 4 `StatCard` (Total koleksi, Siap dipinjam, Pemustaka, Peminjaman aktif); tabel "Peminjaman sedang berlangsung" (Kode, Peminjam, Judul buku, Tenggat, Status, Aksi **Kembalikan**); link "Lihat semua riwayat".

**Katalog Buku** — Judul "Manajemen Master Koleksi Buku (CRUD)"; `SearchBar` (judul/pengarang/ISBN/kategori), tombol **Refresh Data**, tombol **+ Tambah Buku Baru**; tabel: ID & ISBN, Judul, Pengarang & Penerbit, Kategori & Tahun, Stok tersedia (`4/5 Item`), Aksi **Edit** / **Hapus**.

**Form Buku (modal)** — Judul*, Pengarang*, Penerbit, Kategori, Tahun terbit, Jumlah stok*, ISBN; **Batal** / **Simpan Buku** (loading).

**Sirkulasi** — Dua panel. Kiri: form Checkout (pilih Anggota, pilih Buku dengan info tersedia, Durasi 7 hari, tombol **Eksekusi Checkout**) + kotak "Logika bisnis". Kanan: daftar peminjaman aktif dengan tombol **Proses Pengembalian** dan badge status/denda.

**Data Anggota (baru)** — Mengikuti pola Katalog: judul "Manajemen Data Anggota (CRUD)", `SearchBar` (nama/NIM/email), filter Aktif/Nonaktif, **+ Tambah Anggota**; tabel: ID, NIM, Nama, Email, Jurusan, No. telepon, Status (badge), Aksi Edit/Hapus. Modal form: NIM*, Nama*, Email*, Jurusan, No. telepon, toggle Status aktif.

**Riwayat Peminjaman (baru)** — Judul "Riwayat Peminjaman", filter status (Semua/Dipinjam/Terlambat/Dikembalikan), `SearchBar` kode/peminjam/judul; tabel: Kode, Peminjam, Judul, Tgl pinjam, Batas kembali, Tgl kembali, Status, Denda (`Rp…`), Aksi (Ubah/Hapus arsip untuk pustakawan). Mahasiswa hanya melihat miliknya.

## 5. Navigation Flow per Use Case

Navbar: **Dashboard · Katalog Buku · Data Anggota · Sirkulasi · Riwayat** (mahasiswa hanya melihat *Katalog Buku* dan *Riwayat*).

| Use Case | Aktor | Alur navigasi |
|---|---|---|
| Register | Mahasiswa | `/login` → "Daftar sekarang" → `/register` → isi form → **Daftar** → `/login` (toast sukses) |
| Login | Semua | `/login` → isi → **Login** → Pustakawan: `/dashboard`; Mahasiswa: `/buku` |
| Logout | Semua | Avatar → **Logout** → `/login` |
| UC Cari Katalog | Mahasiswa | `/buku` → `SearchBar` → hasil terfilter → lihat ketersediaan |
| UC Kelola Buku (CRUD) | Pustakawan | `/buku` → **+ Tambah** → modal → **Simpan** → tabel ter-refresh · **Edit** → modal terisi → **Simpan** · **Hapus** → ConfirmDialog → hapus (409 → toast "masih dipinjam") |
| UC Kelola Anggota (CRUD) | Pustakawan | `/anggota` → **+ Tambah** / **Edit** / **Hapus** (pola sama dengan buku) |
| UC Checkout | Pustakawan / Mahasiswa | Dashboard → **Catat Peminjaman** → `/sirkulasi` → pilih anggota, buku, durasi → **Eksekusi Checkout** → toast sukses → daftar kanan bertambah |
| UC Pengembalian | Pustakawan | Dashboard atau `/sirkulasi` → **Kembalikan** / **Proses Pengembalian** → ConfirmDialog → toast (denda bila ada) → stok pulih |
| UC Kelola Peminjaman | Pustakawan | `/riwayat` → filter → **Ubah** (status/tenggat/denda) atau **Hapus arsip** |
| UC Lihat Riwayat | Mahasiswa | `/riwayat` → daftar pinjaman pribadi |
| UC Monitoring | Pustakawan | `/dashboard` → kartu ringkasan + tabel aktif → "Lihat semua riwayat" → `/riwayat` |
| UC Cek Kesehatan Server | Pustakawan | `BackendStatus` di Navbar (otomatis) |

### Diagram alur ringkas
```
/login ──(Daftar sekarang)──► /register ──► /login
  │ (PUSTAKAWAN)                        │ (MAHASISWA)
  ▼                                     ▼
/dashboard ─► /sirkulasi              /buku ─► /riwayat
   │  ├─► /buku    ├─► /anggota
   │  └─► /riwayat └─► (Catat Peminjaman → /sirkulasi)
```

## 6. Aturan UI

- Tombol aksi utama **merah**, aksi positif sekunder (Kembalikan) **outline hijau**, aksi berbahaya (Hapus) **merah outline** + konfirmasi.
- Tanggal ditampilkan `dd MMM yyyy` (contoh `15 Nov 2026`); uang `Rp2.000` (`Intl.NumberFormat('id-ID')`).
- Stok tampil `tersedia/stok`; hijau bila > 0, merah bila 0.
- Semua tabel punya state loading (skeleton), kosong (EmptyState), dan error (toast).
- Form: tombol Simpan dinonaktifkan selama loading untuk mencegah submit ganda.
- Kontras teks minimal WCAG AA; fokus keyboard terlihat.
- Bahasa UI: **Indonesia**.

## 7. Checklist Wireframe (Soal 1)

- [ ] Tabel keputusan desain terisi (bagian 1)
- [ ] Login, Register, Dashboard (dari Tugas 10) dirapikan ke high-fidelity
- [ ] Katalog Buku + modal form, Sirkulasi (dari Tugas 9) ditingkatkan ke high-fidelity
- [ ] **Data Anggota** dan **Riwayat** dibuat baru
- [ ] Semua halaman memakai token warna, font, dan komponen yang sama
- [ ] Alur navigasi tiap use case dapat ditelusuri dari wireframe
