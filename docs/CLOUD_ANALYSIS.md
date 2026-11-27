# CLOUD ANALYSIS — Masalah Arsitektur Awal dan Arsitektur Usulan

Menjawab **Soal 4** (arsitektur awal + 3 masalah) dan **Soal 5** (arsitektur usulan + justifikasi).
Setiap masalah dijelaskan per komponen: **apa → mengapa jadi masalah → pemicu di aplikasi ini → dampak → cara mengukur**.

---

## Bagian A — Arsitektur Awal (Soal 4, bobot 5)

```
                    Internet
                        │  HTTP
                        ▼
        ┌──────────────────────────────────┐
        │  EC2 t3.micro (Ubuntu, 8 GiB)    │   ← 1 instance, 1 Availability Zone
        │  ┌────────────────────────────┐  │
        │  │ Express API :8000          │  │
        │  │ data in-memory (store.js)  │  │
        │  │ healthcheck.sh             │  │
        │  └────────────────────────────┘  │
        └──────────────────────────────────┘
```
Ciri: satu server, satu AZ, tanpa load balancer, tanpa auto scaling, tanpa redundancy.

---

## Bagian B — 3 Masalah (Soal 4, bobot 15; masing-masing 5)

> Disarankan: kesepakatan tiga masalah ini dibuat bersama, lalu tiap orang menulis satu.

### Masalah 1 — Single Point of Failure (Ketersediaan)

| Komponen | Penjelasan |
|---|---|
| **Apa** | Seluruh layanan bergantung pada satu instance EC2 di satu AZ. Bila instance, proses Node.js, atau AZ-nya bermasalah, **seluruh aplikasi mati**. |
| **Mengapa menjadi masalah** | Tidak ada cadangan yang bisa mengambil alih. Ketersediaan sistem = ketersediaan satu komponen terlemah. Pada perpustakaan kampus, mahasiswa dan pustakawan tidak bisa mencari buku, meminjam, atau mengembalikan selama server mati. |
| **Pemicu di aplikasi ini** | Proses Node.js crash (error tak tertangani), instance gagal *status check*, reboot/maintenance, gangguan AZ, deploy versi baru yang membutuhkan restart. |
| **Dampak khusus** | Karena data **in-memory**, restart juga menghapus seluruh perubahan (peminjaman baru, stok) dan kembali ke seed. Downtime = layanan berhenti **dan** data operasional hilang. |
| **Cara mengukur** | Uptime %, jumlah gagal pada `healthcheck.sh`, waktu pemulihan setelah `systemctl stop/start` (MTTR). |

### Masalah 2 — Overload / Skalabilitas Terbatas saat Lonjakan Trafik

| Komponen | Penjelasan |
|---|---|
| **Apa** | Kapasitas tetap (`t3.micro`: 2 vCPU burstable, 1 GiB RAM). Tidak ada mekanisme menambah kapasitas saat beban naik. |
| **Mengapa menjadi masalah** | Saat permintaan melebihi kapasitas, antrean request menumpuk, CPU dan memori jenuh, respons melambat lalu **timeout/error 5xx**. Instance burstable juga kehabisan *CPU credits* bila beban tinggi berkepanjangan sehingga performanya turun tajam. |
| **Pemicu di aplikasi ini** | Musim **UAS**/tugas akhir, awal semester, atau pengumuman peminjaman massal: banyak mahasiswa mencari katalog dan checkout bersamaan. Skala *vertical* (naikkan tipe instance) butuh **restart** dan punya batas atas. |
| **Dampak khusus** | Pencarian katalog lambat, checkout gagal di jam sibuk, antrean kembali ke meja manual. Setelah beban turun, kapasitas berlebih tetap dibayar. |
| **Cara mengukur** | CloudWatch `CPUUtilization`, `CPUCreditBalance`, `NetworkIn`; uji beban (`ab`) dengan konkurensi naik bertahap sampai error muncul. |

### Masalah 3 — Latency (Waktu Respons) Tinggi

| Komponen | Penjelasan |
|---|---|
| **Apa** | Waktu tunggu dari permintaan dikirim sampai respons diterima (round-trip). Terdiri dari jarak jaringan (propagation), waktu antre di server, dan waktu proses aplikasi. |
| **Mengapa menjadi masalah** | Latency tinggi membuat aplikasi terasa lambat dan menurunkan pengalaman pengguna; pada transaksi (checkout/pengembalian) pengguna mengulang klik sehingga **beban bertambah** dan memperburuk keadaan. Latency juga naik bersama beban karena permintaan mengantre pada satu server. |
| **Pemicu di aplikasi ini** | (1) Region jauh dari pengguna di Bandung; (2) satu server melayani semua permintaan sehingga antre saat ramai; (3) tanpa *health-aware routing*, permintaan tetap dikirim ke server yang lambat; (4) frontend dan API di satu mesin berebut CPU. |
| **Dampak khusus** | Katalog lama tampil, form lambat merespons, indikator "Backend: Online" tidak menjamin cepat. |
| **Cara mengukur** | `response_ms` di `healthcheck.sh` (dari localhost vs dari laptop), rata-rata/p95, `TargetResponseTime` di ALB (bila dipakai). |

