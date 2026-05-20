import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function EventLogs({ logs, onClearLogs }) {
  const bottomRef = useRef(null);

  // Auto-scroll logs to bottom whenever the logs change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full bg-[#0e1626]/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col h-[280px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Distributed System Event Logs
        </h2>
        <button
          onClick={onClearLogs}
          title="Clear Terminal Logs"
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all duration-200 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal View */}
      <div className="flex-1 bg-[#050811] border border-slate-800/80 rounded-xl p-4 overflow-y-auto font-mono text-xs md:text-sm select-text relative shadow-inner">
        {/* Terminal Header Decoration */}
        <div className="absolute top-2 right-4 flex gap-1.5 opacity-55">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/85"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/85"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/85"></span>
        </div>

        {logs.length === 0 ? (
          <div className="text-slate-600 italic select-none h-full flex items-center justify-center">
            No events recorded yet. Perform actions above to simulate logs.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 transition-all duration-300 leading-relaxed
                  ${log.type === 'bully' ? 'text-indigo-400' : 
                    log.type === 'token' ? 'text-amber-400' : 
                    log.type === 'db' ? 'text-emerald-400' : 
                    log.type === 'error' ? 'text-red-400' : 'text-emerald-500/90'
                  }`}
              >
                {/* Monospace Timestamp */}
                <span className="text-slate-600 select-none font-semibold">
                  [{log.timestamp}]
                </span>
                
                {/* Console prompt symbol */}
                <span className="text-emerald-500 select-none font-extrabold">&gt;</span>

                {/* Log Text */}
                <span className="flex-1 whitespace-pre-wrap">{log.text}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
