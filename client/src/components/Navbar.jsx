import React from 'react';
import { Cpu, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full bg-[#0a0f1d]/85 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Distributed System Simulator
            </h1>
            <p className="text-xs text-slate-500 font-medium">Bully Election & Token Ring Consensus</p>
          </div>
        </div>

        {/* Real-time status heartbeat */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">System Healthy</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors cursor-help">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium">Nodes: 5 Active/Simulated</span>
          </div>
        </div>
      </div>
    </header>
  );
}
