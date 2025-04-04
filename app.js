const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

const players = {}; // ID -> { x, y, color }

function broadcastGameState() {
  const payload = JSON.stringify(players);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
      console.log(payload);
    }
  });
}

wss.on('connection', (ws) => {
  const id = uuidv4();
  const color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Colore random
  players[id] = { x: Math.random() * 800, y: Math.random() * 600, color };

  ws.send(JSON.stringify({ id })); // Manda ID univoco al client
  broadcastGameState();

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      players[id].x = data.x;
      players[id].y = data.y;
      broadcastGameState();
    }
  });

  ws.on('close', () => {
    delete players[id];
    broadcastGameState();
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
