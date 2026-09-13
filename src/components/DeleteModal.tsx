import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { DataEq } from '../types';

interface DeleteModalProps {
  isOpen: boolean;
  item: DataEq | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<boolean>;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onConfirm(item.id);
    setIsDeleting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 text-center animate-in fade-in zoom-in-95">
        
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          Konfirmasi Hapus Data EQ?
        </h3>
        
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Apakah Anda yakin ingin menghapus data dengan Nomor EQ{' '}
          <strong className="text-rose-600 font-mono font-semibold">{item.nomor_eq}</strong> (Customer:{' '}
          <span className="font-semibold text-slate-800">{item.nama_customer}</span>)?
        </p>

        <div className="mt-4 p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-[11px] text-rose-700 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Tindakan ini akan menghapus data secara permanen.</span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
          >
            Batalkan
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
