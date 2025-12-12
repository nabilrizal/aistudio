import React, { useState } from 'react';
import ParkingCard from './components/ParkingCard';
import StatusPanel from './components/StatusPanel';
import Esp32Code from './components/Esp32Code';
import AndroidCode from './components/AndroidCode';
import { Car, Code2, LayoutDashboard, Smartphone } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'app' | 'android' | 'firmware'>('app');

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Car size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-gray-900 leading-tight">E-Parking NFC</h1>
                    <p className="text-xs text-gray-500">Android System Simulation</p>
                </div>
            </div>
            
            <nav className="flex gap-1">
                <button 
                    onClick={() => setActiveTab('app')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'app' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <LayoutDashboard size={16} /> Simulation
                </button>
                <button 
                    onClick={() => setActiveTab('android')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'android' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Smartphone size={16} /> Android Project
                </button>
                <button 
                    onClick={() => setActiveTab('firmware')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'firmware' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Code2 size={16} /> ESP32 Code
                </button>
            </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'app' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Android App Interface */}
                <div className="md:col-span-5 space-y-6">
                    <div className="flex items-center justify-between">
                         <h2 className="text-lg font-bold text-gray-800">Android Terminal</h2>
                         <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded">V3.0.1</span>
                    </div>
                    <ParkingCard onSuccess={() => {}} />
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <p className="font-bold mb-1">How to use:</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-700">
                            <li>Enter a UID (e.g., E5F6G7H8).</li>
                            <li>Click "TAP NFC".</li>
                            <li>Watch the Gate and Logs update.</li>
                        </ol>
                    </div>
                </div>

                {/* Right Column: Physical World Simulation */}
                <div className="md:col-span-7 space-y-6">
                    <h2 className="text-lg font-bold text-gray-800">System State & Hardware</h2>
                    <StatusPanel />
                </div>
            </div>
        ) : activeTab === 'android' ? (
            <div className="max-w-4xl mx-auto">
                 <AndroidCode />
            </div>
        ) : (
            <div className="max-w-4xl mx-auto">
                 <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">ESP32 Firmware</h2>
                    <p className="text-gray-600">Flash this code to your ESP32 board using Arduino IDE.</p>
                 </div>
                 <Esp32Code />
            </div>
        )}
      </main>
    </div>
  );
}