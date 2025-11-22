const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Lovecraft socket server\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data && data.type === 'hello') {
        // attach client id if provided
        ws.clientId = data.clientId || ws.clientId;
        console.log('Client hello from', ws.clientId);
      }
      if (data && data.type === 'request_play') {
        // Attach clientId if not set
        ws.clientId = ws.clientId || data.clientId;
        // Broadcast a coordinated play message with a startAt timestamp slightly in future
        const startAt = Date.now() + 1200; // 1.2s from now to allow clients to sync
        const payload = JSON.stringify({ type: 'play', startAt, origin: data.clientId });
        console.log('Broadcasting play startAt=', startAt, 'origin=', data.clientId);
        // Send to ALL connected clients, including the origin, so every client gets the same startAt
        wss.clients.forEach((client) => {
          try {
            if (client.readyState !== WebSocket.OPEN) return;
            client.send(payload);
          } catch (e) { console.warn('Failed to send to a client', e); }
        });
      }
    } catch (e) {
      console.warn('Invalid message from client', e);
    }
  });
});

// Simple ping/pong to detect dead connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`Lovecraft socket server listening on ${PORT}`);
});

process.on('SIGTERM', () => { clearInterval(interval); server.close(); });
