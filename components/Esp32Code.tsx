import React from 'react';
import { Copy, FileCode } from 'lucide-react';
import { ESP32_FIRMWARE_CODE } from '../constants';

const Esp32Code = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText(ESP32_FIRMWARE_CODE);
    alert("Code copied to clipboard!");
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden text-white">
      <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <h3 className="font-bold flex items-center gap-2">
            <FileCode size={20} className="text-yellow-400" /> 
            ESP32 Firmware (Arduino C++)
        </h3>
        <button 
            onClick={handleCopy}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
        >
            <Copy size={14} /> Copy Code
        </button>
      </div>
      <div className="p-4 overflow-auto max-h-[500px]">
        <pre className="text-xs font-mono text-green-400 leading-relaxed">
            {ESP32_FIRMWARE_CODE}
        </pre>
      </div>
    </div>
  );
};

export default Esp32Code;