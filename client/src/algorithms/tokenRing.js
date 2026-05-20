/**
 * Token Ring Algorithm Helper
 * 
 * Explanation:
 * 1. Nodes form a logical ring based on their IDs: 1 -> 2 -> 3 -> 4 -> 5 -> 1.
 * 2. When passing the token, we traverse clockwise to find the next active node.
 * 3. Any node with status 'failed' is automatically bypassed.
 */

export function getNextTokenHolder(currentTokenHolderId, nodes) {
  const sortedNodes = [...nodes].sort((a, b) => a.id - b.id);
  const currentIndex = sortedNodes.findIndex(n => n.id === currentTokenHolderId);

  if (currentIndex === -1) {
    // If current holder is missing, find the first active node
    const firstActive = sortedNodes.find(n => n.status === 'active');
    return firstActive ? firstActive.id : null;
  }

  let nextIndex = (currentIndex + 1) % sortedNodes.length;
  let attempts = 0;

  while (attempts < sortedNodes.length) {
    const nextNode = sortedNodes[nextIndex];
    if (nextNode.status === 'active') {
      return nextNode.id;
    }
    nextIndex = (nextIndex + 1) % sortedNodes.length;
    attempts++;
  }

  return null; // No active nodes to hold the token
}
