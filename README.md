# Distributed System Simulator

A modern, dark-themed **Distributed System Simulator** dashboard visualizing distributed coordination and consensus concepts.

This project simulates:
1. **Bully Leader Election Algorithm**: Dynamically elects the highest active node ID as the leader/coordinator whenever a leader failure is detected.
2. **Ring Token Mutual Exclusion**: Circulates a single token around active nodes in a logical ring. Only the node holding the token is permitted to lock a shared database resource.
3. **Fault Tolerance and Recovery**: Automatically recovers states, detects leader crashes, triggers elections, and dynamically skips failed nodes in the token ring.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express (lightweight static file server)
- **Consensus Logic**: Vanilla JavaScript Simulation Engine

---

## 📂 Project Structure

```
DS-Project/
├── client/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── bullyElection.js  # Bully Election State Machine
│   │   │   └── tokenRing.js      # Ring Token Helpers
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top Header & System Pulse
│   │   │   ├── ControlPanel.jsx  # Simulator Action Buttons
│   │   │   ├── NodeCard.jsx      # Individual Distributed Node Card
│   │   │   ├── SystemStatus.jsx  # Leader, Token, and DB Status Panels
│   │   │   ├── EventLogs.jsx     # Terminal Log display
│   │   │   └── TokenAnimation.jsx# Dynamic SVG connection & token animation
│   │   ├── App.jsx               # Global state manager & orchestrator
│   │   ├── index.css             # Styles & CSS Animations
│   │   └── main.jsx              # React mounting root
│   ├── index.html                # App entrypoint & font setup
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── postcss.config.js         # PostCSS compiler config
│   └── package.json              # Client dependencies
├── server/
│   ├── server.js                 # Express server to host built client
│   └── package.json              # Backend dependencies
└── README.md                     # Documentation
```

---

## ⚙️ How to Run

Follow these commands to start the frontend and backend servers.

### 1. Frontend Development Server

Open a terminal in the project directory, and run:

```bash
cd client
npm install
npm run dev
```

The application will spin up locally, usually at `http://localhost:5173`. Open this URL in your web browser.

### 2. Backend Server

To build the client and serve it through the Node.js/Express backend:

First, build the frontend:
```bash
cd client
npm run build
```

Then, start the server:
```bash
cd ../server
npm install
node server.js
```

The backend server will run at `http://localhost:5000` and automatically serve the compiled frontend.

---

## 💡 How the Algorithms Work in this Simulator

### 1. Bully Leader Election
- When the leader node is crashed (clicking **Fail Leader** or failing Node 5 manually):
  1. The remaining active node with the lowest ID (e.g. Node 1 or Node 3) detects that the leader is unresponsive.
  2. It initiates an election by sending `ELECTION` messages to all nodes with higher IDs.
  3. Active higher-ID nodes respond with `ANSWER (OK)` messages, halting the lower node's coordinator bid.
  4. The responding active nodes now initiate their own election, contacting nodes higher than them.
  5. Failed higher-ID nodes do not respond.
  6. The highest active node receives no answers, declares itself the leader, and broadcasts `COORDINATOR` to all active nodes.
- In the UI, this process runs as a step-by-step state machine with animated nodes blinking/flashing as messages are sent.

### 2. Ring Token Mutual Exclusion
- A single `Token` is passed clockwise around the active nodes: $1 \rightarrow 2 \rightarrow 3 \rightarrow 4 \rightarrow 5 \rightarrow 1$.
- Click **Pass Token** to shift the token to the next node.
- If a node is failed (e.g., Node 3), the token automatically skips it (e.g., passing directly from Node 2 to Node 4).
- To request database access, click **Request DB** on any active node. The request goes into a `Pending` state.
- When the token arrives at that node, it automatically locks the database (changing database status to `LOCKED BY NODE X`).
- While the database is locked, the token is held at Node X. You **cannot** pass the token further until you click **Release Resource** or fail the locking node. This demonstrates mutual exclusion!
