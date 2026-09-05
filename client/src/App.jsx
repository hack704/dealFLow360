import React from 'react';
import { Layers } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="text-center p-8 bg-slate-800 rounded-xl shadow-xl border border-slate-700 max-w-md w-full">
        <div className="flex justify-center mb-4 text-indigo-400">
          <Layers className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">DealFlow360</h1>
        <p className="mt-2 text-sm text-slate-400">
          Technology Stack Configured & Initialized
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs">
          <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 rounded-full border border-indigo-800">
            React + Vite
          </span>
          <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded-full border border-cyan-800">
            Tailwind CSS
          </span>
          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded-full border border-emerald-800">
            Node + Express
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
