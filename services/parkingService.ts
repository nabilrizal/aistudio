import { ref, get, update, push, set, child } from 'firebase/database';
import { db } from './firebase';
import { User, Config, LogEntry, ParkingResult } from '../types';

/**
 * Handles the "Tap" logic. 
 * Detects if it's entry or exit based on user state.
 */
export const processNfcTap = async (uid: string): Promise<ParkingResult> => {
  const dbRef = ref(db);
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    // 1. Fetch Config and User Data
    const [configSnap, userSnap] = await Promise.all([
      get(child(dbRef, 'config')),
      get(child(dbRef, `users/${uid}`))
    ]);

    if (!userSnap.exists()) {
      return { success: false, message: "Kartu tidak terdaftar!" };
    }

    const config = configSnap.val() as Config;
    const user = userSnap.val() as User;
    const updates: any = {};

    // ----------------------------------------
    // SCENARIO 1: ENTRY (Tap In)
    // ----------------------------------------
    if (!user.is_parked) {
      // Check for minimum balance if needed (optional based on requirements, but usually good practice)
      if (user.saldo < config.biaya_parkir) {
        return { success: false, message: "Saldo kurang untuk deposit masuk!" };
      }

      // Update User
      updates[`users/${uid}/is_parked`] = true;
      updates[`users/${uid}/last_entry`] = timestamp;

      // Create Log
      const logEntry: Omit<LogEntry, 'id'> = {
        uid,
        timestamp,
        action: "MASUK",
        biaya: 0, // No charge on entry usually
        status: "SUKSES"
      };
      const newLogKey = push(child(dbRef, 'logs')).key;
      updates[`logs/${newLogKey}`] = logEntry;

      // Trigger Servo
      updates[`trigger/servo`] = "OPEN_IN";

      await update(dbRef, updates);
      return { success: true, message: "Silakan Masuk", user: { ...user, is_parked: true, last_entry: timestamp } };
    } 
    
    // ----------------------------------------
    // SCENARIO 2: EXIT (Tap Out)
    // ----------------------------------------
    else {
      // Calculate Duration
      const durationSeconds = timestamp - user.last_entry;
      const durationHours = Math.ceil(durationSeconds / 3600); // Ceiling to nearest hour

      // Calculate Cost
      let cost = 0;
      if (config.mode_parkir === "FLAT") {
        cost = config.biaya_parkir;
      } else {
        // PER_JAM mode
        cost = config.biaya_parkir * (durationHours === 0 ? 1 : durationHours);
      }

      // Check Balance
      if (user.saldo >= cost) {
        const newBalance = user.saldo - cost;

        // Update User
        updates[`users/${uid}/is_parked`] = false;
        updates[`users/${uid}/saldo`] = newBalance;
        updates[`users/${uid}/last_entry`] = 0;

        // Create Log
        const logEntry: Omit<LogEntry, 'id'> = {
          uid,
          timestamp,
          action: "KELUAR",
          biaya: cost,
          status: "SUKSES"
        };
        const newLogKey = push(child(dbRef, 'logs')).key;
        updates[`logs/${newLogKey}`] = logEntry;

        // Trigger Servo
        updates[`trigger/servo`] = "OPEN_OUT";

        await update(dbRef, updates);
        return { 
          success: true, 
          message: "Transaksi Berhasil", 
          cost, 
          duration: durationSeconds,
          user: { ...user, is_parked: false, saldo: newBalance }
        };
      } else {
        // Balance Insufficient
        // Create Failed Log
         const logEntry: Omit<LogEntry, 'id'> = {
          uid,
          timestamp,
          action: "KELUAR",
          biaya: cost,
          status: "GAGAL"
        };
        const newLogKey = push(child(dbRef, 'logs')).key;
        updates[`logs/${newLogKey}`] = logEntry;
        
        await update(dbRef, updates);

        return { 
          success: false, 
          message: "Saldo Tidak Mencukupi!", 
          cost,
          user 
        };
      }
    }

  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
};
