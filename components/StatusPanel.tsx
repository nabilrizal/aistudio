import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { LogEntry, User } from '../types';
import { Car, Clock, History, AlertCircle, CheckCircle2 } from 'lucide-react';

const StatusPanel = () => {
  const [gateTrigger, setGateTrigger] = useState<string>("IDLE");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Listener for Gate Trigger
    const triggerRef = ref(db, 'trigger/servo');
    const unsubTrigger = onValue(triggerRef, (snapshot) => {
      setGateTrigger(snapshot.val() || "IDLE");
    });

    // Listener for Logs
    const logsRef = ref(db, 'logs');
    const unsubLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedLogs = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        })).sort((a, b) => b.timestamp - a.timestamp); // Newest first
        setLogs(loadedLogs.slice(0, 5)); // Keep last 5
      }
    });

    return () => {
      unsubTrigger();
      unsubLogs();
    };
  }, []);

  const isGateActive = gateTrigger === "OPEN_IN" || gateTrigger === "OPEN_OUT";

  return (
    <div className="space-y-6">
      {/* ESP32 Gate Simulation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">ESP32 Gate Status (GPIO 27)</h3>
        
        <div className="flex items-center gap-6">
          <div className={`relative w-24 h-16 rounded-lg flex items-center justify-center transition-colors duration-500 ${isGateActive ? 'bg-green-500' : 'bg-red-500'}`}>
             <span className="text-white font-bold text-xs absolute top-1 left-2">SERVO</span>
             <div className="text-white font-bold text-xl">
                {isGateActive ? '90°' : '0°'}
             </div>
             <div className="absolute -bottom-2 w-full text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${isGateActive ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isGateActive ? 'OPEN' : 'CLOSED'}
                </span>
             </div>
          </div>

          <div className="flex-1">
             <div className="text-sm text-gray-600 mb-1">Firebase Trigger Value:</div>
             <code className="block bg-gray-900 text-green-400 p-2 rounded text-sm font-mono">
                trigger/servo = "{gateTrigger}"
             </code>
             <p className="text-xs text-gray-400 mt-2">
                {isGateActive 
                    ? "The ESP32 is currently holding the gate open (3s delay)." 
                    : "Waiting for command..."}
             </p>
          </div>
        </div>
      </div>

      {/* Realtime Logs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <History size={18} /> Live Transaction Logs
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Realtime</span>
        </div>
        <div className="divide-y divide-gray-100">
            {logs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No transactions yet.</div>
            ) : (
                logs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                        <div className={`mt-1 ${log.status === 'SUKSES' ? 'text-green-500' : 'text-red-500'}`}>
                            {log.status === 'SUKSES' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-800">
                                    {log.action} <span className="text-gray-400 mx-1">•</span> {log.uid}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">
                                    {new Date(log.timestamp * 1000).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-end mt-1">
                                <p className="text-xs text-gray-500">
                                    {log.status === 'SUKSES' 
                                        ? (log.action === 'KELUAR' ? `Biaya: Rp ${log.biaya.toLocaleString('id-ID')}` : 'Check-in Recorded')
                                        : 'Insufficient Balance'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;