const express = require('express');
const Gun = require('gun');
const app = express();
const port = process.env.PORT || 8765;

// Parse PEERS environment variable (comma-separated list of URLs)
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// Health check and root route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'running',
        message: 'Gun relay is active',
        version: Gun.version,
        peers_connected: peers.length,
        built_at: new Date().toISOString()
    });
});

// Serve web content if needed
app.use(Gun.serve);

const server = app.listen(port, () => {
    console.log(`[Gun] Relay listening on port ${port}`);
});

// Initialize Gun with the server and peers
const gun = Gun({
    web: server,
    peers: peers,
    file: 'data', // Persistent data directory
    radisk: true, // Use radisk for storage
    localStorage: false // We are a server, don't use localStorage
});

console.log(`[Gun] Relay peer initialized with ${peers.length} shared peers.`);

// Log connections (basic)
gun.on('hi', peer => console.log('[Gun] Peer connected:', peer.url || 'local client'));
gun.on('bye', peer => console.log('[Gun] Peer disconnected:', peer.url || 'local client'));

// Graceful shutdown
const shutdown = () => {
    console.log('[Gun] Shutting down relay...');
    server.close(() => {
        console.log('[Gun] HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

