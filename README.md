# 🌱 Mubazir – Platform Donasi Makanan

**Deskripsi:**  
Mubazir adalah platform berbasis web yang memfasilitasi **donasi makanan** dari donatur ke penerima. Tujuannya adalah **mengurangi pemborosan makanan** dan memastikan makanan yang masih layak konsumsi sampai ke pihak yang membutuhkan.

---

## 🚀 Fitur Utama

### 1. Dashboard Donatur
- Menampilkan profil donatur (nama & email).  
- Ringkasan progres donasi dan status terkini.

### 2. Buat Donasi
- Donatur dapat membuat donasi baru dengan informasi:
  - Kategori donasi (Makanan, Snack, Minuman, Buah, dll.)
  - Nama donasi
  - Jumlah & satuan
  - Lokasi penjemputan
  - Masa kadaluarsa
  - Upload foto donasi  
- Donasi berstatus `pending` hingga diverifikasi admin.

### 3. Riwayat Donasi
- Menampilkan daftar donasi donatur.
- Status donasi:
  - `pending` → menunggu verifikasi admin
  - `approved` → disetujui admin
  - `Diambil` → telah diambil penyalur
  - `rejected` → ditolak admin

### 4. Scan QR untuk Donasi
- Donatur menandai donasi telah diambil melalui **QR code** penyalur.
- Status donasi otomatis diperbarui menjadi `Diambil`.

### 5. Login & Logout
- Sistem autentikasi sederhana menggunakan Firebase.
- Admin default dibuat otomatis saat pertama kali load aplikasi.

---

## 🗂 Struktur Halaman & File

| File / Halaman        | Deskripsi |
|----------------------|-----------|
| `donasi.html`        | Halaman publik untuk melihat semua donasi, filter, dan detail donasi beserta informasi donatur. |
| `donatur.html`       | Dashboard donatur: buat donasi, riwayat donasi, scan QR. |
| `donasi.js`          | Logika front-end halaman donasi publik (filter, search, render kartu donasi). |
| `donatur.js`         | Logika front-end dashboard donatur (buat donasi, scan QR, riwayat). |
| `database.js`        | Interaksi dengan **Firebase Realtime Database** (Users, Donasi, Klaim, Update status). |

---

## ⚙️ Teknologi & Tools

- **Frontend:** HTML, CSS (Bootstrap), JavaScript  
- **Backend:** Firebase Realtime Database  
- **Library:** `jsQR` untuk scanning QR code (via CDN)  
- **Hosting:** Bisa dijalankan statis (Netlify, Vercel, dll.)

---

## 💻 Cara Menjalankan Lokal

1. Clone repository:
   ```bash
   git clone https://github.com/dyme15/mubazir.git
