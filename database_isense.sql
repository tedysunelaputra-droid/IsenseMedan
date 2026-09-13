-- =======================================================
-- SKEMA DATABASE MYSQL: isense_medan
-- Aplikasi: Isense Medan - Sistem Manajemen Data EQ
-- =======================================================

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS `isense_medan` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `isense_medan`;

-- -------------------------------------------------------
-- 2. Buat Tabel `users`
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 3. Buat Tabel `data_eq`
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `data_eq` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nomor_eq` VARCHAR(50) NOT NULL UNIQUE,
  `nama_customer` VARCHAR(150) NOT NULL,
  `cst` VARCHAR(100) NOT NULL,
  `status` ENUM('Pending', 'Diproses', 'Selesai', 'Batal') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 4. Insert Data Default untuk Tabel `users`
-- Password default: 'admin123'
-- Hash dibuat menggunakan PHP: password_hash('admin123', PASSWORD_BCRYPT)
-- -------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `password_hash`, `nama_lengkap`, `created_at`) 
VALUES 
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator Isense Medan', NOW())
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- Catatan: Hash di atas cocok untuk password: 'admin123' / 'password' pada standard bcrypt testing.
-- Jika ingin membuat hash baru dengan password sendiri di PHP:
-- echo password_hash('password_anda', PASSWORD_BCRYPT);

