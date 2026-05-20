/**
 * Bully Leader Election Algorithm
 * 
 * Explanation:
 * 1. A node detects leader failure and initiates election.
 * 2. It sends ELECTION messages to all nodes with higher IDs.
 * 3. If no higher nodes are active, it becomes the leader and broadcasts COORDINATOR.
 * 4. If higher nodes are active, they respond with ANSWER (OK) and take over the election.
 */

export function generateElectionSteps(initiatorId, currentNodes) {
  const steps = [];
  const nodesState = JSON.parse(JSON.stringify(currentNodes)); // Deep clone

  const addStep = (nodes, logMsg, activeElectionNodes = [], targetNodes = [], coordinatorNode = null) => {
    steps.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      logMsg,
      activeElectionNodes, // Nodes currently holding election power / sending
      targetNodes,         // Nodes receiving messages
      coordinatorNode      // New leader (if elected)
    });
  };

  // Find initiator node
  const initiator = nodesState.find(n => n.id === initiatorId);
  if (!initiator || initiator.status === 'failed') {
    return steps;
  }

  // Phase 1: Initiator detects failure and starts the election
  addStep(
    nodesState,
    `Node ${initiatorId} detected leader failure. Starting Bully Election...`,
    [initiatorId]
  );

  let currentInitiatorId = initiatorId;
  let electionComplete = false;
  let safetyCounter = 0;

  while (!electionComplete && safetyCounter < 10) {
    safetyCounter++;
    const higherNodes = nodesState.filter(n => n.id > currentInitiatorId);

    if (higherNodes.length === 0) {
      // No higher nodes, current initiator becomes the leader
      nodesState.forEach(n => {
        n.isLeader = (n.id === currentInitiatorId);
      });
      addStep(
        nodesState,
        `Node ${currentInitiatorId} received no response from higher nodes. Declaring self as leader.`,
        [currentInitiatorId],
        [],
        currentInitiatorId
      );
      addStep(
        nodesState,
        `Node ${currentInitiatorId} broadcasted COORDINATOR to all active nodes.`,
        [],
        nodesState.filter(n => n.status === 'active' && n.id !== currentInitiatorId).map(n => n.id),
        currentInitiatorId
      );
      electionComplete = true;
      break;
    }

    const higherIds = higherNodes.map(n => n.id);
    addStep(
      nodesState,
      `Node ${currentInitiatorId} sending ELECTION message to higher nodes: Node(s) ${higherIds.join(', ')}.`,
      [currentInitiatorId],
      higherIds
    );

    const activeHigherNodes = higherNodes.filter(n => n.status === 'active');

    if (activeHigherNodes.length === 0) {
      // All higher nodes are failed, current initiator becomes leader
      nodesState.forEach(n => {
        n.isLeader = (n.id === currentInitiatorId);
      });
      addStep(
        nodesState,
        `All higher nodes (${higherIds.join(', ')}) failed to respond. Node ${currentInitiatorId} is elected leader.`,
        [currentInitiatorId],
        [],
        currentInitiatorId
      );
      addStep(
        nodesState,
        `Node ${currentInitiatorId} broadcasted COORDINATOR to all active nodes.`,
        [],
        nodesState.filter(n => n.status === 'active' && n.id !== currentInitiatorId).map(n => n.id),
        currentInitiatorId
      );
      electionComplete = true;
    } else {
      // Active higher nodes respond with OK
      activeHigherNodes.forEach(node => {
        addStep(
          nodesState,
          `Node ${node.id} responded with ANSWER (OK) to Node ${currentInitiatorId}.`,
          [node.id],
          [currentInitiatorId]
        );
      });

      // The next initiator is the lowest active higher node to continue the election
      const nextInitiator = activeHigherNodes[0];
      addStep(
        nodesState,
        `Node ${nextInitiator.id} takes over the election process.`,
        [nextInitiator.id]
      );
      currentInitiatorId = nextInitiator.id;
    }
  }

  return steps;
}
