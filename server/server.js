// Server code (Node.js)
const osc = require('node-osc');
const WebSocket = require('ws');

// Set up OSC server to listen for DragonFrame events
const oscServer = new osc.Server(7000, '127.0.0.1'); // Default DragonFrame port

// Set up WebSocket server for communication with web app
const wss = new WebSocket.Server({ port: 9099 });

// Forward OSC messages to connected web clients
oscServer.on('message', (msg) => {
  console.log(`Received OSC message: ${msg}`);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'dragonframe_event',
        data: msg
      }));
    }
  });
});

console.log('Server running. Listening for DragonFrame OSC events...');