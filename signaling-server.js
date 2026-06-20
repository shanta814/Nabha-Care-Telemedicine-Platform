import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.resolve(process.cwd(), 'db.json');
const rooms = {};

function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading DB:", error);
    return { chatHistory: {} };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing DB:", error);
  }
}

export const setupSignalingServer = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const room = url.searchParams.get('room');
    const userType = url.searchParams.get('userType'); // 'patient' or 'doctor'

    if (!room || !userType) {
      ws.close(1008, "Room and userType are required");
      return;
    }

    if (!rooms[room]) {
      rooms[room] = new Set();
    }
    rooms[room].add(ws);
    console.log(`Client (${userType}) joined room: ${room}. Size: ${rooms[room].size}`);

    ws.on('message', (message) => {
  let parsedMessage;

  // SAFELY TRY TO PARSE JSON
  try {
    parsedMessage = JSON.parse(message.toString());
  } catch (err) {
    console.log("Received NON-JSON message, ignoring:", message.toString());
    return; // Prevent server crash
  }

  // Handle WebRTC signaling
  if (['offer', 'answer', 'candidate'].includes(parsedMessage.type)) {
    rooms[room].forEach(client => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
    return;
  }
      // Handle Chat messages
      if (parsedMessage.type === 'chat') {
        const db = readDb();
        if (!db.chatHistory) db.chatHistory = {};
        if (!db.chatHistory[room]) db.chatHistory[room] = [];

        const newMessage = {
          id: uuidv4(),
          sender: userType,
          text: parsedMessage.text,
          timestamp: new Date().toISOString(),
        };
        db.chatHistory[room].push(newMessage);
        writeDb(db);

        // Broadcast the new message to everyone in the room
        const broadcastMessage = JSON.stringify({ type: 'chat', message: newMessage });
        rooms[room].forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(broadcastMessage);
          }
        });
      }
    });

    ws.on('close', () => {
      if (rooms[room]) {
        rooms[room].delete(ws);
        console.log(`Client left room: ${room}. Size: ${rooms[room].size}`);
        if (rooms[room].size === 0) {
          delete rooms[room];
        }
      }
    });
  });

  console.log("WebSocket Signaling Server is ready for WebRTC and Chat.");
  return wss;
};
