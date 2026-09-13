# 🚀 Panduan Menghubungkan Isense Medan ke Supabase (Database Terpusat)

Dengan menghubungkan aplikasi ini ke **Supabase (Cloud Database)**, seluruh data yang diinput dari laptop maupun HP tim Anda akan **langsung tersimpan di internet secara real-time dan terpusat**.

---

## Langkah 1: Download & Buka Project di VS Code
1. Di AI Studio, klik menu **Settings (titik tiga)** di pojok kanan atas &rarr; pilih **Download ZIP** (atau Export to GitHub).
2. Ekstrak file ZIP hasil unduhan ke laptop Anda.
3. Buka folder tersebut di **VS Code** (`File` > `Open Folder...`).
4. Buka terminal di VS Code (`Ctrl + ~` atau `Terminal` > `New Terminal`) lalu jalankan:
   ```bash
   npm install
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## Langkah 2: Buat Database di Supabase (100% Gratis)
1. Buka [https://supabase.com](https://supabase.com) dan klik **Start your project**.
2. Masuk menggunakan akun **Google** atau **GitHub**.
3. Klik **New project**, lalu isi:
   - **Name:** `isense-medan`
   - **Database Password:** Buat password yang aman (dan catat).
   - **Region:** Pilih yang terdekat, misalnya **Singapore (ap-southeast-1)**.
4. Klik **Create new project** dan tunggu 1-2 menit sampai status database siap (aktif).

---

## Langkah 3: Buat Tabel Otomatis di Supabase
1. Di sidebar kiri dashboard Supabase Anda, klik ikon **SQL Editor** (ikon `>_`).
2. Klik tombol **New query**.
3. Buka file **`supabase_schema.sql`** yang ada di folder proyek VS Code Anda, **copy (salin) seluruh isinya**.
4. Paste (tempelkan) ke dalam SQL Editor di Supabase.
5. Klik tombol hijau **Run** (atau tekan `Ctrl + Enter`).
6. *Selesai!* Tabel `data_eq` dan `users` sudah otomatis terbuat lengkap dengan data bawaannya.

---

## Langkah 4: Ambil Kunci Koneksi API Supabase
1. Di Supabase, klik menu **Project Settings** (ikon gerigi di kiri bawah).
2. Pilih sub-menu **API**.
3. Anda akan melihat dua baris data:
   - **Project URL** (contoh: `https://abcdefghijklm.supabase.co`)
   - **Project API Keys** bagian **`anon` `public`** (kunci panjang deretan karakter acak).
4. Salin kedua nilai tersebut.

---

## Langkah 5: Hubungkan ke Aplikasi Website Anda

Ada **dua cara mudah** untuk menghubungkannya:

### Cara A (Paling Praktis via Tampilan Web):
1. Buka website di browser Anda (`http://localhost:3000`).
2. Di navbar pojok kanan atas, klik tombol **"Database: Lokal"** (ikon awan).
3. Tempelkan **Project URL** dan **Anon API Key** Anda, lalu klik **"Hubungkan Sekarang"**.
4. Indikator akan berubah menjadi **🟢 Supabase Cloud (Terhubung)**!

### Cara B (Permanen via file `.env` di VS Code):
1. Buat file baru bernama `.env` di folder utama proyek Anda di VS Code.
2. Tuliskan kodenya seperti ini:
   ```env
   VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Simpan file, lalu restart server di terminal (`Ctrl + C` lalu `npm run dev`).

---

## 🎯 Cara Membuktikan Data Sudah Terpusat Real-Time:
1. Buka website di laptop Anda, input data EQ baru lalu klik Simpan.
2. Buka dashboard Supabase &rarr; menu **Table Editor** &rarr; tabel **`data_eq`**.
3. Data yang Anda ketik tadi **sudah langsung masuk ke server Supabase**!
4. Siapa pun yang membuka aplikasi ini (termasuk dari smartphone) akan melihat data yang persis sama secara terpusat!
