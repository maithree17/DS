import React from 'react';
import { Crown, Database, Key, ServerOff } from 'lucide-react';

export default function SystemStatus({ leaderId, tokenPositionId, dbStatus, nodes }) {
  // Find leader node
  const leaderNode = nodes.find(n => n.id === leaderId);
  const isLeaderFailed = !leaderNode || leaderNode.status === 'failed';
  
  // Format leader text
  let leaderText = 'No Leader';
  let leaderSubText = 'Select Start Election to elect a coordinator';
  let leaderBadgeStyle = 'bg-red-500/10 text-red-400 border-red-500/30';
  let LeaderIcon = ServerOff;

  if (leaderNode) {
    if (leaderNode.status === 'failed') {
      leaderText = 'Leader Failed';
      leaderSubText = `Node ${leaderId} is inactive`;
      leaderBadgeStyle = 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse';
    } else {
      leaderText = `Node ${leaderId}`;
      leaderSubText = 'Coordinator is active and healthy';
      leaderBadgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      LeaderIcon = Crown;
    }
  }

  // Token position details
  const tokenHolderNode = nodes.find(n => n.id === tokenPositionId);
  const tokenText = tokenHolderNode 
    ? `Token currently at Node ${tokenPositionId}`
    : 'Token lost / Ring inactive';

  // DB Lock status details
  const isAvailable = dbStatus === 'AVAILABLE';
  const dbBadgeColor = isAvailable 
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' 
    : 'text-rose-400 border-rose-500/30 bg-rose-500/5 animate-pulse';

  return (
    <div className="w-full bg-[#0e1626]/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col h-full">
      <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
        System Status
      </h2>

      <div className="flex flex-col gap-5 flex-1">
        {/* Leader Status Card */}
        <div className="bg-[#0b101c] border border-slate-800/60 rounded-xl p-4.5 transition-all duration-300 hover:border-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Leader Status</p>
          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isLeaderFailed ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {isLeaderFailed ? <ServerOff className="w-5 h-5" /> : <Crown className="w-5 h-5 fill-amber-400/20" />}
              </div>
              <div>
                <p className="text-base font-bold text-slate-200">{leaderText}</p>
                <p className="text-xs text-slate-500 mt-0.5">{leaderSubText}</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${leaderBadgeStyle}`}>
              {isLeaderFailed ? 'Offline' : 'Active'}
            </span>
          </div>
        </div>

        {/* Token Position Card */}
        <div className="bg-[#0b101c] border border-slate-800/60 rounded-xl p-4.5 transition-all duration-300 hover:border-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Token Position</p>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-200">{tokenText}</p>
              <p className="text-xs text-slate-500 mt-0.5">Token allows database access locking</p>
            </div>
          </div>
        </div>

        {/* Shared Database Status Card */}
        <div className="bg-[#0b101c] border border-slate-800/60 rounded-xl p-4.5 transition-all duration-300 hover:border-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shared Database</p>
          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isAvailable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-200">
                  {isAvailable ? 'AVAILABLE' : dbStatus}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAvailable 
                    ? 'Ready for mutual exclusion access' 
                    : 'Locked - wait for Release Resource'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${dbBadgeColor}`}>
              {isAvailable ? 'Available' : 'Locked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
