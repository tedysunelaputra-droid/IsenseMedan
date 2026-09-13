import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, AlertCircle, Building2, UserCheck, Hash } from 'lucide-react';
import { DataEq, EqStatus } from '../types';

interface EditModalProps {
  isOpen: boolean;
  item: DataEq | null;
  onClose: () => void;
  onUpdate: (updated: DataEq) => Promise<boolean>;
  existingEqNumbers: string[];
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  onClose,
  onUpdate,
  existingEqNumbers
}) => {
  const [nomorEq, setNomorEq] = useState('');
  const [namaCustomer, setNamaCustomer] = useState('');
  const [cst, setCst] = useState('');
  const [status, setStatus] = useState<EqStatus>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setNomorEq(item.nomor_eq);
      setNamaCustomer(item.nama_customer);
      setCst(item.cst);
      setStatus(item.status);
      setErrorMsg(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNo = nomorEq.trim();
    const cleanCustomer = namaCustomer.trim();
    const cleanCst = cst.trim();

    if (!cleanNo || !cleanCustomer || !cleanCst) {
      setErrorMsg('Semua kolom wajib diisi.');
      return;
    }

    // Cek duplikasi nomor_eq dengan item selain yang sedang diedit
    if (cleanNo !== item.nomor_eq && existingEqNumbers.includes(cleanNo)) {
      setErrorMsg(`Nomor EQ "${cleanNo}" sudah digunakan oleh data lain!`);
      return;
    }

    setIsSubmitting(true);
    const success = await onUpdate({
      ...item,
      nomor_eq: cleanNo,
      nama_customer: cleanCustomer,
      cst: cleanCst,
      status: status,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Perbarui Data EQ (ID #{item.id})
              </h3>
              <p className="text-xs text-slate-500">
                Ubah informasi dan simpan pembaruan data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nomor EQ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Nomor EQ</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nomorEq}
              onChange={(e) => setNomorEq(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm transition"
              required
            />
          </div>

          {/* Nama Customer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Customer</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaCustomer}
              onChange={(e) => setNamaCustomer(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              required
            />
          </div>

          {/* CST & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>CST</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cst}
                onChange={(e) => setCst(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
             <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EqStatus)}
                className="..."
                required
                >
            <option value="Terdaftar">Terdaftar</option>
            <option value="Tidak">Tidak</option>
            </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
