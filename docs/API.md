# API — Kontrak REST Smart Campus Library

Base URL lokal: `http://localhost:8000` · Prefix data: `/api` · Format: JSON · Charset UTF-8.
**Ini kontrak antara backend dan frontend.** Ubah hanya dengan kesepakatan dan perbarui file ini.

## 1. Konvensi

### Envelope sukses
```json
{ "success": true, "message": "OK", "data": { } }
```
List dengan pagination opsional:
```json
{ "success": true, "message": "OK", "data": [ ], "meta": { "total": 5 } }
```

### Envelope error
```json
{ "success": false, "message": "Stok buku habis", "errors": [ { "field": "bukuId", "message": "tersedia = 0" } ] }
```

### Status code

| Kode | Arti | Contoh |
|---|---|---|
| 200 | OK | GET/PUT/DELETE berhasil |
| 201 | Created | POST berhasil |
| 400 | Bad Request | JSON rusak |
| 401 | Unauthorized | Token hilang/kedaluwarsa |
| 403 | Forbidden | Role tidak cukup |
| 404 | Not Found | id tidak ada |
| 409 | Conflict | NIM duplikat; hapus entitas yang masih punya peminjaman aktif |
| 422 | Unprocessable | Validasi gagal / aturan bisnis ditolak (stok habis, anggota nonaktif) |
| 500 | Server Error | Kesalahan tak terduga |

### Header
- `Content-Type: application/json`
- `Authorization: Bearer <jwt>` untuk semua `/api/*` kecuali `/api/auth/login` dan `/api/auth/register`.

### Peran (role)

| Endpoint | PUSTAKAWAN | MAHASISWA |
|---|---|---|
| Baca katalog buku | ✅ | ✅ |
| CRUD buku | ✅ | ❌ |
| CRUD anggota | ✅ | ❌ (hanya `GET /api/auth/me`) |
| CRUD peminjaman | ✅ | ❌ |
| Checkout | ✅ (untuk anggota mana pun) | ✅ (hanya untuk dirinya) |
| Pengembalian | ✅ | ❌ |
| Riwayat | ✅ semua | ✅ miliknya saja |
| Ringkasan dashboard | ✅ | ❌ |

## 2. Health

### `GET /health` (tanpa auth)
Ringan, tanpa dependensi. Dipakai ALB.
```json
200 { "status": "ok", "uptime": 1234.5, "timestamp": "2026-11-26T08:00:00.000Z", "instance": "ip-10-0-1-23" }
```

## 3. Auth

### `POST /api/auth/register`
```json
{ "nama": "Citra Lestari", "nim": "1301210004", "noTelepon": "081234567890",
  "email": "citra@student.telkomuniversity.ac.id", "jurusan": "Informatika",
  "password": "minimal8kar", "konfirmasiPassword": "minimal8kar" }
```
`201` → `{ data: { user: {id, username, role}, anggota: {...} } }`
Error: `409` NIM/email sudah terdaftar · `422` password < 8 karakter atau konfirmasi tidak sama.

### `POST /api/auth/login`
```json
{ "username": "1301210001", "password": "mahasiswa123" }
```
`200` → `{ data: { token: "<jwt>", user: { id, username, role, anggotaId } } }`
Error: `401` kredensial salah (pesan generik, jangan bocorkan mana yang salah).

### `GET /api/auth/me`
`200` → `{ data: { user, anggota } }`

## 4. Buku (`/api/buku`)

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/buku` | List. Query: `search` (judul/pengarang/isbn/kategori), `kategori` | semua |
| GET | `/api/buku/:id` | Detail | semua |
| POST | `/api/buku` | Tambah | PUSTAKAWAN |
| PUT | `/api/buku/:id` | Ubah | PUSTAKAWAN |
| DELETE | `/api/buku/:id` | Hapus (409 bila ada peminjaman aktif) | PUSTAKAWAN |

Body POST/PUT:
```json
{ "judul": "Microservices Patterns", "pengarang": "Chris Richardson", "penerbit": "Manning Publications",
  "kategori": "Cloud Computing", "tahunTerbit": 2024, "stok": 5, "isbn": "978-161-729-454-9" }
```
Respons contoh (`201`):
```json
{ "success": true, "message": "Buku ditambahkan",
  "data": { "id": "BK-006", "isbn": "978-161-729-454-9", "judul": "Microservices Patterns",
            "pengarang": "Chris Richardson", "penerbit": "Manning Publications", "tahunTerbit": 2024,
            "kategori": "Cloud Computing", "stok": 5, "tersedia": 5 } }
```
`tersedia` tidak boleh dikirim client (diabaikan).

## 5. Anggota (`/api/anggota`)

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/anggota` | List. Query: `search` (nama/nim/email), `aktif=true|false` |
| GET | `/api/anggota/:id` | Detail |
| POST | `/api/anggota` | Registrasi anggota (oleh pustakawan) |
| PUT | `/api/anggota/:id` | Ubah kontak, jurusan, email, `statusAktif` |
| DELETE | `/api/anggota/:id` | Hapus (409 bila ada peminjaman aktif) |

Body POST:
```json
{ "nim": "1301210006", "nama": "Eka Putri", "email": "eka@student.telkomuniversity.ac.id",
  "jurusan": "Informatika", "noTelepon": "081200000000" }
```
`409` bila `nim` atau `email` sudah ada.

