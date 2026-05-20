import React from 'react';
import { ShieldAlert, Play, RefreshCw, Unlock, Send } from 'lucide-react';

export default function ControlPanel({
  onFailLeader,
  onStartElection,
  onPassToken,
  onReleaseResource,
  onReset,
  isElectionRunning,
  isDbLocked,
  leaderId,
  nodes
}) {
  const isLeaderFailed = !leaderId || nodes.find(n => n.id === leaderId)?.status === 'failed';
  const activeNodesCount = nodes.filter(n => n.status === 'active').length;

  return (
    <div className="w-full bg-[#0e1626]/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-wrap gap-4 items-center justify-center">
      {/* Fail Leader Button */}
      <button
        onClick={onFailLeader}
        disabled={isElectionRunning || isLeaderFailed}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 text-sm shadow-lg
          ${(isElectionRunning || isLeaderFailed)
            ? 'bg-red-950/20 text-red-700 border border-red-900/30 cursor-not-allowed shadow-none'
            : 'bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-red-600/10 hover:shadow-red-500/20 cursor-pointer border border-red-500/20'
          }`}
      >
        <ShieldAlert className="w-4 h-4" />
        Fail Leader
      </button>

      {/* Start Election Button */}
      <button
        onClick={onStartElection}
        disabled={isElectionRunning || activeNodesCount <= 1}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 text-sm shadow-lg
          ${(isElectionRunning || activeNodesCount <= 1)
            ? 'bg-indigo-950/20 text-indigo-700 border border-indigo-900/30 cursor-not-allowed shadow-none'
            : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-indigo-600/10 hover:shadow-indigo-500/20 cursor-pointer border border-indigo-500/20'
          }`}
      >
        <Play className="w-4 h-4" />
        Start Election
      </button>

      {/* Pass Token Button */}
      <button
        onClick={onPassToken}
        disabled={isElectionRunning || isDbLocked || activeNodesCount <= 1}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 text-sm shadow-lg
          ${(isElectionRunning || isDbLocked || activeNodesCount <= 1)
            ? 'bg-amber-950/20 text-amber-700/60 border border-amber-900/30 cursor-not-allowed shadow-none'
            : 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 hover:shadow-amber-500/20 cursor-pointer shadow-amber-500/10 border border-amber-400/20'
          }`}
      >
        <Send className="w-4 h-4" />
        Pass Token
      </button>

      {/* Release Resource Button */}
      <button
        onClick={onReleaseResource}
        disabled={isElectionRunning || !isDbLocked}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 text-sm shadow-lg
          ${(isElectionRunning || !isDbLocked)
            ? 'bg-emerald-950/20 text-emerald-700 border border-emerald-900/30 cursor-not-allowed shadow-none'
            : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-600/10 hover:shadow-emerald-500/20 cursor-pointer border border-emerald-500/20'
          }`}
      >
        <Unlock className="w-4 h-4" />
        Release Resource
      </button>

      {/* Reset Simulation Button */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 text-sm shadow-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-white shadow-slate-700/10 hover:shadow-slate-600/20 cursor-pointer border border-slate-600/35"
      >
        <RefreshCw className="w-4 h-4" />
        Reset Simulation
      </button>
    </div>
  );
}
