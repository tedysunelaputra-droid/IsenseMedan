<?php
/**
 * =======================================================
 * Berkas: koneksi.php
 * Deskripsi: Koneksi Database MySQL menggunakan PDO
 * Aplikasi: Isense Medan - Sistem Manajemen Data EQ
 * =======================================================
 */

// Konfigurasi Database
$db_host = 'localhost';
$db_port = '3306';
$db_name = 'isense_medan';
$db_user = 'root';
$db_pass = ''; // Default XAMPP/Laragon biasanya kosong

try {
    // Data Source Name (DSN) dengan charset utf8mb4
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    
    // Opsi PDO untuk keamanan dan performa
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lempar exception saat error
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // Hasil query berupa array asosiatif
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Prepared statements asli (mencegah SQL Injection)
    ];

    // Inisialisasi Objek PDO
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);

} catch (PDOException $e) {
    // Jika koneksi gagal, kembalikan response JSON dengan status 500
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi ke database gagal: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}