## 6. Peminjaman (`/api/peminjaman`)

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/peminjaman` | List. Query: `status=DIPINJAM|DIKEMBALIKAN|TERLAMBAT`, `anggotaId`, `bukuId` |
| GET | `/api/peminjaman/:id` | Detail (disertai ringkasan `anggota` dan `buku`) |
| POST | `/api/peminjaman` | Catat manual (CRUD Create). **Tidak** memotong stok; untuk transaksi normal gunakan `/api/sirkulasi/pinjam` |
| PUT | `/api/peminjaman/:id` | Ubah status, perpanjang `batasKembali`, koreksi `denda` |
| DELETE | `/api/peminjaman/:id` | Hapus arsip. Bila masih aktif, `tersedia` buku dipulihkan (+1) |

Respons list menyertakan nama untuk tabel:
```json
{ "id": "LN-001", "kodePeminjaman": "PINJAM-202611-001", "anggotaId": "MB-001", "bukuId": "BK-001",
  "anggotaNama": "Muhammad Firman", "bukuJudul": "Cloud Computing: Architecture and Patterns",
  "tanggalPinjam": "2026-11-08T03:00:00.000Z", "batasKembali": "2026-11-15T03:00:00.000Z",
  "tanggalKembali": null, "status": "DIPINJAM", "denda": 0 }
```

## 7. Sirkulasi — Fitur Lintas Entitas (`/api/sirkulasi`)

### `POST /api/sirkulasi/pinjam`  *(Checkout)*
```json
{ "anggotaId": "MB-002", "bukuId": "BK-003", "durasiHari": 7 }
```
`durasiHari` opsional (default 7; 1–30).

Urutan validasi: anggota ada → `statusAktif` → buku ada → `tersedia > 0` → (opsional) anggota belum meminjam judul yang sama yang masih aktif.

| Kondisi | Status | message |
|---|---|---|
| Berhasil | 201 | Peminjaman berhasil |
| Anggota/Buku tak ada | 404 | Anggota/Buku tidak ditemukan |
| Anggota nonaktif | 422 | Anggota tidak aktif |
| Stok habis | 422 | Stok buku habis |

`201` → `{ data: <peminjaman>, buku: { id, tersedia } }`

### `POST /api/sirkulasi/kembali`  *(Pengembalian + Denda)*
```json
{ "peminjamanId": "LN-003" }
```
`200` →
```json
{ "success": true, "message": "Buku dikembalikan",
  "data": { "id": "LN-003", "status": "DIKEMBALIKAN", "tanggalKembali": "2026-11-26T08:00:00.000Z",
            "hariTerlambat": 33, "denda": 66000 },
  "buku": { "id": "BK-004", "tersedia": 3 } }
```
Error: `404` peminjaman tidak ada · `422` sudah dikembalikan.

### `GET /api/sirkulasi/ringkasan`  *(Dashboard)*
```json
{ "success": true, "message": "OK", "data": {
  "totalJudul": 5, "totalEksemplar": 25, "eksemplarTersedia": 21,
  "anggotaTerdaftar": 5, "anggotaAktif": 4,
  "peminjamanAktif": 3, "peminjamanTerlambat": 1,
  "peminjamanBerjalan": [ { "...peminjaman aktif..." } ] } }
```
> Angka pada contoh hanya ilustrasi; hitung dari store.

## 8. Contoh `lib/api.js` (acuan frontend)

```js
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.message ?? 'Request gagal'), { status: res.status, errors: json.errors });
  return json;
}

export const api = {
  health: () => request('/health'),
  login: (b) => request('/api/auth/login', { method: 'POST', body: b }),
  listBuku: (q = '', token) => request(`/api/buku?search=${encodeURIComponent(q)}`, { token }),
  pinjam: (b, token) => request('/api/sirkulasi/pinjam', { method: 'POST', body: b, token }),
  kembali: (id, token) => request('/api/sirkulasi/kembali', { method: 'POST', body: { peminjamanId: id }, token }),
  ringkasan: (token) => request('/api/sirkulasi/ringkasan', { token }),
};
```

## 9. Contoh Uji Cepat (curl)

```bash
curl -s localhost:8000/health
TOKEN=$(curl -s -X POST localhost:8000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r .data.token)
curl -s localhost:8000/api/buku -H "Authorization: Bearer $TOKEN"
curl -s -X POST localhost:8000/api/sirkulasi/pinjam -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"anggotaId":"MB-002","bukuId":"BK-003"}'
```

## 10. Pemetaan ke 15 Fitur Tugas 9

| # | Fitur | Endpoint |
|---|---|---|
| 1–4 | CRUD Buku | `POST/GET/PUT/DELETE /api/buku` |
| 5–8 | CRUD Anggota | `POST/GET/PUT/DELETE /api/anggota` |
| 9–12 | CRUD Peminjaman | `POST/GET/PUT/DELETE /api/peminjaman` |
| 13 | Checkout Peminjaman | `POST /api/sirkulasi/pinjam` |
| 14 | Pengembalian dan Denda | `POST /api/sirkulasi/kembali` |
| 15 | Dashboard Monitoring | `GET /api/sirkulasi/ringkasan` |
