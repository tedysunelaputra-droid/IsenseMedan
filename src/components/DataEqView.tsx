import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Plus, 
  Download, 
  RefreshCw, 
  Database,
  ArrowUpDown,
  Inbox
} from 'lucide-react';
import { DataEq, EqStatus, ActiveTab } from '../types';

interface DataEqViewProps {
  data: DataEq[];
  onEdit: (item: DataEq) => void;
  onDelete: (item: DataEq) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export const DataEqView: React.FC<DataEqViewProps> = ({
  data,
  onEdit,
  onDelete,
  setActiveTab,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'customer'>('newest');

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          item.nomor_eq.toLowerCase().includes(query) ||
          item.nama_customer.toLowerCase().includes(query) ||
          item.cst.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'all' || item.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else {
          return a.nama_customer.localeCompare(b.nama_customer);
        }
      });
  }, [data, searchQuery, statusFilter, sortBy]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['No', 'Nomor EQ', 'Nama Customer', 'CST', 'Status', 'Waktu Masuk', 'Waktu Update'];
    const rows = filteredData.map((item, index) => [
      index + 1,
      `"${item.nomor_eq}"`,
      `"${item.nama_customer.replace(/"/g, '""')}"`,
      `"${item.cst.replace(/"/g, '""')}"`,
      item.status,
      `"${item.created_at}"`,
      `"${item.updated_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `isense_medan_data_eq_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const getStatusBadge = (status: EqStatus | string) => {
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

  return (
    <div className="space-y-6">
      
      {/* Table Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Tabel Manajemen Data EQ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola, perbarui, atau hapus data equipment/estimation Isense Medan
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari EQ / Customer / CST..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5">
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="customer">Nama Customer (A-Z)</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              title="Unduh Data CSV"
              className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              title="Muat Ulang Data"
              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Add New Button */}
            <button
              onClick={() => setActiveTab('input')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah EQ</span>
            </button>

          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nomor EQ</th>
                <th className="py-3.5 px-4">Nama Customer</th>
                <th className="py-3.5 px-4">CST</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal Masuk</th>
                <th className="py-3.5 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 text-sm">
                    <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-medium text-slate-600">Tidak ada data EQ yang sesuai kriteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700 text-xs">
                      {item.nomor_eq}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {item.nama_customer}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {item.cst}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {item.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEdit(item)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition flex items-center gap-1"
                          title="Edit Data EQ"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition flex items-center gap-1"
                          title="Hapus Data EQ"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>
            Menampilkan <strong className="text-slate-800 font-semibold">{filteredData.length}</strong> dari <strong className="text-slate-800 font-semibold">{data.length}</strong> data EQ
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[11px] text-slate-500">Tabel: data_eq</span>
          </div>
        </div>

      </div>

    </div>
  );
};
