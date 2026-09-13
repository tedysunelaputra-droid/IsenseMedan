import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InputEqView } from './components/InputEqView';
import { DataEqView } from './components/DataEqView';
import { EditModal } from './components/EditModal';
import { DeleteModal } from './components/DeleteModal';
import { LoginView } from './components/LoginView';
import { Toast, ToastMessage } from './components/Toast';
import { SupabaseModal } from './components/SupabaseModal';
import { User, DataEq, EqStats, ActiveTab, EqStatus } from './types';
import { INITIAL_EQ_DATA, DEFAULT_USER } from './data/initialData';
import { 
  getSupabaseConfig, 
  fetchSupabaseEqData, 
  insertSupabaseEqData, 
  updateSupabaseEqData, 
  deleteSupabaseEqData 
} from './lib/supabase';

export default function App() {
// 1. Auth State (Langsung aktif tanpa login)
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: 'admin',
    nama_lengkap: 'Staff Isense Medan',
    role: 'Admin Cabang Medan'
  });

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // 3. Data EQ State (Dikosongkan sesuai permintaan pengguna)
  const [eqData, setEqData] = useState<DataEq[]>(() => {
    const saved = localStorage.getItem('isense_eq_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Jika data tersimpan adalah data sampel lama (MDN-001), bersihkan
        const hasSampleData = Array.isArray(parsed) && parsed.some((d: DataEq) => d.nomor_eq === 'EQ-2025-MDN-001');
        if (!hasSampleData && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved EQ data');
      }
    }
    localStorage.removeItem('isense_eq_data');
    return [];
  });

  // 4. Supabase Integration State
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => {
    return getSupabaseConfig().isConfigured;
  });

  // 5. Modals State
  const [editingItem, setEditingItem] = useState<DataEq | null>(null);
  const [deletingItem, setDeletingItem] = useState<DataEq | null>(null);

  // 6. Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      message
    });
  };

  // Load data dari Supabase jika konfigurasi ada
  const loadDataFromSupabase = async () => {
    const cfg = getSupabaseConfig();
    setIsSupabaseConnected(cfg.isConfigured);
    if (cfg.isConfigured) {
      const remoteData = await fetchSupabaseEqData();
      if (remoteData && remoteData.length > 0) {
        setEqData(remoteData);
      }
    }
  };

  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  // Simpan eqData ke localStorage setiap ada perubahan (sebagai cache offline)
  useEffect(() => {
    localStorage.setItem('isense_eq_data', JSON.stringify(eqData));
  }, [eqData]);

  // Simpan user ke localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('isense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('isense_user');
    }
  }, [user]);

 // Hitung statistik dinamis
  const stats: EqStats = {
    total: eqData.length,
    terdaftar: eqData.filter(d => d.status === 'Terdaftar').length,
    tidak: eqData.filter(d => d.status === 'Tidak').length,
  };

  // Handler Login
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setActiveTab('dashboard');
  };

  // Handler Logout
  const handleLogout = () => {
    setUser(null);
    showToast('success', 'Logout Berhasil', 'Anda telah keluar dari aplikasi.');
  };

  // Handler Tambah Data EQ (Create)
  const handleSaveEq = async (data: {
    nomor_eq: string;
    nama_customer: string;
    cst: string;
    status: EqStatus;
  }): Promise<boolean> => {
    if (isSupabaseConnected) {
      try {
        const inserted = await insertSupabaseEqData(data);
        if (inserted) {
          setEqData(prev => [inserted, ...prev]);
          showToast('success', 'Tersimpan ke Supabase Cloud', `Data ${data.nomor_eq} berhasil disimpan ke database online!`);
          setActiveTab('data');
          return true;
        }
      } catch (err: any) {
        showToast('error', 'Gagal Simpan ke Supabase', err.message || 'Periksa koneksi internet dan pengaturan Supabase.');
        return false;
      }
    }

    // Fallback Lokal
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newItem: DataEq = {
      id: Date.now(),
      nomor_eq: data.nomor_eq,
      nama_customer: data.nama_customer,
      cst: data.cst,
      status: data.status,
      created_at: now,
      updated_at: now
    };

    setEqData(prev => [newItem, ...prev]);
    showToast('success', 'Data EQ Tersimpan', `Data dengan Nomor ${data.nomor_eq} berhasil disimpan ke database lokal!`);
    setActiveTab('data');
    return true;
  };

  // Handler Edit Data EQ (Update)
  const handleUpdateEq = async (updated: DataEq): Promise<boolean> => {
    if (isSupabaseConnected) {
      try {
        await updateSupabaseEqData(updated.id, {
          nomor_eq: updated.nomor_eq,
          nama_customer: updated.nama_customer,
          cst: updated.cst,
          status: updated.status
        });
      } catch (err: any) {
        console.warn('Gagal update Supabase:', err);
      }
    }

    setEqData(prev => prev.map(item => item.id === updated.id ? updated : item));
    showToast('success', 'Pembaruan Berhasil', `Data EQ ${updated.nomor_eq} berhasil diperbarui!`);
    return true;
  };

  // Handler Hapus Data EQ (Delete)
  const handleDeleteEq = async (id: number): Promise<boolean> => {
    const target = eqData.find(d => d.id === id);
    if (isSupabaseConnected) {
      try {
        await deleteSupabaseEqData(id);
      } catch (err: any) {
        console.warn('Gagal delete di Supabase:', err);
      }
    }

    setEqData(prev => prev.filter(item => item.id !== id));
    showToast('success', 'Data Dihapus', `Data EQ ${target?.nomor_eq || ''} berhasil dihapus.`);
    return true;
  };

  // Handler Reset/Reload Data Default
  const handleRefreshData = async () => {
    if (isSupabaseConnected) {
      const remote = await fetchSupabaseEqData();
      if (remote) {
        setEqData(remote);
        showToast('success', 'Tersinkronisasi', 'Data terbaru ditarik dari Supabase Cloud.');
        return;
      }
    }
    showToast('success', 'Data Dimuat Ulang', 'Sinkronisasi data EQ berhasil.');
  };

 

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        totalEqCount={eqData.length}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            recentEqList={eqData.slice(0, 5)}
            setActiveTab={setActiveTab}
            onEdit={(item) => setEditingItem(item)}
          />
        )}

        {activeTab === 'input' && (
          <InputEqView
            onSave={handleSaveEq}
            existingEqNumbers={eqData.map(d => d.nomor_eq)}
          />
        )}

        {activeTab === 'data' && (
          <DataEqView
            data={eqData}
            onEdit={(item) => setEditingItem(item)}
            onDelete={(item) => setDeletingItem(item)}
            setActiveTab={setActiveTab}
            onRefresh={handleRefreshData}
          />
        )}
      </main>

      {/* Modal Edit Pop-up */}
      <EditModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onUpdate={handleUpdateEq}
        existingEqNumbers={eqData.map(d => d.nomor_eq)}
      />

      {/* Modal Konfirmasi Hapus */}
      <DeleteModal
        isOpen={Boolean(deletingItem)}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteEq}
      />

      {/* Modal Konfigurasi Supabase Cloud */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnected={async () => {
          const cfg = getSupabaseConfig();
          setIsSupabaseConnected(cfg.isConfigured);
          if (cfg.isConfigured) {
            showToast('success', 'Terhubung ke Supabase', 'Koneksi database cloud aktif! Memuat data...');
            const remote = await fetchSupabaseEqData();
            if (remote && remote.length > 0) {
              setEqData(remote);
            }
          } else {
            showToast('success', 'Mode Lokal Aktif', 'Koneksi cloud diputuskan, beralih ke penyimpanan lokal browser.');
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          &copy; <strong>Isense Medan</strong> - Sistem Manajemen Operasional Data EQ
        </p>
      </footer>

    </div>
  );
}
