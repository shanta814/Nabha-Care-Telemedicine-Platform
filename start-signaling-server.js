// lib/start-signaling-server.js
import http from 'http';
import { setupSignalingServer } from './signaling-server.js';

const PORT = process.env.SIGNALING_PORT ? Number(process.env.SIGNALING_PORT) : 5000;

const server = http.createServer((req, res) => {
  // This HTTP server can answer a health-check.
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = setupSignalingServer(server);

// If your exported function returns a WebSocketServer object, we keep the HTTP server listening.
server.listen(PORT, () => {
  console.log(`Signaling server listening on http://localhost:${PORT}`);
});
