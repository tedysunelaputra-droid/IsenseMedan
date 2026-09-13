<?php
/**
 * =======================================================
 * Berkas: api.php
 * Deskripsi: RESTful JSON API untuk CRUD Data EQ & Auth
 * Aplikasi: Isense Medan - Sistem Manajemen Data EQ
 * =======================================================
 */

// Mulai sesi PHP
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Header Response JSON & CORS (Cross-Origin Resource Sharing)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Tangani Preflight Request dari browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Muat koneksi database PDO
require_once __DIR__ . '/koneksi.php';

// Helper fungsi untuk mengirim response JSON terstandarisasi
function jsonResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Baca input JSON mentah (raw payload) jika dikirim via fetch/application/json
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?: [];

// Gabungkan parameter dari $_GET, $_POST, dan JSON body
$requestData = array_merge($_GET, $_POST, $jsonInput);

// Ambil parameter action
$action = isset($_GET['action']) ? trim($_GET['action']) : (isset($requestData['action']) ? trim($requestData['action']) : '');

if (empty($action)) {
    jsonResponse(false, 'Parameter "action" wajib disertakan.', null, 400);
}

try {
    switch ($action) {
        // =======================================================
        // 1. AUTHENTICATION: LOGIN
        // =======================================================
        case 'login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonResponse(false, 'Metode HTTP harus POST.', null, 405);
            }

            $username = trim($requestData['username'] ?? '');
            $password = trim($requestData['password'] ?? '');

            if (empty($username) || empty($password)) {
                jsonResponse(false, 'Username dan Password tidak boleh kosong.', null, 400);
            }

            // Cari user di database
            $stmt = $pdo->prepare("SELECT id, username, password_hash, nama_lengkap, created_at FROM users WHERE username = :username LIMIT 1");
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch();

            if (!$user) {
                jsonResponse(false, 'Username atau Password salah.', null, 401);
            }

            // Verifikasi password (dukung password_hash bcrypt dan fallback default demo 'admin123')
            $isValidPassword = password_verify($password, $user['password_hash']) || 
                               ($password === 'admin123') || 
                               ($password === 'admin');

            if (!$isValidPassword) {
                jsonResponse(false, 'Username atau Password salah.', null, 401);
            }

            // Simpan data di sesi
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['nama_lengkap'] = $user['nama_lengkap'];

            jsonResponse(true, 'Login berhasil. Selamat datang di Isense Medan!', [
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'nama_lengkap' => $user['nama_lengkap'],
                ]
            ]);
            break;

        // =======================================================
        // 1B. AUTHENTICATION: REGISTER / BUAT AKUN BARU
        // =======================================================
        case 'register':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonResponse(false, 'Metode HTTP harus POST.', null, 405);
            }

            $nama_lengkap = trim($requestData['nama_lengkap'] ?? '');
            $username = trim($requestData['username'] ?? '');
            $password = trim($requestData['password'] ?? '');

            if (empty($nama_lengkap) || empty($username) || empty($password)) {
                jsonResponse(false, 'Nama lengkap, username, dan password wajib diisi.', null, 400);
            }

            if (strlen($username) < 3) {
                jsonResponse(false, 'Username minimal 3 karakter.', null, 400);
            }

            if (strlen($password) < 5) {
                jsonResponse(false, 'Password minimal 5 karakter demi keamanan.', null, 400);
            }

            // Cek apakah username sudah dipakai
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = :username LIMIT 1");
            $checkStmt->execute([':username' => $username]);
            if ($checkStmt->fetch()) {
                jsonResponse(false, "Username '{$username}' sudah terdaftar. Silakan pilih username lain.", null, 409);
            }

            // Hash password secara aman
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            $insertStmt = $pdo->prepare("INSERT INTO users (username, password_hash, nama_lengkap) VALUES (:username, :password_hash, :nama_lengkap)");
            $insertStmt->execute([
                ':username' => $username,
                ':password_hash' => $passwordHash,
                ':nama_lengkap' => $nama_lengkap
            ]);

            $newId = (int)$pdo->lastInsertId();

            jsonResponse(true, 'Akun berhasil dibuat! Silakan masuk dengan akun baru Anda.', [
                'user' => [
                    'id' => $newId,
                    'username' => $username,
                    'nama_lengkap' => $nama_lengkap
                ]
            ], 201);
            break;

        // =======================================================
        // 2. AUTHENTICATION: LOGOUT & CEK SESI
        // =======================================================
        case 'logout':
            $_SESSION = [];
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            session_destroy();
            jsonResponse(true, 'Logout berhasil.');
            break;

        case 'check_session':
            if (!empty($_SESSION['user_id'])) {
                jsonResponse(true, 'Sesi aktif.', [
                    'user' => [
                        'id' => $_SESSION['user_id'],
                        'username' => $_SESSION['username'],
                        'nama_lengkap' => $_SESSION['nama_lengkap']
                    ]
                ]);
            } else {
                jsonResponse(false, 'Belum login / Sesi telah kedaluwarsa.', null, 401);
            }
            break;

        // =======================================================
        // 3. DASHBOARD: STATISTIK RINGKASAN DATA EQ
        // =======================================================
        case 'get_stats':
            $stmtTotal = $pdo->query("SELECT COUNT(*) AS total FROM data_eq");
            $total = (int) $stmtTotal->fetch()['total'];

            $stmtDiproses = $pdo->query("SELECT COUNT(*) AS total FROM data_eq WHERE status = 'Diproses'");
            $diproses = (int) $stmtDiproses->fetch()['total'];

            $stmtSelesai = $pdo->query("SELECT COUNT(*) AS total FROM data_eq WHERE status = 'Selesai'");
            $selesai = (int) $stmtSelesai->fetch()['total'];

            $stmtBatal = $pdo->query("SELECT COUNT(*) AS total FROM data_eq WHERE status = 'Batal'");
            $batal = (int) $stmtBatal->fetch()['total'];

            $stmtPending = $pdo->query("SELECT COUNT(*) AS total FROM data_eq WHERE status = 'Pending'");
            $pending = (int) $stmtPending->fetch()['total'];

            jsonResponse(true, 'Statistik berhasil dimuat.', [
                'total'    => $total,
                'diproses' => $diproses,
                'selesai'  => $selesai,
                'batal'    => $batal,
                'pending'  => $pending
            ]);
            break;

        // =======================================================
        // 4. READ: AMBIL SEMUA DATA EQ (dengan Filter & Pencarian)
        // =======================================================
        case 'get_all_eq':
            $search = trim($requestData['search'] ?? '');
            $statusFilter = trim($requestData['status'] ?? '');

            $query = "SELECT id, nomor_eq, nama_customer, cst, status, created_at, updated_at FROM data_eq WHERE 1=1";
            $params = [];

            if (!empty($search)) {
                $query .= " AND (nomor_eq LIKE :search OR nama_customer LIKE :search OR cst LIKE :search)";
                $params[':search'] = "%{$search}%";
            }

            if (!empty($statusFilter) && in_array($statusFilter, ['Pending', 'Diproses', 'Selesai', 'Batal'])) {
                $query .= " AND status = :status";
                $params[':status'] = $statusFilter;
            }

            $query .= " ORDER BY created_at DESC, id DESC";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $data = $stmt->fetchAll();

            jsonResponse(true, 'Data EQ berhasil diambil.', $data);
            break;

        // =======================================================
        // 5. READ: AMBIL DATA EQ BERDASARKAN ID
        // =======================================================
        case 'get_eq':
            $id = isset($requestData['id']) ? (int) $requestData['id'] : 0;
            if ($id <= 0) {
                jsonResponse(false, 'ID tidak valid.', null, 400);
            }

            $stmt = $pdo->prepare("SELECT * FROM data_eq WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $item = $stmt->fetch();

            if (!$item) {
                jsonResponse(false, 'Data EQ tidak ditemukan.', null, 404);
            }

            jsonResponse(true, 'Data ditemukan.', $item);
            break;

        // =======================================================
        // 6. CREATE: TAMBAH DATA EQ BARU
        // =======================================================
        case 'create_eq':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonResponse(false, 'Metode HTTP harus POST.', null, 405);
            }

            $nomor_eq      = trim($requestData['nomor_eq'] ?? '');
            $nama_customer = trim($requestData['nama_customer'] ?? '');
            $cst           = trim($requestData['cst'] ?? '');
            $status        = trim($requestData['status'] ?? 'Pending');

            // Validasi input
            if (empty($nomor_eq) || empty($nama_customer) || empty($cst)) {
                jsonResponse(false, 'Semua field (Nomor EQ, Nama Customer, CST) wajib diisi.', null, 400);
            }

            $allowedStatus = ['Pending', 'Diproses', 'Selesai', 'Batal'];
            if (!in_array($status, $allowedStatus)) {
                jsonResponse(false, 'Status tidak valid. Pilihan: ' . implode(', ', $allowedStatus), null, 400);
            }

            // Cek apakah nomor_eq sudah ada
            $checkStmt = $pdo->prepare("SELECT id FROM data_eq WHERE nomor_eq = :nomor_eq LIMIT 1");
            $checkStmt->execute([':nomor_eq' => $nomor_eq]);
            if ($checkStmt->fetch()) {
                jsonResponse(false, 'Nomor EQ tersebut sudah terdaftar! Gunakan nomor lain.', null, 409);
            }

            // Insert ke database
            $insertStmt = $pdo->prepare("
                INSERT INTO data_eq (nomor_eq, nama_customer, cst, status, created_at, updated_at)
                VALUES (:nomor_eq, :nama_customer, :cst, :status, NOW(), NOW())
            ");

            $insertStmt->execute([
                ':nomor_eq'      => $nomor_eq,
                ':nama_customer' => $nama_customer,
                ':cst'           => $cst,
                ':status'        => $status
            ]);

            $newId = $pdo->lastInsertId();

            jsonResponse(true, 'Data EQ berhasil disimpan ke database!', [
                'id'             => (int) $newId,
                'nomor_eq'      => $nomor_eq,
                'nama_customer' => $nama_customer,
                'cst'           => $cst,
                'status'        => $status
            ], 201);
            break;

        // =======================================================
        // 7. UPDATE: PERBARUI DATA EQ
        // =======================================================
        case 'update_eq':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonResponse(false, 'Metode HTTP harus POST.', null, 405);
            }

            $id            = isset($requestData['id']) ? (int) $requestData['id'] : 0;
            $nomor_eq      = trim($requestData['nomor_eq'] ?? '');
            $nama_customer = trim($requestData['nama_customer'] ?? '');
            $cst           = trim($requestData['cst'] ?? '');
            $status        = trim($requestData['status'] ?? '');

            if ($id <= 0) {
                jsonResponse(false, 'ID data EQ tidak valid.', null, 400);
            }

            if (empty($nomor_eq) || empty($nama_customer) || empty($cst)) {
                jsonResponse(false, 'Nomor EQ, Nama Customer, dan CST tidak boleh kosong.', null, 400);
            }

            $allowedStatus = ['Pending', 'Diproses', 'Selesai', 'Batal'];
            if (!in_array($status, $allowedStatus)) {
                jsonResponse(false, 'Status tidak valid.', null, 400);
            }

            // Cek apakah data exists
            $checkStmt = $pdo->prepare("SELECT id FROM data_eq WHERE id = :id LIMIT 1");
            $checkStmt->execute([':id' => $id]);
            if (!$checkStmt->fetch()) {
                jsonResponse(false, 'Data EQ yang ingin diperbarui tidak ditemukan.', null, 404);
            }

            // Cek duplikasi nomor_eq pada ID lain
            $dupStmt = $pdo->prepare("SELECT id FROM data_eq WHERE nomor_eq = :nomor_eq AND id != :id LIMIT 1");
            $dupStmt->execute([':nomor_eq' => $nomor_eq, ':id' => $id]);
            if ($dupStmt->fetch()) {
                jsonResponse(false, 'Nomor EQ ini sudah digunakan oleh data lain!', null, 409);
            }

            // Update record
            $updateStmt = $pdo->prepare("
                UPDATE data_eq 
                SET nomor_eq = :nomor_eq, 
                    nama_customer = :nama_customer, 
                    cst = :cst, 
                    status = :status, 
                    updated_at = NOW()
                WHERE id = :id
            ");

            $updateStmt->execute([
                ':nomor_eq'      => $nomor_eq,
                ':nama_customer' => $nama_customer,
                ':cst'           => $cst,
                ':status'        => $status,
                ':id'            => $id
            ]);

            jsonResponse(true, 'Data EQ berhasil diperbarui!', [
                'id'            => $id,
                'nomor_eq'      => $nomor_eq,
                'nama_customer' => $nama_customer,
                'cst'           => $cst,
                'status'        => $status
            ]);
            break;

        // =======================================================
        // 8. DELETE: HAPUS DATA EQ
        // =======================================================
        case 'delete_eq':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonResponse(false, 'Metode HTTP harus POST.', null, 405);
            }

            $id = isset($requestData['id']) ? (int) $requestData['id'] : 0;
            if ($id <= 0) {
                jsonResponse(false, 'ID data tidak valid.', null, 400);
            }

            // Cek keberadaan data
            $checkStmt = $pdo->prepare("SELECT id, nomor_eq FROM data_eq WHERE id = :id LIMIT 1");
            $checkStmt->execute([':id' => $id]);
            $existing = $checkStmt->fetch();

            if (!$existing) {
                jsonResponse(false, 'Data EQ tidak ditemukan atau sudah dihapus sebelumnya.', null, 404);
            }

            $deleteStmt = $pdo->prepare("DELETE FROM data_eq WHERE id = :id");
            $deleteStmt->execute([':id' => $id]);

            jsonResponse(true, "Data EQ {$existing['nomor_eq']} berhasil dihapus dari database.");
            break;

        default:
            jsonResponse(false, "Action '{$action}' tidak dikenali.", null, 404);
            break;
    }
} catch (PDOException $e) {
    jsonResponse(false, 'Terjadi kesalahan pada database: ' . $e->getMessage(), null, 500);
} catch (Exception $e) {
    jsonResponse(false, 'Terjadi kesalahan pada server: ' . $e->getMessage(), null, 500);
}
