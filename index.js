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
      if (data && data.type === 'request_play') {
        // Broadcast a coordinated play message with a startAt timestamp slightly in future
        const startAt = Date.now() + 1000; // 1 second from now to allow clients to sync
        const payload = JSON.stringify({ type: 'play', startAt, origin: data.clientId });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(payload);
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
