import React, { useState } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Key, 
  Globe, 
  X, 
  AlertCircle,
  Database
} from 'lucide-react';
import { getSupabaseConfig, initSupabase } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnected
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [key, setKey] = useState(currentConfig.key || '');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !key.trim()) {
      setStatusMsg('Harap masukkan Project URL dan Anon Key dari Supabase.');
      return;
    }

    if (!url.trim().startsWith('https://')) {
      setStatusMsg('Project URL harus diawali dengan https:// (contoh: https://xyz.supabase.co)');
      return;
    }

    localStorage.setItem('isense_supabase_url', url.trim());
    localStorage.setItem('isense_supabase_key', key.trim());
    
    // Re-init client
    initSupabase(url.trim(), key.trim());
    setStatusMsg(null);
    onConnected();
    onClose();
  };

  const handleDisconnect = () => {
    localStorage.removeItem('isense_supabase_url');
    localStorage.removeItem('isense_supabase_key');
    setUrl('');
    setKey('');
    onConnected();
  };

  const handleCopySql = () => {
    const sql = `-- Salin dan jalankan di SQL Editor Supabase:
CREATE TABLE IF NOT EXISTS public.data_eq (
  id BIGSERIAL PRIMARY KEY,
  nomor_eq VARCHAR(50) UNIQUE NOT NULL,
  nama_customer VARCHAR(150) NOT NULL,
  cst VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.data_eq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Akses Publik data_eq" ON public.data_eq FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hubungkan ke Supabase (Database Terpusat)</h3>
              <p className="text-xs text-slate-600">Sinkronisasi data online real-time antar perangkat (HP & Laptop)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700">
          
          {/* Status Sekarang */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            currentConfig.isConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${
                currentConfig.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider">
                  Status: {currentConfig.isConfigured ? 'Terhubung ke Supabase Cloud' : 'Mode Offline / Lokal (LocalStorage)'}
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {currentConfig.isConfigured 
                    ? 'Data langsung tersimpan di cloud Supabase dan tersinkronisasi antar-perangkat.' 
                    : 'Data saat ini masih disimpan di browser laptop ini saja.'}
                </p>
              </div>
            </div>

            {currentConfig.isConfigured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs text-rose-600 hover:underline font-semibold shrink-0 ml-3"
              >
                Putuskan
              </button>
            )}
          </div>

          {/* Tutorial Singkat */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Cara Mendapatkan Kunci Supabase (Gratis):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <li>Buka <strong>supabase.com</strong> &rarr; Buat proyek baru (misal: <em>isense-medan</em>).</li>
              <li>Buka menu <strong>SQL Editor</strong> &rarr; jalankan skrip dari file <code>supabase_schema.sql</code>.</li>
              <li>Buka <strong>Project Settings (Gerigi) &rarr; API</strong> &rarr; Salin <em>Project URL</em> & <em>anon public key</em>.</li>
              <li>Tempelkan kedua nilai tersebut pada kolom di bawah ini:</li>
            </ol>
            
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCopySql}
                className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Skrip SQL Tersalin!' : 'Salin Skrip Tabel Supabase'}</span>
              </button>
            </div>
          </div>

          {/* Form Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdefghijklm.supabase.co"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Anon Public API Key</span>
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
              />
            </div>

            {statusMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            <span>Buka Dashboard Supabase</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hubungkan Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
