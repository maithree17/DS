import React from 'react';
import { Crown, Database, AlertOctagon, RefreshCw, Zap } from 'lucide-react';

export default function NodeCard({
  node,
  onToggleStatus,
  onRequestDb,
  isElecting,
  isTarget,
  isLeaderElect
}) {
  const { id, name, status, isLeader, hasToken, dbRequest } = node;

  // Circle color classes based on state
  let circleBg = 'bg-blue-600 shadow-blue-500/30';
  let badgeText = 'Active';
  let badgeColor = 'text-blue-400 border-blue-500/30 bg-blue-500/5';

  if (status === 'failed') {
    circleBg = 'bg-red-600 shadow-red-500/30 animate-pulse';
    badgeText = 'Failed';
    badgeColor = 'text-red-400 border-red-500/30 bg-red-500/5';
  } else if (hasToken) {
    circleBg = 'bg-amber-500 shadow-amber-500/40 animate-bounce';
    badgeText = 'Token Holder';
    badgeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/5';
  }

  // Card outline styles for algorithms visualization
  let cardOutline = 'border-slate-800/80';
  let cardShadow = 'shadow-lg';

  if (status === 'failed') {
    cardOutline = 'border-red-950/80 ring-1 ring-red-900/30';
  } else if (isLeader) {
    cardOutline = 'border-amber-500/50 ring-2 ring-amber-500/30';
    cardShadow = 'shadow-xl shadow-amber-500/5';
  } else if (isElecting) {
    cardOutline = 'border-indigo-500 ring-2 ring-indigo-500/40 animate-pulse';
  } else if (isTarget) {
    cardOutline = 'border-sky-400 ring-2 ring-sky-400/40 animate-ping';
  } else if (isLeaderElect) {
    cardOutline = 'border-amber-400 ring-2 ring-amber-400/60 animate-bounce';
  }

  return (
    <div
      className={`relative bg-[#0d1527]/80 rounded-2xl p-5 border ${cardOutline} ${cardShadow} backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-[#0e1930] group flex flex-col items-center justify-between min-h-[220px]`}
    >
      {/* Crown Icon for Leader */}
      {isLeader && status === 'active' && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 p-1 rounded-full shadow-lg border border-amber-400 animate-pulse">
          <Crown className="w-4 h-4 fill-slate-950" />
        </div>
      )}

      {/* Node Circle Indicator */}
      <div className="relative mt-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md select-none transition-all duration-300 ${circleBg}`}>
          {id}
        </div>
        {/* Token mini-badge overlay if holding token */}
        {hasToken && status === 'active' && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold border-2 border-[#0d1527]">
            T
          </span>
        )}
      </div>

      {/* Node Info */}
      <div className="text-center mt-3">
        <h3 className="text-base font-semibold text-slate-200">{name}</h3>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border tracking-wide uppercase ${badgeColor}`}>
            {badgeText}
          </span>
          {isLeader && status === 'active' && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 tracking-wide uppercase">
              Leader
            </span>
          )}
        </div>
      </div>

      {/* Interactive Actions Panel */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800/60 flex justify-between gap-2">
        {/* Fail / Revive Button */}
        <button
          onClick={() => onToggleStatus(id)}
          className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer
            ${status === 'failed'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
            }`}
        >
          {status === 'failed' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Revive
            </>
          ) : (
            <>
              <AlertOctagon className="w-3.5 h-3.5" />
              Fail
            </>
          )}
        </button>

        {/* Request Database Lock (Only visible/active for active nodes) */}
        {status === 'active' && (
          <button
            onClick={() => onRequestDb(id)}
            disabled={!hasToken && dbRequest}
            className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer
              ${(!hasToken && dbRequest)
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 animate-pulse cursor-not-allowed'
                : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
          >
            <Database className="w-3.5 h-3.5" />
            {hasToken ? 'Lock DB' : dbRequest ? 'Pending' : 'Request DB'}
          </button>
        )}
      </div>
    </div>
  );
}
