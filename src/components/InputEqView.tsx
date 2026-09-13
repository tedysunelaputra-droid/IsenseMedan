import React, { useState } from 'react';
import { 
  FilePlus, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Building2,
  UserCheck,
  Hash
} from 'lucide-react';
import { EqStatus } from '../types';

interface InputEqViewProps {
  onSave: (data: {
    nomor_eq: string;
    nama_customer: string;
    cst: string;
    status: EqStatus;
  }) => Promise<boolean>;
  existingEqNumbers: string[];
}

export const InputEqView: React.FC<InputEqViewProps> = ({
  onSave,
  existingEqNumbers
}) => {
  const [nomorEq, setNomorEq] = useState('');
  const [namaCustomer, setNamaCustomer] = useState('');
  const [cst, setCst] = useState('');
  const [status, setStatus] = useState<EqStatus>('Terdaftar');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNo = nomorEq.trim();
    const cleanCustomer = namaCustomer.trim();
    const cleanCst = cst.trim();

    if (!cleanNo || !cleanCustomer || !cleanCst) {
      setErrorMsg('Semua field bertanda bintang (*) wajib diisi.');
      return;
    }

    // Cek duplikasi nomor EQ
    if (existingEqNumbers.includes(cleanNo)) {
      setErrorMsg(`Nomor EQ "${cleanNo}" sudah terdaftar di sistem! Silakan gunakan nomor lain.`);
      return;
    }

    setIsSubmitting(true);
    const success = await onSave({
      nomor_eq: cleanNo,
      nama_customer: cleanCustomer,
      cst: cleanCst,
      status: status
    });
    setIsSubmitting(false);

    if (success) {
      // Reset form
      setNomorEq('');
      setNamaCustomer('');
      setCst('');
      setStatus('Diproses');
    }
  };

  const handleReset = () => {
    setNomorEq('');
    setNamaCustomer('');
    setCst('');
    setStatus('Diproses');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Formulir Input Data EQ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
               Lengkapi seluruh formulir di bawah ini dengan valid untuk mencatat data baru.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Nomor EQ */}
          <div>
            <label htmlFor="input-nomor-eq" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Nomor EQ</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-nomor-eq"
              type="text"
              value={nomorEq}
              onChange={(e) => setNomorEq(e.target.value)}
              placeholder="Contoh: EQ-2025-MDN-007"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm transition"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Format standar: EQ-[Tahun]-[Kode Cabang]-[Nomor Urut]
            </p>
          </div>

          {/* 2. Nama Customer */}
          <div>
            <label htmlFor="input-customer" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Customer</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-customer"
              type="text"
              value={namaCustomer}
              onChange={(e) => setNamaCustomer(e.target.value)}
              placeholder="Contoh: PT. Maju Berkah Bersama"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition"
              required
            />
          </div>

          {/* 3. CST & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CST */}
            <div>
              <label htmlFor="input-cst" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>CST (Customer Service Team)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-cst"
                type="text"
                value={cst}
                onChange={(e) => setCst(e.target.value)}
                placeholder="Contoh: CST-Budi Santoso"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="input-status" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Status Pengerjaan <span className="text-rose-500">*</span>
              </label>
             <select
              id="input-status"
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

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>
            <button
              type="submit"
              id="btn-submit-eq"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data EQ'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
