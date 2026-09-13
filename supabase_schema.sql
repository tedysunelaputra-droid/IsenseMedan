-- ====================================================================
-- SKRIP SETUP DATABASE SUPABASE (POSTGRESQL) - ISENSE MEDAN
-- ====================================================================
-- Cara menggunakan:
-- 1. Buka dashboard Supabase (https://supabase.com)
-- 2. Buat proyek baru (misal nama: isense-medan)
-- 3. Masuk ke menu "SQL Editor" (ikon >_ di sidebar kiri)
-- 4. Klik "New query", copy seluruh isi teks file ini, lalu klik tombol "Run" (hijau)
-- ====================================================================

-- 1. HAPUS TABEL JIKA SUDAH PERNAH ADA (Hati-hati: hanya untuk reset bersih)
-- DROP TABLE IF EXISTS data_eq CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. BUAT TABEL `users` (UNTUK LOGIN PENGGUNA)
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Staff Lapangan',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('asia/jakarta', NOW())
);

-- 3. BUAT TABEL `data_eq` (UNTUK CATATAN OPERASIONAL EQ)
CREATE TABLE IF NOT EXISTS public.data_eq (
  id BIGSERIAL PRIMARY KEY,
  nomor_eq VARCHAR(50) UNIQUE NOT NULL,
  nama_customer VARCHAR(150) NOT NULL,
  cst VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Diproses', 'Selesai', 'Batal')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('asia/jakarta', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('asia/jakarta', NOW())
);

-- 4. AKTIFKAN ROW LEVEL SECURITY (RLS) & IZINKAN AKSES PUBLIK (ANON)
-- Supabase secara default mengamankan tabel dengan RLS. 
-- Aturan di bawah mengizinkan aplikasi web membaca dan menyimpan data secara langsung.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_eq ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses untuk data_eq (Bisa Baca, Tambah, Edit, Hapus)
DROP POLICY IF EXISTS "Izinkan Semua Operasi data_eq" ON public.data_eq;
CREATE POLICY "Izinkan Semua Operasi data_eq" 
  ON public.data_eq 
  FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Kebijakan Akses untuk users (Bisa Baca dan Tambah Akun)
DROP POLICY IF EXISTS "Izinkan Semua Operasi users" ON public.users;
CREATE POLICY "Izinkan Semua Operasi users" 
  ON public.users 
  FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. AKUN PENGGUNA AWAL (ADMIN)
INSERT INTO public.users (username, nama_lengkap, password, role)
VALUES 
  ('admin', 'Administrator Isense Medan', 'admin123', 'Admin Cabang Medan')
ON CONFLICT (username) DO NOTHING;


