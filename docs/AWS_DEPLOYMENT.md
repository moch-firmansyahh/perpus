# AWS DEPLOYMENT — EC2, Bash Script, Analisis, Teardown

Menjawab **Soal 3** (EC2 + bash + analisis) dan **Soal 6** (hapus resource).
Akun AWS: kredit **$100** (masa berlaku ±182 hari sejak pembuatan akun). Pantau selalu **Billing → Credits**.

> ⚠️ Nilai harga dan ketersediaan tipe instance **berubah**. Cek AWS Pricing Calculator dan halaman Free Tier/Credits sebelum membuat resource. Dokumen ini tidak mencantumkan harga pasti.

---

## 1. Persiapan (sekali saja)

| Langkah | Detail |
|---|---|
| 1. Region | Pilih satu region dan **jangan pindah-pindah** (disarankan dekat Bandung: Singapore `ap-southeast-1` atau Jakarta `ap-southeast-3`; cek apakah layanan yang dibutuhkan tersedia) |
| 2. Budget alarm | **Billing → Budgets** → buat budget kecil (mis. USD 5–10) dengan notifikasi email 50% / 80% |
| 3. IAM | Jangan pakai root untuk kerja harian. Buat IAM user per anggota (atau satu user bersama) dan aktifkan MFA di root |
| 4. Key pair | EC2 → Key Pairs → buat `smartlib-key` (`.pem`); simpan aman, **jangan commit** |
| 5. Repo | Pastikan kode backend ada di GitHub (repo publik, atau privat dengan deploy token) |

## 2. Spesifikasi EC2 (Soal 3)

| Parameter | Pilihan | Alasan |
|---|---|---|
| AMI | Ubuntu Server 24.04 LTS (x86_64) | Umum, dokumentasi banyak |
| Instance type | `t3.micro` (atau `t2.micro` bila region/akun menawarkannya sebagai free-tier) | Cukup untuk Express + data in-memory kecil; murah |
| Storage | **8 GiB gp3** (root volume saja) | Kapasitas minimum yang cukup untuk OS + Node + app; hemat budget. Tidak ada volume tambahan |
| Network | Default VPC, subnet publik, auto-assign public IP | Sederhana untuk demo |
| Security Group | `smartlib-sg`: **22** dari *My IP*; **8000** dari *My IP* (atau `0.0.0.0/0` hanya untuk uji singkat); **3001** bila frontend ikut di-host | Prinsip least privilege |
| Key pair | `smartlib-key` | SSH |
| Tags | `Name=smartlib-ec2`, `Project=smartlib`, `Owner=<nama>` | Memudahkan pencarian saat teardown |
| User data | *(opsional)* isi `scripts/ec2-bootstrap.sh` | Otomatisasi |

Mengapa 8 GB: image Ubuntu + Node.js + dependensi npm biasanya jauh di bawah 8 GB dan aplikasi tidak menulis ke disk (data in-memory). Menambah disk = biaya tanpa manfaat.

## 3. Langkah Pembuatan (Console)

1. EC2 → **Launch instance** → isi nama `smartlib-ec2`.
2. Pilih AMI Ubuntu 24.04 LTS → instance type `t3.micro`.
3. Key pair `smartlib-key`.
4. Network settings → **Create security group** `smartlib-sg` sesuai tabel di atas.
5. Configure storage → **8 GiB gp3**.
6. Launch → tunggu status **2/2 checks passed**.
7. 📸 Screenshot: ringkasan instance (ID, tipe, AZ, public IP, volume 8 GiB).

## 4. Masuk dan Menjalankan Script

```bash
chmod 400 smartlib-key.pem
ssh -i smartlib-key.pem ubuntu@<PUBLIC_IP>

# di server
git clone https://github.com/<username>/<repo>.git
cd <repo>/scripts
chmod +x ec2-bootstrap.sh healthcheck.sh
sudo bash ec2-bootstrap.sh          # pasang Node, jalankan backend sebagai service systemd
./healthcheck.sh http://localhost:8000/health 5 24
```