### Ringkasan Masalah

| # | Masalah | Konsep terkait | Inti dampak |
|---|---|---|---|
| 1 | Single Point of Failure | Redundancy, Availability Zones | Layanan mati total |
| 2 | Overload / skalabilitas terbatas | Auto Scaling, Load Balancer | Error dan lambat saat ramai |
| 3 | Latency tinggi | Latency, Load Balancer | Pengalaman pengguna buruk |

---

## Bagian C — Arsitektur Usulan (Soal 5, bobot 10)

Menggunakan **three-tier** dan konsep Load Balancer, Availability Zones, Auto Scaling, Redundancy, Latency. **Tanpa storage tambahan.**

```
                           Internet / Pengguna
                                   │ HTTP(S)
                                   ▼
                   ┌───────────────────────────────┐
                   │ Application Load Balancer     │  ← multi-AZ, health check,
                   │ listener :80                  │    algoritma round-robin
                   │  /api/*  → tg-backend         │
                   │  default → tg-frontend        │
                   └───────┬───────────────┬───────┘
         ┌─────────────────┘               └──────────────────┐
         ▼                                                    ▼
┌──────────────────── AZ-a ─────────────────┐  ┌──────────────────── AZ-b ─────────────────┐
│ TIER 1 Presentation (ASG-frontend)         │  │ TIER 1 Presentation (ASG-frontend)         │
│  EC2: Next.js :3001                        │  │  EC2: Next.js :3001                        │
│ TIER 2 Application (ASG-backend)           │  │ TIER 2 Application (ASG-backend)           │
│  EC2: Express :8000  (/health)             │  │  EC2: Express :8000  (/health)             │
│ TIER 3 Data: in-memory (di tiap instance)  │  │ TIER 3 Data: in-memory (di tiap instance)  │
└────────────────────────────────────────────┘  └────────────────────────────────────────────┘
        ▲                                                        ▲
        └──────── Auto Scaling: min 2 · desired 2 · max 4 ───────┘
                  kebijakan: target tracking CPU ≈ 60%
                  CloudWatch: CPUUtilization, TargetResponseTime
```

### Komponen

| Komponen | Konfigurasi |
|---|---|
| ALB | Internet-facing, subnet publik di **2 AZ**, listener 80 (HTTPS bila ada sertifikat), health check |
| `tg-frontend` | Target Next.js :3001, health check `/` |
| `tg-backend` | Target Express :8000, health check `/health`, interval 15–30 dtk, *unhealthy threshold* 2–3 |
| ASG-frontend | Launch template, min 2 / desired 2 / max 4, tersebar di AZ-a dan AZ-b |
| ASG-backend | Launch template + user data `ec2-bootstrap.sh`, min 2 / desired 2 / max 4, tersebar di 2 AZ |
| Scaling policy | Target tracking CPU 60% (opsional: *scheduled scaling* sebelum UAS) |
| Connection draining | *Deregistration delay* ~30 dtk agar request berjalan selesai saat scale-in |
| Security | SG ALB: 80 dari internet. SG instance: 8000/3001 **hanya dari SG ALB** |
| Storage | **Tidak ada tambahan** (root volume 8 GiB per instance saja) |

---

## Bagian D — Justifikasi (Soal 5, bobot 10)

### D.1 Bagaimana arsitektur menyelesaikan tiap masalah

| Masalah | Solusi pada arsitektur usulan | Konsep |
|---|---|---|
| 1. Single Point of Failure | Minimal **2 instance per tier** di **2 AZ**. Bila satu instance atau satu AZ gagal, ALB berhenti mengirim ke target `unhealthy` dan instance di AZ lain tetap melayani. ASG otomatis **mengganti** instance yang gagal (self-healing) untuk menjaga *desired capacity*. | Redundancy, Availability Zones, Load Balancer (health check), Auto Scaling |
| 2. Overload / skalabilitas | **Scale-out otomatis**: saat rata-rata CPU > 60%, ASG menambah instance (hingga max 4) tanpa downtime; ALB mendistribusikan beban ke semuanya. Saat sepi, **scale-in** mengurangi instance agar biaya sesuai pemakaian. *Scheduled scaling* menyiapkan kapasitas sebelum UAS. | Auto Scaling (scale-out/in), Load Balancer |
| 3. Latency | Beban dibagi sehingga **antrean per server pendek**. ALB hanya merutekan ke target sehat, tidak ke server lambat/mati. Frontend dan API **dipisah tier** sehingga tidak berebut CPU. Region dipilih dekat pengguna (Singapore/Jakarta). *Opsional:* algoritma *least outstanding requests* untuk beban tak seragam (lihat Tugas 9). | Latency, Load Balancer, pemisahan tier |

