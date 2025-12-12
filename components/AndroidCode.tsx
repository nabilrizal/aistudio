import React, { useState } from 'react';
import { Copy, FileCode, Smartphone, FileJson, FileType } from 'lucide-react';
import { ANDROID_ACTIVITY, ANDROID_GRADLE, ANDROID_MANIFEST } from '../constants';

const AndroidCode = () => {
  const [activeFile, setActiveFile] = useState<'main' | 'manifest' | 'gradle'>('main');

  const files = {
    main: { name: "MainActivity.kt", code: ANDROID_ACTIVITY, icon: <FileType size={16} /> },
    manifest: { name: "AndroidManifest.xml", code: ANDROID_MANIFEST, icon: <FileCode size={16} /> },
    gradle: { name: "build.gradle (app)", code: ANDROID_GRADLE, icon: <FileJson size={16} /> }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].code);
    alert(`${files[activeFile].name} copied to clipboard!`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Smartphone className="text-green-600" />
                Android Studio Project Files
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                Copy these files into your Android Studio project to build the native app.
            </p>
        </div>

        <div className="flex border-b border-gray-100 bg-gray-50">
            {(Object.keys(files) as Array<keyof typeof files>).map((key) => (
                <button
                    key={key}
                    onClick={() => setActiveFile(key)}
                    className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                        activeFile === key 
                        ? 'border-green-500 text-green-700 bg-white' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {files[key].icon}
                    {files[key].name}
                </button>
            ))}
        </div>

        <div className="bg-gray-900 text-white relative">
            <div className="absolute top-4 right-4">
                 <button 
                    onClick={handleCopy}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded flex items-center gap-2 transition-colors border border-gray-600"
                >
                    <Copy size={14} /> Copy
                </button>
            </div>
            <div className="p-4 overflow-auto max-h-[600px]">
                 <pre className="text-xs font-mono text-green-400 leading-relaxed pt-2">
                    {files[activeFile].code}
                 </pre>
            </div>
        </div>
    </div>
  );
};

export default AndroidCode;