Uji dari laptop:
```bash
curl http://<PUBLIC_IP>:8000/health
curl http://<PUBLIC_IP>:8000/api/buku -H "Authorization: Bearer <token>"
```

📸 Screenshot: (a) output `ec2-bootstrap.sh` sukses, (b) `systemctl status smartlib-backend`, (c) output ringkasan `healthcheck.sh`, (d) `curl` dari luar.

### Script yang dikumpulkan
| File | Fungsi |
|---|---|
| `scripts/ec2-bootstrap.sh` | Pasang Node.js, ambil kode, buat service systemd, tunggu `/health` |
| `scripts/healthcheck.sh` | **Script bash sederhana** untuk Soal 3: memantau `/health`, mencatat status, latency, load, memori, disk ke CSV |

## 5. Analisis (Soal 3)

Isi dengan **data nyata** dari `healthcheck.csv` dan CloudWatch. Kerangka:

| Aspek | Yang diamati | Cara mengukur |
|---|---|---|
| Latency | Rata-rata, minimum, maksimum `response_ms` | Ringkasan `healthcheck.sh`; bandingkan akses **dari dalam server** (localhost) vs **dari laptop di Bandung** |
| Ketersediaan | Jumlah sukses/gagal; apa yang terjadi bila `systemctl stop smartlib-backend` | Uji manual, catat downtime |
| Utilisasi | CPU, memori, disk | `load_1m`, `mem_used_pct`, `disk_used_pct`; CloudWatch → CPUUtilization |
| Kapasitas | Batas beban satu instance | Uji beban ringan (`ab`/`hey`), catat saat latency naik atau error muncul |
| Biaya | Estimasi per jam dan per hari | AWS Pricing Calculator, Cost Explorer |
| Risiko | Single point of failure, tanpa redundancy | Lihat `CLOUD_ANALYSIS.md` |

Contoh uji beban singkat (opsional, jangan berlebihan agar tidak ada biaya data transfer besar):
```bash
sudo apt-get install -y apache2-utils
ab -n 500 -c 20 http://localhost:8000/health
```

## 6. Arsitektur Awal (untuk Soal 4)

```
 Pengguna ──HTTP──►  [ 1 × EC2 t3.micro, 1 AZ ]
                      ├─ Express :8000 (+ data in-memory)
                      ├─ (opsional) Next.js :3001
                      └─ healthcheck.sh
```
Satu instance, satu AZ, tanpa load balancer, tanpa auto scaling. Gambar ini yang dipakai di Soal 4; masalahnya diuraikan di `CLOUD_ANALYSIS.md`.

## 7. Arsitektur Usulan (untuk Soal 5) — Ringkas

Dokumen konsep, **tidak wajib dibuat sungguhan** kecuali dosen meminta (biaya). Bila ingin diuji, lakukan singkat lalu hapus.

| Komponen | Konfigurasi |
|---|---|
| Application Load Balancer | Internet-facing, 2 subnet di 2 AZ, listener 80 |
| Target Group `tg-frontend` | Port 3001, health check `/` |
| Target Group `tg-backend` | Port 8000, health check `/health` |
| Listener rule | `/api/*` → `tg-backend`; default → `tg-frontend` |
| Auto Scaling Group (backend) | Launch template (AMI + user data bootstrap), min 2 / desired 2 / max 4, subnet di 2 AZ, target tracking CPU 60% |
| Auto Scaling Group (frontend) | Min 2 / desired 2 / max 4 |
| Security Group | ALB menerima 80 dari internet; instance hanya menerima 8000/3001 **dari SG ALB** |
| Storage | Tidak ada tambahan (batasan soal) |

Hemat biaya: gunakan subnet publik (hindari NAT Gateway), `t3.micro`, dan hapus segera setelah screenshot.

## 8. Teardown (Soal 6) — WAJIB

> Lakukan **setelah** semua screenshot dan dokumentasi selesai dan disetujui anggota. Setelah dihapus, tidak bisa dipulihkan.

