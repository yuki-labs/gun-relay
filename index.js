const express = require('express');
const Gun = require('gun');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Load Gun extensions
require('gun/lib/radisk');
require('gun/lib/store');
require('gun/lib/rse');

const app = express();
const port = process.env.PORT || 8765;

// Robust parsing for PEERS (comma-separated list)
// Ensures we don't try to connect to empty strings
const peers = (process.env.PEERS || '')
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);

// Basic health check and info
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'running',
        message: 'Gun relay is active',
        version: Gun.version,
        peers_configured: peers.length,
        timestamp: new Date().toISOString()
    });
});

// Serve Gun client library
app.use(Gun.serve);

const server = app.listen(port, () => {
    console.log(`[Gun] Relay listening on port ${port}`);
});

// Initialize Gun
const gun = Gun({
    web: server,
    peers: peers,
    file: 'data',
    radisk: true,
    localStorage: false, // Server environment, don't use localStorage
    // AXE (Advanced Xenomorph Engine) can sometimes filter messages too aggressively for simple relays.
    // Disabling it can resolve "data not relaying" issues in many setups.
    axe: false,
    // Multicast discovery is often blocked in cloud environments.
    multicast: false
});

console.log(`[Gun] Relay initialized. Configured peers:`, peers.length > 0 ? peers : 'None');

// Connection monitoring
gun.on('hi', peer => {
    console.log('[Gun] Peer connected:', peer.url || 'Client/Inbound');
});

gun.on('bye', peer => {
    console.log('[Gun] Peer disconnected:', peer.url || 'Client/Inbound');
});

// Debug data flow (minimal logging to avoid flooding)
gun.on('in', msg => {
    if (msg.put) {
        console.log(`[Gun] Traffic: PUT received`);
    } else if (msg.get) {
        // console.log(`[Gun] Traffic: GET received`);
    }
});

// Error handling for Gun
gun.on('error', err => {
    console.error('[Gun] ERROR:', err);
});

// Graceful shutdown
const shutdown = () => {
    console.log('[Gun] Shutting down relay...');
    server.close(() => {
        console.log('[Gun] Server closed.');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

