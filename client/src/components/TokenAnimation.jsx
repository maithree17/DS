import React, { useEffect, useState } from 'react';

export default function TokenAnimation({ nodes, tokenPositionId, containerRef }) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPositions = {};

      nodes.forEach(node => {
        const el = document.getElementById(`node-circle-${node.id}`);
        if (el) {
          const elRect = el.getBoundingClientRect();
          newPositions[node.id] = {
            x: elRect.left - containerRect.left + elRect.width / 2,
            y: elRect.top - containerRect.top + elRect.height / 2
          };
        }
      });
      setPositions(newPositions);
    };

    updatePositions();
    
    // Add event listeners for resizing and DOM changes
    window.addEventListener('resize', updatePositions);
    
    // Set a sequence of timeouts to handle rendering delays
    const timer1 = setTimeout(updatePositions, 100);
    const timer2 = setTimeout(updatePositions, 500);

    return () => {
      window.removeEventListener('resize', updatePositions);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [nodes, containerRef]);

  // Find the next active node in circular ID order
  const getNextNodeId = (id) => {
    const sorted = [...nodes].sort((a, b) => a.id - b.id);
    const idx = sorted.findIndex(n => n.id === id);
    if (idx === -1) return null;
    
    let nextIdx = (idx + 1) % sorted.length;
    let attempts = 0;
    
    while (attempts < sorted.length) {
      if (sorted[nextIdx].status === 'active') {
        return sorted[nextIdx].id;
      }
      nextIdx = (nextIdx + 1) % sorted.length;
      attempts++;
    }
    return null;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-2xl">
      <svg className="w-full h-full">
        {/* Define arrow markers for direction */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="22" // offset to position arrow before the circle
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(245, 158, 11, 0.6)" />
          </marker>
        </defs>

        {/* Draw connections */}
        {nodes.map(node => {
          if (node.status !== 'active') return null;
          const nextId = getNextNodeId(node.id);
          if (!nextId || nextId === node.id) return null;
          
          const start = positions[node.id];
          const end = positions[nextId];
          if (!start || !end) return null;

          const isTokenPath = tokenPositionId === node.id;

          return (
            <g key={`path-${node.id}-${nextId}`}>
              {/* Backing structural line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#1e293b"
                strokeWidth="2"
                strokeDasharray="4 4"
                markerEnd="url(#arrow)"
                className="transition-all duration-300"
              />
              
              {/* Animated glowing path representing token availability */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isTokenPath ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.15)'}
                strokeWidth="2"
                strokeDasharray="8 6"
                markerEnd={isTokenPath ? 'url(#arrow-active)' : 'url(#arrow)'}
                className={`transition-all duration-500 ${
                  isTokenPath 
                    ? 'animate-[dash_1s_linear_infinite] stroke-amber-500/50' 
                    : 'animate-[dash_4s_linear_infinite]'
                }`}
                style={{
                  strokeDashoffset: isTokenPath ? -100 : 0
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Glowing Token Dot */}
      {tokenPositionId && positions[tokenPositionId] && (
        <div
          className="absolute w-7 h-7 -mt-3.5 -ml-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.85)] flex items-center justify-center text-[10px] font-black text-slate-950 transition-all duration-700 ease-in-out animate-pulse"
          style={{
            left: positions[tokenPositionId].x,
            top: positions[tokenPositionId].y,
          }}
        >
          Token
        </div>
      )}
    </div>
  );
}
