# PROJECT BRIEF — Tugas-11 Arsitektur Komputasi Awan

Mata kuliah: **CAK3EAB3 Komputasi Awan dan Terdistribusi** · Telkom University · Dosen: Immanuel Sembiring, S.T., M.T.
Kelompok: Networking Ala Hilmi · Kelas IF-48-REG08 · Tahun 2026

## 1. Ketentuan Umum Pengerjaan

1. Dikerjakan secara kelompok, langsung pada lembar soal.
2. Soal perhitungan wajib menuliskan cara atau langkah pengerjaan.
3. Setiap anggota wajib berkontribusi. Anggota yang tidak mengerjakan bernilai nol dan namanya tidak ditulis di tabel.
4. Unggah jawaban ke LMS diwakili satu anggota.
5. Tabel pernyataan (a–e) wajib dilengkapi (nama, NIM, kontribusi tugas, tanda tangan) sebagai syarat nilai diinput.
6. Pernyataan: ikut mengerjakan, menjelaskan jawaban ke teman, memahami penjelasan teman, tidak mencontek, tidak memberikan jawaban ke kelompok lain.

## 2. Soal dan Bobot (total 100 poin)

| No | Soal | Poin | Catatan |
|---|---|---|---|
| 1 | High-fidelity wireframe untuk Tugas 9 dan 10, didahului tabel keputusan desain (warna, font, navigation flow, reusable elements) | 20 | **AI-Level 2 – Onsite** |
| 2 | Mulai kode front-end dan back-end, komunikasi HTTP, host di GitHub, kode `.zip` tetap dikirim ke LMS. Fitur tidak harus selesai, boleh dicicil hingga **minggu 13** | 20 | |
| 3 | Buat layanan IaaS (EC2) di AWS: OS Linux dengan kapasitas disk sesuai budget, buat **script bash sederhana** yang berjalan di Linux, lalu lakukan analisis | 10 | |
| 4 | Gambar arsitektur dari soal 3 (5) + **3 masalah** yang bisa muncul beserta penjelasan tiap komponen masalahnya (15) | 20 | Tiap masalah wajib dijelaskan *mengapa* menjadi masalah (contoh: latency) |
| 5 | Arsitektur usulan untuk menyelesaikan 3 masalah: gambar (10) + justifikasi (10). Gunakan three-tier dan konsep Load Balancer, Availability Zones, Auto Scaling, Redundancy, Latency | 20 | **Tidak perlu menambah storage** |
| 6 | **Hapus (destroy)** semua resource setelah dokumentasi selesai, sertakan screenshot bukti seluruh resource terminated/dihapus | 10 | Gunakan voucher, perhatikan batasnya |

> Catatan penomoran: teks soal 4 menyebut "soal nomor 3" untuk arsitektur dan masalah; itu merujuk ke arsitektur EC2 pada soal 3.

## 3. Justifikasi Wajib (Soal 5)

- Bagaimana arsitektur usulan menyelesaikan **ketiga masalah** pada soal 4.
- Eksplorasi konsep: **Load Balancer, Availability Zones, Scaling Groups (Auto Scaling), Redundancy, Latency**.

## 4. Deliverable

| # | Deliverable | Format |
|---|---|---|
| D1 | Lembar jawaban Tugas-11 (tabel pernyataan terisi) | `.docx` / PDF sesuai LMS |
| D2 | Tabel keputusan desain + wireframe high-fidelity (Login, Register, Dashboard, Katalog Buku + modal, Data Anggota, Sirkulasi, Riwayat) | gambar di lembar jawaban |
| D3 | Repo GitHub berisi `backend/` dan `frontend/` | URL repo |
| D4 | Kode `.zip` (backend + frontend) | unggah LMS |
| D5 | Dokumentasi EC2: screenshot pembuatan, script bash, hasil eksekusi, analisis | di lembar jawaban |
| D6 | Diagram arsitektur awal (soal 4) | gambar |
| D7 | 3 masalah + penjelasan | teks |
| D8 | Diagram arsitektur usulan + justifikasi (soal 5) | gambar + teks |
| D9 | Screenshot bukti semua resource AWS terminated/dihapus | gambar |

## 5. Deadline dan Milestone

| Milestone | Target |
|---|---|
| Kesepakatan 3 masalah (soal 4) | Awal pengerjaan |
| Format API disepakati (backend ↔ frontend) | Awal pengerjaan |
| Wireframe dan tabel desain selesai | Sebelum coding frontend |
| Kode dicicil dan di-push ke GitHub | Maksimal **minggu 13** |
| EC2 dibuat dan didokumentasikan | Sebelum soal 6 |
| Resource AWS dihapus dan dibuktikan | Setelah semua dokumentasi AWS selesai |
| Unggah LMS | Sesuai tenggat dosen (cek LMS) |

## 6. Konteks dari Tugas Sebelumnya

- **Tugas 9**: pemilihan masalah (Smart Campus Library), 3 entitas, tabel 15 fitur, sketsa frontend, use case, skalabilitas vertikal/horizontal, algoritma load balancing (Round-Robin, Least Connection, Least Response Time). Akun AWS: kredit **$100**, masa berlaku sekitar 182 hari sejak pembuatan.
- **Tugas 10**: wireframe Login/Register/Dashboard, penempatan VM + load balancer, subnetting 173.1.0.0/16 → /24, ilustrasi subnet departemen. *Arsitektur proyek di Tugas 10 no.5 adalah proyek irigasi IoT dan **tidak** berlaku untuk Smart Campus Library; jangan disalin.*
