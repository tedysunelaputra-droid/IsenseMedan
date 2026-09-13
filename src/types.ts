export type EqStatus = 'Terdaftar' | 'Tidak';

export interface DataEq {
  id: number;
  nomor_eq: string;
  nama_customer: string;
  cst: string;
  status: EqStatus;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  role?: string;
}

export interface EqStats {
  total: number;
  diproses: number;
  selesai: number;
  batal: number;
  pending: number;
}

export type ActiveTab = 'dashboard' | 'input' | 'data';