### D.2 Justifikasi per komponen

| Komponen | Mengapa dipilih |
|---|---|
| **Load Balancer (ALB)** | Satu titik masuk yang membagi beban, melakukan health check, dan menyembunyikan jumlah server dari pengguna. ALB bekerja di layer 7 sehingga bisa routing `/api/*` ke backend dan sisanya ke frontend dalam satu DNS. Round-robin cocok karena server homogen dan request relatif seragam. |
| **Availability Zones (≥ 2)** | AZ adalah data center terpisah dalam satu region; kegagalan satu AZ tidak otomatis menjatuhkan AZ lain. Menyebar instance ke 2 AZ menghilangkan SPOF tingkat fasilitas dengan latency antar-AZ yang tetap rendah (satu region). |
| **Auto Scaling Group** | Menjaga jumlah instance minimum (ketahanan), menambah saat ramai, mengurangi saat sepi, dan mengganti instance rusak. Memakai launch template + user data sehingga instance baru identik dan siap otomatis. |
| **Redundancy** | Duplikasi instance di tiap tier (N ≥ 2) memastikan ada cadangan aktif (*active-active*), bukan cadangan pasif yang harus dinyalakan manual. |
| **Pemisahan three-tier** | Presentation, Application, dan Data bisa di-scale dan diperbaiki terpisah; backend yang berat tidak mengganggu penyajian UI; kebutuhan kapasitas tiap tier berbeda. |
| **Latency** | Dikendalikan lewat pemilihan region, pembagian beban, routing hanya ke target sehat, dan pemisahan tier. Diukur dengan `TargetResponseTime` dan `healthcheck.sh`. |
| **Security Group berlapis** | Instance tidak terbuka langsung ke internet; hanya ALB yang boleh mengakses port aplikasi. |
| **Tanpa storage tambahan** | Sesuai batasan soal; aplikasi tidak butuh disk karena data in-memory. |

### D.3 Trade-off dan Keterbatasan (tuliskan dengan jujur)

| Hal | Penjelasan |
|---|---|
| **Konsistensi data in-memory** | Tiap instance backend memegang salinan data sendiri. Perubahan di instance A tidak terlihat di B; scale-in/restart menghapus perubahan. Karena soal melarang storage tambahan, ini diterima sebagai **keterbatasan**; pada produksi, state dipindah ke database terkelola. *Sticky sessions* dapat mengurangi gejala (satu pengguna ke satu instance) tetapi bukan solusi penuh. |
| **JWT stateless** | Agar login berlaku di semua instance, `JWT_SECRET` harus **sama** (set lewat launch template/user data, jangan acak per instance). |
| **Biaya** | ≥ 4 instance + ALB lebih mahal daripada 1 instance. Dibatasi dengan `t3.micro`, max 4, dan **dihapus** setelah dokumentasi. |
| **Kompleksitas** | Lebih banyak komponen untuk dikelola dan dipantau. |
| **Round-robin tidak sadar beban** | Cukup untuk server homogen; bila durasi request sangat beragam, pertimbangkan *least outstanding requests*. |
| **Satu region** | Arsitektur melindungi dari kegagalan AZ, bukan dari kegagalan region. |

### D.4 Skenario Uji (untuk bukti)

| Skenario | Langkah | Hasil yang diharapkan |
|---|---|---|
| Kegagalan instance | Stop satu instance backend | Target `unhealthy`, trafik ke instance lain, ASG membuat pengganti |
| Lonjakan beban | `ab -n 5000 -c 100` ke DNS ALB | CPU naik → ASG scale-out → latency kembali turun |
| Beban turun | Hentikan uji | Scale-in setelah cooldown dengan connection draining |
| Distribusi | `curl` berulang ke `/health` | Field `instance` berganti-ganti (bukti round-robin) |

---

## Bagian E — Kerangka Jawaban Siap Salin

**Soal 4:** gambar Bagian A, lalu tiga tabel masalah di Bagian B (tiap anggota satu masalah, format *Apa / Mengapa / Pemicu / Dampak / Cara mengukur*).

**Soal 5:** gambar Bagian C, lalu D.1 (menyelesaikan masalah), D.2 (justifikasi komponen), D.3 (keterbatasan).
