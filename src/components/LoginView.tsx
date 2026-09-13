import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  User, 
  Lock, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  BadgeCheck,
  ArrowLeft
} from 'lucide-react';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLogin: (user: UserType) => void;
  showToast: (type: 'success' | 'error', title: string, message: string) => void;
}

interface StoredAccount extends UserType {
  password?: string;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    nama_lengkap: 'Administrator Isense Medan',
    role: 'Admin Cabang Medan'
  },
  {
    id: 2,
    username: 'staff',
    password: 'staff123',
    nama_lengkap: 'Staff Operasional Medan',
    role: 'Staff Lapangan'
  }
];

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, showToast }) => {
  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // State Form Login - Kosongan secara default
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State Form Register - Kosongan secara default
  const [regNamaLengkap, setRegNamaLengkap] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState('Staff Lapangan');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Akun terdaftar di sistem (tersimpan di localStorage)
  const [registeredAccounts, setRegisteredAccounts] = useState<StoredAccount[]>(() => {
    const saved = localStorage.getItem('isense_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse registered users', e);
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  // Simpan akun terdaftar setiap ada penambahan
  useEffect(() => {
    localStorage.setItem('isense_registered_users', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  // Bersihkan pesan saat ganti tab
  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Handler Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Silakan masukkan username dan password Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Cari akun yang cocok di daftar akun terdaftar
      const matchedUser = registeredAccounts.find(
        acc => acc.username.toLowerCase() === cleanUsername.toLowerCase() && acc.password === cleanPassword
      );

      // Dukung fallback bawaan admin jika akun belum ter-reset
      const isDefaultAdmin = (cleanUsername.toLowerCase() === 'admin' && (cleanPassword === 'admin123' || cleanPassword === 'admin'));

      if (matchedUser) {
        showToast('success', 'Login Berhasil', `Selamat datang kembali, ${matchedUser.nama_lengkap}!`);
        onLogin({
          id: matchedUser.id,
          username: matchedUser.username,
          nama_lengkap: matchedUser.nama_lengkap,
          role: matchedUser.role || 'Staff Lapangan'
        });
      } else if (isDefaultAdmin) {
        showToast('success', 'Login Berhasil', 'Selamat datang di Sistem Isense Medan!');
        onLogin({
          id: 1,
          username: 'admin',
          nama_lengkap: 'Administrator Isense Medan',
          role: 'Admin Cabang Medan'
        });
      } else {
        setErrorMsg('Username atau password yang Anda masukkan tidak sesuai.');
        showToast('error', 'Login Gagal', 'Username atau password tidak ditemukan.');
      }
    }, 450);
  };

  // Handler Submit Pendaftaran Akun Baru
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanNama = regNamaLengkap.trim();
    const cleanUser = regUsername.trim();
    const cleanPass = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();

    // Validasi form
    if (!cleanNama || !cleanUser || !cleanPass || !cleanConfirm) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (cleanUser.length < 3) {
      setErrorMsg('Username minimal harus 3 karakter.');
      return;
    }

    // Cek apakah username mengandung spasi
    if (/\s/.test(cleanUser)) {
      setErrorMsg('Username tidak boleh mengandung spasi.');
      return;
    }

    // Cek apakah username sudah dipakai
    const existing = registeredAccounts.find(
      acc => acc.username.toLowerCase() === cleanUser.toLowerCase()
    );
    if (existing) {
      setErrorMsg(`Username "${cleanUser}" sudah terdaftar. Silakan gunakan username lain.`);
      return;
    }

    if (cleanPass.length < 5) {
      setErrorMsg('Password minimal harus 5 karakter demi keamanan akun.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const newAccount: StoredAccount = {
        id: Date.now(),
        username: cleanUser,
        password: cleanPass,
        nama_lengkap: cleanNama,
        role: regRole
      };

      // Simpan akun baru
      const updatedAccounts = [...registeredAccounts, newAccount];
      setRegisteredAccounts(updatedAccounts);
      localStorage.setItem('isense_registered_users', JSON.stringify(updatedAccounts));

      // Berikan notifikasi sukses dan arahkan ke tab login dengan username terisi
      showToast('success', 'Akun Berhasil Dibuat', `Akun untuk "${cleanNama}" siap digunakan. Silakan login!`);
      
      // Reset form pendaftaran
      setRegNamaLengkap('');
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');

      // Pindahkan ke form login dan siapkan username baru
      setUsername(cleanUser);
      setPassword('');
      setMode('login');
      setSuccessMsg(`Akun "${cleanUser}" berhasil didaftarkan! Masukkan password untuk masuk ke sistem.`);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 font-sans">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 transition-all duration-200">
        
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 mb-3.5 ring-4 ring-emerald-50">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Isense Medan
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Sistem Informasi Manajemen & Pelacakan Data EQ
          </p>
        </div>

        {/* Tab Switcher: Masuk vs Buat Akun */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/80">
          <button
            type="button"
            id="tab-login"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              mode === 'login'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Sistem</span>
          </button>
          <button
            type="button"
            id="tab-register"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              mode === 'register'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Buat Akun Baru</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 1: FORM LOGIN (KOSONGAN)                             */}
        {/* ========================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="input-username"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="input-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="input-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-60 text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memeriksa Kredensial...' : 'Masuk ke Sistem'}</span>
            </button>

            {/* Prompt Pendaftaran */}
            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
              <span>Belum memiliki akun terdaftar? </span>
              <button
                type="button"
                id="link-go-to-register"
                onClick={() => switchMode('register')}
                className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 ml-1 cursor-pointer"
              >
                Buat Akun Baru
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* MODE 2: FORM REGISTRASI / BUAT AKUN BARU                 */}
        {/* ========================================================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label 
                htmlFor="reg-nama"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <BadgeCheck className="w-4 h-4" />
                </span>
                <input
                  id="reg-nama"
                  type="text"
                  value={regNamaLengkap}
                  onChange={(e) => setRegNamaLengkap(e.target.value)}
                  placeholder="Contoh: Tedyy Sunella Putra"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="reg-username"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Username Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="off"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Pilih username unik (tanpa spasi)"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="reg-role"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Peran / Jabatan
              </label>
              <select
                id="reg-role"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition bg-white text-slate-800"
              >
                <option value="Staff Lapangan">Staff Lapangan / Teknisi</option>
                <option value="Admin Cabang Medan">Admin Cabang Medan</option>
                <option value="Customer Service">Customer Service (CST)</option>
              </select>
            </div>

            <div>
              <label 
                htmlFor="reg-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 5 karakter"
                  className="w-full pl-10 pr-11 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label 
                htmlFor="reg-confirm-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="reg-confirm-password"
                  type={showRegPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ulangi password di atas"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition bg-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-register"
              disabled={isLoading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-60 text-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun Baru'}</span>
            </button>

            {/* Kembali ke Login */}
            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
              <span>Sudah memiliki akun? </span>
              <button
                type="button"
                id="link-go-to-login"
                onClick={() => switchMode('login')}
                className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 ml-1 cursor-pointer"
              >
                Masuk di sini
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
