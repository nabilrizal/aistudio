import React, { useState } from 'react';
import { Loader2, Wifi, ScanLine, Smartphone } from 'lucide-react';
import { processNfcTap } from '../services/parkingService';
import { User } from '../types';

interface ParkingCardProps {
  onSuccess: () => void;
}

const ParkingCard: React.FC<ParkingCardProps> = ({ onSuccess }) => {
  const [uid, setUid] = useState('E5F6G7H8'); // Default test UID
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    title: string;
    msg: string;
    cost?: number;
    duration?: string;
  } | null>(null);

  const handleScan = async () => {
    if (!uid) return;
    setLoading(true);
    setResult(null);

    const res = await processNfcTap(uid);

    setLoading(false);
    
    // Format duration for display
    let durationStr = "";
    if (res.duration) {
        const hrs = Math.floor(res.duration / 3600);
        const mins = Math.floor((res.duration % 3600) / 60);
        const secs = res.duration % 60;
        durationStr = `${hrs}h ${mins}m ${secs}s`;
    }

    setResult({
      success: res.success,
      title: res.success ? "Scan Berhasil" : "Scan Gagal",
      msg: res.message,
      cost: res.cost,
      duration: durationStr
    });

    if (res.success) onSuccess();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Smartphone size={20} /> App Simulation
        </h2>
        <Wifi size={18} className="animate-pulse" />
      </div>

      <div className="p-6 flex flex-col items-center">
        <div className="w-full mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Simulate NFC Tag (UID)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={uid}
              onChange={(e) => setUid(e.target.value.toUpperCase())}
              className="flex-1 p-2 border border-gray-300 rounded-lg font-mono text-center uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="A1B2C3D4"
            />
            <button
              onClick={() => setUid(Math.random().toString(16).slice(2, 10).toUpperCase())}
              className="bg-gray-100 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-200"
            >
              Random
            </button>
          </div>
        </div>

        <button 
          onClick={handleScan}
          disabled={loading || !uid}
          className={`
            w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center
            transition-all duration-300
            ${loading ? 'border-gray-300 bg-gray-50' : 'border-blue-500 bg-blue-50 hover:bg-blue-100 hover:scale-105 active:scale-95'}
          `}
        >
          {loading ? (
            <Loader2 className="animate-spin text-gray-400" size={40} />
          ) : (
            <>
              <ScanLine size={32} className="text-blue-600 mb-2" />
              <span className="text-blue-700 font-bold text-sm">TAP NFC</span>
            </>
          )}
        </button>
        <p className="text-gray-400 text-xs mt-4">Klik tombol di atas untuk simulasi Tap Kartu</p>

        {result && (
            <div className={`mt-6 w-full p-4 rounded-lg border-l-4 ${result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.title}</h3>
                <p className="text-gray-700 mt-1">{result.msg}</p>
                
                {result.cost !== undefined && result.cost > 0 && (
                     <div className="mt-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Durasi:</span>
                            <span className="font-mono">{result.duration}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-800 mt-1">
                            <span>Biaya:</span>
                            <span>Rp {result.cost.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ParkingCard;