### Urutan penghapusan
1. **Auto Scaling Group** → set min/desired/max = 0 lalu **Delete** (menghentikan instance otomatis).
2. **Load Balancer** (ALB) → Delete.
3. **Target Groups** → Delete.
4. **Launch Template** → Delete.
5. **EC2 instance** (`smartlib-ec2`) → **Terminate** (bukan hanya Stop; Stop masih menagih EBS).
6. **EBS Volumes** → pastikan daftar kosong (volume yatim → Delete).
7. **Elastic IP** (bila pernah dibuat) → Release.
8. **Security Group** `smartlib-sg` / `alb-sg` → Delete (setelah instance hilang).
9. **Key pair** `smartlib-key` → Delete (opsional) dan hapus `.pem` lokal bila tidak dipakai lagi.
10. **CloudWatch**: hapus alarm/dashboard buatan sendiri.
11. Cek **Billing → Bills** dan **Cost Explorer**; biarkan **AWS Budgets** aktif beberapa hari.

### Verifikasi (📸 screenshot untuk Soal 6)
Ambil screenshot yang menunjukkan **kosong** / **terminated** untuk:
- EC2 → Instances (status *Terminated* atau daftar kosong; filter semua state)
- EC2 → Volumes (kosong)
- EC2 → Load Balancers (kosong) dan Target Groups (kosong)
- EC2 → Auto Scaling Groups (kosong)
- EC2 → Elastic IPs (kosong)
- EC2 → Security Groups (hanya `default`)
- Billing → Credits (sisa kredit) dan Cost Explorer (tidak ada biaya berjalan)
- **Pastikan region yang tepat terlihat di pojok kanan atas screenshot.**

### Verifikasi via CLI (opsional)
```bash
REGION=ap-southeast-1   # ganti sesuai region
aws ec2 describe-instances --region $REGION \
  --query 'Reservations[].Instances[?State.Name!=`terminated`].[InstanceId,State.Name]' --output table
aws ec2 describe-volumes --region $REGION --query 'Volumes[].VolumeId'
aws elbv2 describe-load-balancers --region $REGION --query 'LoadBalancers[].LoadBalancerName'
aws ec2 describe-addresses --region $REGION --query 'Addresses[].PublicIp'
aws autoscaling describe-auto-scaling-groups --region $REGION --query 'AutoScalingGroups[].AutoScalingGroupName'
```
Semua harus mengembalikan daftar kosong.

## 9. Checklist Biaya

- [ ] Budget alarm aktif sebelum membuat resource
- [ ] Hanya satu region dipakai
- [ ] Tidak ada NAT Gateway
- [ ] Tidak ada Elastic IP menganggur
- [ ] Instance **terminated**, bukan stopped
- [ ] Tidak ada volume EBS tersisa
- [ ] ALB dan Target Group dihapus
- [ ] Screenshot bukti tersimpan
- [ ] Sisa kredit dicatat

## 10. Troubleshooting

| Gejala | Kemungkinan penyebab | Solusi |
|---|---|---|
| `ssh: Permission denied (publickey)` | Izin `.pem` atau user salah | `chmod 400`; user `ubuntu` untuk Ubuntu (`ec2-user` untuk Amazon Linux) |
| `ssh` timeout | SG tidak mengizinkan port 22 dari IP kamu (IP berubah) | Perbarui aturan *My IP* |
| `curl` ke `:8000` gagal dari luar | Port 8000 belum dibuka di SG, atau service mati | Cek SG; `systemctl status smartlib-backend`; `journalctl -u smartlib-backend -n 50` |
| Target ALB `unhealthy` | Port/path health check salah, SG instance tidak menerima dari SG ALB | Samakan port dan path `/health`; izinkan SG ALB |
| Frontend tidak bisa memanggil backend | CORS atau `NEXT_PUBLIC_API_URL` salah | Set `CORS_ORIGIN`; rebuild frontend dengan URL yang benar |
| `npm ci` gagal | Tidak ada `package-lock.json` | Skrip sudah fallback ke `npm install` |
