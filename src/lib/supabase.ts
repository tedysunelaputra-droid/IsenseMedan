import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DataEq, User, EqStatus } from '../types';

// Ambil konfigurasi dari environment variable Vite (.env)
// Atau bisa disimpan di localStorage jika pengguna memasukkan via UI dialog pengaturan
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const ENV_URL = metaEnv.VITE_SUPABASE_URL || '';
const ENV_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('isense_supabase_url') || ENV_URL;
  const customKey = localStorage.getItem('isense_supabase_key') || ENV_KEY;
  return {
    url: customUrl.trim(),
    key: customKey.trim(),
    isConfigured: Boolean(customUrl && customKey && customUrl.startsWith('https://'))
  };
};

export const initSupabase = (url?: string, key?: string): SupabaseClient | null => {
  const config = getSupabaseConfig();
  const targetUrl = url || config.url;
  const targetKey = key || config.key;

  if (!targetUrl || !targetKey || !targetUrl.startsWith('https://')) {
    return null;
  }

  try {
    supabaseInstance = createClient(targetUrl, targetKey);
    return supabaseInstance;
  } catch (err) {
    console.warn('Gagal inisialisasi Supabase client:', err);
    return null;
  }
};

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    supabaseInstance = initSupabase();
  }
  return supabaseInstance;
};

// ============================================================================
// FUNGSI OPERASI DATABASE SUPABASE (DATA EQ)
// ============================================================================

export const fetchSupabaseEqData = async (): Promise<DataEq[] | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('data_eq')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: Number(row.id),
      nomor_eq: row.nomor_eq,
      nama_customer: row.nama_customer,
      cst: row.cst,
      status: row.status as EqStatus,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString()
    }));
  } catch (e) {
    console.error('Gagal mengambil data dari Supabase:', e);
    return null;
  }
};

export const insertSupabaseEqData = async (newItem: {
  nomor_eq: string;
  nama_customer: string;
  cst: string;
  status: EqStatus;
}): Promise<DataEq | null> => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from('data_eq')
      .insert([
        {
          nomor_eq: newItem.nomor_eq,
          nama_customer: newItem.nama_customer,
          cst: newItem.cst,
          status: newItem.status,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return {
      id: Number(data.id),
      nomor_eq: data.nomor_eq,
      nama_customer: data.nama_customer,
      cst: data.cst,
      status: data.status as EqStatus,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (e) {
    console.error('Gagal simpan ke Supabase:', e);
    throw e;
  }
};

export const updateSupabaseEqData = async (
  id: number,
  updatedFields: {
    nomor_eq: string;
    nama_customer: string;
    cst: string;
    status: EqStatus;
  }
): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('data_eq')
      .update({
        nomor_eq: updatedFields.nomor_eq,
        nama_customer: updatedFields.nama_customer,
        cst: updatedFields.cst,
        status: updatedFields.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Gagal update ke Supabase:', e);
    return false;
  }
};

export const deleteSupabaseEqData = async (id: number): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('data_eq')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Gagal delete di Supabase:', e);
    return false;
  }
};
