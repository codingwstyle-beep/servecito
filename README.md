# Lovecraft Socket Server

This simple WebSocket server coordinates video playback between multiple running Electron clients.

Deployment notes
- The server listens on `process.env.PORT` (Railway sets `PORT`).
- On receiving a JSON message `{ type: 'request_play', clientId, clientTime }` it broadcasts `{ type: 'play', startAt, origin }` to all clients.

How to run locally

1. cd `server`
2. npm install
3. npm start

Deploying to Railway

1. Create a new Railway project and connect to this repository.
2. Set the start command to `node index.js` (already set in `package.json`).
3. Railway will provide a URL like `wss://...` (use the base URL for WebSocket connection).

Client configuration

In the Electron app, change the WebSocket URL to the deployed server (instead of `ws://localhost:8080`).
