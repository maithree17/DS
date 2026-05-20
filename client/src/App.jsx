import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ControlPanel from './components/ControlPanel';
import NodeCard from './components/NodeCard';
import SystemStatus from './components/SystemStatus';
import EventLogs from './components/EventLogs';
import TokenAnimation from './components/TokenAnimation';
import { generateElectionSteps } from './algorithms/bullyElection';
import { getNextTokenHolder } from './algorithms/tokenRing';

// Helper to get formatted local time string (HH:MM:SS)
const getFormattedTime = () => {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

export default function App() {
  // 1. Initial State Definitions
  const initialNodes = [
    { id: 1, name: 'Node 1', status: 'active', isLeader: false, hasToken: true, dbRequest: false },
    { id: 2, name: 'Node 2', status: 'active', isLeader: false, hasToken: false, dbRequest: false },
    { id: 3, name: 'Node 3', status: 'active', isLeader: false, hasToken: false, dbRequest: false },
    { id: 4, name: 'Node 4', status: 'active', isLeader: false, hasToken: false, dbRequest: false },
    { id: 5, name: 'Node 5', status: 'active', isLeader: true, hasToken: false, dbRequest: false }
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [leaderId, setLeaderId] = useState(5);
  const [tokenPositionId, setTokenPositionId] = useState(1);
  const [dbStatus, setDbStatus] = useState('AVAILABLE'); // 'AVAILABLE' or 'LOCKED BY NODE X'
  const [logs, setLogs] = useState([]);
  
  // Election visualization helper state
  const [isElectionRunning, setIsElectionRunning] = useState(false);
  const [electionVisuals, setElectionVisuals] = useState({
    activeSenders: [],
    activeReceivers: [],
    leaderElect: null
  });

  const nodesContainerRef = useRef(null);

  // 2. Logging helper
  const addLogEntry = (text, type = 'system') => {
    setLogs(prev => [...prev, {
      timestamp: getFormattedTime(),
      text,
      type
    }]);
  };

  // 3. Initialize Simulator Logs
  useEffect(() => {
    addLogEntry('System initialized successfully.', 'system');
    addLogEntry('Leader elected: Node 5.', 'bully');
    addLogEntry('Token circulating at Node 1.', 'token');
  }, []);

  // 4. Trigger Bully Leader Election Step-by-Step
  const triggerElection = (initiatorNodeId) => {
    if (isElectionRunning) return;

    // Filter nodes list for election generator
    const electionSteps = generateElectionSteps(initiatorNodeId, nodes);
    if (electionSteps.length === 0) {
      addLogEntry('No active nodes to initiate election.', 'error');
      return;
    }

    setIsElectionRunning(true);
    let currentStepIndex = 0;

    const playNextStep = () => {
      if (currentStepIndex >= electionSteps.length) {
        // Election concluded
        setIsElectionRunning(false);
        setElectionVisuals({ activeSenders: [], activeReceivers: [], leaderElect: null });
        return;
      }

      const step = electionSteps[currentStepIndex];
      
      // Update nodes state for this step
      setNodes(step.nodes);
      
      // Log event
      addLogEntry(step.logMsg, 'bully');

      // Highlight sending & receiving nodes
      setElectionVisuals({
        activeSenders: step.activeElectionNodes,
        activeReceivers: step.targetNodes,
        leaderElect: step.coordinatorNode
      });

      // Update state for coordinator
      if (step.coordinatorNode) {
        setLeaderId(step.coordinatorNode);
      }

      currentStepIndex++;
      setTimeout(playNextStep, 900); // Step interval
    };

    playNextStep();
  };

  // 5. Fail Leader handler
  const handleFailLeader = () => {
    if (isElectionRunning || !leaderId) return;

    const leaderNode = nodes.find(n => n.id === leaderId);
    if (!leaderNode || leaderNode.status === 'failed') return;

    // Fail the leader in state
    const updatedNodes = nodes.map(n => {
      if (n.id === leaderId) {
        // Set failed, clear leader and token status
        return { ...n, status: 'failed', isLeader: false, hasToken: false, dbRequest: false };
      }
      return n;
    });

    setNodes(updatedNodes);
    addLogEntry(`Leader Node ${leaderId} failed.`, 'error');

    // If the failed leader held the token, pass the token to the next active node
    let nextTokenPos = tokenPositionId;
    if (tokenPositionId === leaderId) {
      nextTokenPos = getNextTokenHolder(leaderId, updatedNodes);
      if (nextTokenPos) {
        setTokenPositionId(nextTokenPos);
        // Set new token holder state
        setNodes(prevNodes => prevNodes.map(n => ({
          ...n,
          status: n.id === leaderId ? 'failed' : n.status,
          hasToken: n.id === nextTokenPos ? true : false,
          isLeader: n.id === leaderId ? false : n.isLeader
        })));
        addLogEntry(`Token automatically recovered and passed to Node ${nextTokenPos}.`, 'token');
      } else {
        setTokenPositionId(null);
        addLogEntry('Token lost: No active nodes to receive it.', 'error');
      }
    }

    // Release database if it was locked by the failed leader
    if (dbStatus === `LOCKED BY NODE ${leaderId}`) {
      setDbStatus('AVAILABLE');
      addLogEntry(`Database automatically unlocked from failed Node ${leaderId}.`, 'db');
    }

    // Automatically trigger Bully Election from the lowest active node
    const activeNodes = updatedNodes.filter(n => n.status === 'active');
    if (activeNodes.length > 0) {
      // Find lowest ID active node to detect failure and initiate election
      const initiator = activeNodes.sort((a, b) => a.id - b.id)[0];
      
      // Delay election slightly so failure log displays first
      setTimeout(() => {
        triggerElection(initiator.id);
      }, 800);
    } else {
      setLeaderId(null);
      addLogEntry('No active nodes left to hold election.', 'error');
    }
  };

  // 6. Start Election manually
  const handleStartElection = () => {
    if (isElectionRunning) return;

    const activeNodes = nodes.filter(n => n.status === 'active');
    if (activeNodes.length === 0) {
      addLogEntry('All nodes have failed. Cannot start election.', 'error');
      return;
    }

    // Start election from the lowest active node (standard demonstration)
    const initiator = activeNodes.sort((a, b) => a.id - b.id)[0];
    addLogEntry(`Manual election request triggered.`, 'system');
    triggerElection(initiator.id);
  };

  // 7. Pass Token
  const handlePassToken = () => {
    if (isElectionRunning) return;

    // Check if database is locked
    if (dbStatus !== 'AVAILABLE') {
      addLogEntry(`Token is locked at Node ${tokenPositionId} due to active Database lock.`, 'error');
      return;
    }

    const nextId = getNextTokenHolder(tokenPositionId, nodes);
    if (!nextId) {
      addLogEntry('Cannot pass token: No active nodes in the ring.', 'error');
      return;
    }

    // Update nodes state
    const previousId = tokenPositionId;
    const updatedNodes = nodes.map(n => ({
      ...n,
      hasToken: n.id === nextId
    }));

    setNodes(updatedNodes);
    setTokenPositionId(nextId);

    // Calculate skipped nodes for logging
    const sorted = [...nodes].sort((a, b) => a.id - b.id);
    const startIdx = sorted.findIndex(n => n.id === previousId);
    const endIdx = sorted.findIndex(n => n.id === nextId);
    
    let skippedMsg = '';
    let curr = (startIdx + 1) % sorted.length;
    const skipped = [];
    while (sorted[curr].id !== nextId) {
      if (sorted[curr].status === 'failed') {
        skipped.push(`Node ${sorted[curr].id}`);
      }
      curr = (curr + 1) % sorted.length;
    }

    if (skipped.length > 0) {
      skippedMsg = ` (Skipped failed ${skipped.join(', ')})`;
    }

    addLogEntry(`Token passed from Node ${previousId} to Node ${nextId}${skippedMsg}.`, 'token');

    // Mutual Exclusion Logic: If the next node has a pending dbRequest, it locks the database
    const nextNode = updatedNodes.find(n => n.id === nextId);
    if (nextNode && nextNode.dbRequest) {
      // Auto-lock resource
      setDbStatus(`LOCKED BY NODE ${nextId}`);
      // Clear dbRequest
      setNodes(prev => prev.map(n => n.id === nextId ? { ...n, dbRequest: false } : n));
      addLogEntry(`Node ${nextId} holds the token and locked the Shared Database.`, 'db');
    }
  };

  // 8. Release Shared Resource
  const handleReleaseResource = () => {
    if (dbStatus === 'AVAILABLE') return;
    
    const lockingNodeId = dbStatus.replace('LOCKED BY NODE ', '');
    setDbStatus('AVAILABLE');
    addLogEntry(`Node ${lockingNodeId} released the Shared Database. Status is AVAILABLE.`, 'db');
  };

  // 9. Reset Simulation
  const handleReset = () => {
    setIsElectionRunning(false);
    setElectionVisuals({ activeSenders: [], activeReceivers: [], leaderElect: null });
    setNodes(initialNodes);
    setLeaderId(5);
    setTokenPositionId(1);
    setDbStatus('AVAILABLE');
    setLogs([]);

    // Set timeout to log after clear
    setTimeout(() => {
      addLogEntry('System reset. Simulation restored to initial state.', 'system');
      addLogEntry('Leader elected: Node 5.', 'bully');
      addLogEntry('Token circulating at Node 1.', 'token');
    }, 100);
  };

  // 10. Node actions
  const handleToggleNodeStatus = (id) => {
    const targetNode = nodes.find(n => n.id === id);
    if (!targetNode) return;

    const isFailing = targetNode.status === 'active';
    let updatedNodes = nodes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          status: isFailing ? 'failed' : 'active',
          isLeader: isFailing ? false : n.isLeader,
          hasToken: isFailing ? false : n.hasToken,
          dbRequest: isFailing ? false : n.dbRequest
        };
      }
      return n;
    });

    setNodes(updatedNodes);
    addLogEntry(`Node ${id} ${isFailing ? 'failed' : 'revived'}.`, isFailing ? 'error' : 'system');

    // Case 1: Node was leader and is now failed
    if (isFailing && id === leaderId) {
      setLeaderId(null);
      // Automatically trigger Bully Election from lowest active node
      const activeNodes = updatedNodes.filter(n => n.status === 'active');
      if (activeNodes.length > 0) {
        const initiator = activeNodes.sort((a, b) => a.id - b.id)[0];
        setTimeout(() => triggerElection(initiator.id), 800);
      } else {
        addLogEntry('No active nodes left to hold election.', 'error');
      }
    }

    // Case 2: Node had token and is now failed
    if (isFailing && id === tokenPositionId) {
      const nextTokenPos = getNextTokenHolder(id, updatedNodes);
      if (nextTokenPos) {
        setTokenPositionId(nextTokenPos);
        setNodes(prevNodes => prevNodes.map(n => ({
          ...n,
          status: n.id === id ? 'failed' : n.status,
          hasToken: n.id === nextTokenPos ? true : false
        })));
        addLogEntry(`Token automatically recovered and passed to Node ${nextTokenPos}.`, 'token');
      } else {
        setTokenPositionId(null);
        addLogEntry('Token lost: No active nodes to receive it.', 'error');
      }
    }

    // Case 3: Node locked database and is now failed
    if (isFailing && dbStatus === `LOCKED BY NODE ${id}`) {
      setDbStatus('AVAILABLE');
      addLogEntry(`Database automatically unlocked due to crash of Node ${id}.`, 'db');
    }

    // Case 4: Node is revived. If it is the highest ID and there's currently no leader, we can start election!
    // Or we can let the ring continue. If there is no leader, revived node can initiate an election.
    if (!isFailing) {
      // If there is no active leader, start election
      const activeLeader = updatedNodes.find(n => n.id === leaderId && n.status === 'active');
      if (!activeLeader) {
        addLogEntry(`Revived Node ${id} notices no active leader. Starting election...`, 'bully');
        setTimeout(() => triggerElection(id), 800);
      }

      // If token ring was empty (tokenPositionId was null), hand token to revived node
      if (tokenPositionId === null) {
        setTokenPositionId(id);
        setNodes(prev => prev.map(n => n.id === id ? { ...n, hasToken: true } : n));
        addLogEntry(`Token restored at revived Node ${id}.`, 'token');
      }
    }
  };

  // Toggle Database Request for a node
  const handleRequestDb = (id) => {
    const node = nodes.find(n => n.id === id);
    if (!node || node.status !== 'active') return;

    // If node already has token, it immediately locks the DB if available
    if (node.hasToken) {
      if (dbStatus === 'AVAILABLE') {
        setDbStatus(`LOCKED BY NODE ${id}`);
        addLogEntry(`Node ${id} holds the token and locked the Shared Database.`, 'db');
      } else {
        addLogEntry(`Database is already locked. Node ${id} must wait.`, 'error');
      }
      return;
    }

    const isCurrentlyRequested = node.dbRequest;
    setNodes(prev => prev.map(n => n.id === id ? { ...n, dbRequest: !isCurrentlyRequested } : n));
    
    if (!isCurrentlyRequested) {
      addLogEntry(`Node ${id} requested Database Access. Waiting for token...`, 'db');
    } else {
      addLogEntry(`Node ${id} cancelled Database Access request.`, 'db');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex flex-col">
      {/* 1. Header Navbar */}
      <Navbar />

      {/* Main dashboard content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* 2. Top Controls */}
        <ControlPanel
          onFailLeader={handleFailLeader}
          onStartElection={handleStartElection}
          onPassToken={handlePassToken}
          onReleaseResource={handleReleaseResource}
          onReset={handleReset}
          isElectionRunning={isElectionRunning}
          isDbLocked={dbStatus !== 'AVAILABLE'}
          leaderId={leaderId}
          nodes={nodes}
        />

        {/* 3. Left / Right Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left panel: Nodes grid (width 2/3 on lg) */}
          <div
            ref={nodesContainerRef}
            className="lg:col-span-2 bg-[#0e1626]/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl relative min-h-[480px] flex flex-col"
          >
            <h2 className="text-xl font-bold tracking-tight text-white mb-6 select-none">
              Distributed Nodes
            </h2>
            
            {/* Dynamic SVG lines and Token Animation overlay */}
            <TokenAnimation
              nodes={nodes}
              tokenPositionId={tokenPositionId}
              containerRef={nodesContainerRef}
            />

            {/* Nodes Card layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20 flex-1">
              {nodes.map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  onToggleStatus={handleToggleNodeStatus}
                  onRequestDb={handleRequestDb}
                  isElecting={electionVisuals.activeSenders.includes(node.id)}
                  isTarget={electionVisuals.activeReceivers.includes(node.id)}
                  isLeaderElect={electionVisuals.leaderElect === node.id}
                />
              ))}
            </div>
          </div>

          {/* Right panel: System Status (width 1/3 on lg) */}
          <div className="lg:col-span-1">
            <SystemStatus
              leaderId={leaderId}
              tokenPositionId={tokenPositionId}
              dbStatus={dbStatus}
              nodes={nodes}
            />
          </div>
        </div>

        {/* 4. Bottom panel: Monospace logs terminal */}
        <div className="w-full">
          <EventLogs
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        </div>
      </main>
    </div>
  );
}
