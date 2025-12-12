export interface User {
  nama: string;
  saldo: number;
  is_parked: boolean;
  last_entry: number; // Unix timestamp
}

export interface Config {
  biaya_parkir: number;
  gate_status: "AUTO" | "OPEN" | "CLOSE";
  mode_parkir: "FLAT" | "PER_JAM";
}

export interface LogEntry {
  uid: string;
  timestamp: number;
  action: "MASUK" | "KELUAR";
  biaya: number;
  status: "SUKSES" | "GAGAL";
  id?: string;
}

export interface ParkingResult {
  success: boolean;
  message: string;
  cost?: number;
  duration?: number; // seconds
  user?: User;
}

// Map structure for Users in Firebase
export interface UsersMap {
  [uid: string]: User;
}