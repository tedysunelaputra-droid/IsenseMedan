import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  Database,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { DataEq, EqStats, ActiveTab } from '../types';

interface DashboardViewProps {
  stats: EqStats;
  recentEqList: DataEq[];
  setActiveTab: (tab: ActiveTab) => void;
  onEdit: (item: DataEq) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentEqList,
  setActiveTab,
  onEdit,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Terdaftar':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Terdaftar
          </span>
        );
      case 'Tidak':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Tidak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const calculatePercentage = (count: number) => {
    if (!stats.total || stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Banner Selamat Datang & Quick Action */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-medium mb-3 backdrop-blur-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sistem Monitoring Real-time</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-display">
            Sistem Informasi Data EQ
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-sans max-w-2xl">
            Kelola pencatatan dan verifikasi data pelanggan untuk wilayah operasional Medan dan sekitarnya dengan status Terdaftar atau Tidak.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('input')}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-semibold text-sm hover:bg-emerald-50 transition shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Input Data Baru</span>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className="px-4 py-2.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-900/75 text-white font-medium text-sm transition border border-emerald-500/30 flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-300" />
              <span>Buka Seluruh Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Card Ringkasan Statistik Dinamis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Total EQ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Data EQ
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">berkas</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total seluruh equipment tercatat
          </p>
        </div>

        {/* EQ Terdaftar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Status: Terdaftar
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{stats.terdaftar}</span>
            <span className="text-xs text-emerald-700 font-medium font-mono">
              ({calculatePercentage(stats.terdaftar)}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data valid & terverifikasi terdaftar
          </p>
        </div>

        {/* EQ Tidak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Status: Tidak
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600">{stats.tidak}</span>
            <span className="text-xs text-rose-700 font-medium font-mono">
              ({calculatePercentage(stats.tidak)}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data berstatus tidak terdaftar
          </p>
        </div>

      </div>

      {/* Progres Status Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Distribusi Status Verifikasi Equipment
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total {stats.total} data
          </span>
        </div>

        {/* Multi-segment bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${calculatePercentage(stats.terdaftar)}%` }} 
            className="bg-emerald-500 transition-all duration-500" 
            title={`Terdaftar: ${stats.terdaftar}`} 
          />
          <div 
            style={{ width: `${calculatePercentage(stats.tidak)}%` }} 
            className="bg-rose-500 transition-all duration-500" 
            title={`Tidak: ${stats.tidak}`} 
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Terdaftar ({stats.terdaftar})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Tidak ({stats.tidak})</span>
          </div>
        </div>
      </div>

      {/* Tabel 5 Data EQ Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              5 Data Equipment Terakhir Ditambahkan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan transaksi entri data paling baru
            </p>
          </div>
          <button
            onClick={() => setActiveTab('data')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Lihat Semua Tabel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 font-semibold">Nomor EQ</th>
                <th className="px-5 py-3 font-semibold">Nama Customer</th>
                <th className="px-5 py-3 font-semibold">CST</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Tanggal Input</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEqList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                    Belum ada data equipment yang tercatat. Silakan lakukan input data baru.
                  </td>
                </tr>
              ) : (
                recentEqList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-900">
                      {item.nomor_eq}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {item.nama_customer}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {item.cst}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {item.created_at ? item.created_at.substring(0, 10) : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg hover:bg-emerald-50 transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
