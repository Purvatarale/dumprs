const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8081 });

const clients = new Map(); // Map to store clients by chatId

wss.on("connection", (ws) => {
  console.log("A client connected");

  ws.on("message", (data) => {
    try {
      console.log("Received message (Buffer):", data);

      const messageString = data.toString("utf8");
      console.log("Message as String:", messageString);

      const message = JSON.parse(messageString);
      console.log("Parsed Message:", message);

      const { chatId, sender, message: text, timestamp } = message;

      if (!chatId) {
        console.error("chatId is missing in the payload");
        return;
      }

      if (!clients.has(chatId)) {
        clients.set(chatId, new Set());
      }

      // Broadcast the message to all clients subscribed to this chatId
      clients.get(chatId).forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              sender,
              message: text,
              timestamp,
            })
          );
        }
      });
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", () => {
    console.log("A client disconnected");

    clients.forEach((sockets, chatId) => {
      sockets.delete(ws);
      if (sockets.size === 0) {
        clients.delete(chatId);
      }
    });
  });
});

wss.on("connection", (ws, req) => {
  const urlParams = new URLSearchParams(req.url.replace("/?", ""));
  const chatId = urlParams.get("chatId");

  if (!chatId) {
    console.error("No chatId provided in the connection URL");
    ws.close(4000, "Chat ID is required");
    return;
  }

  // Register the client under the given chatId
  if (!clients.has(chatId)) {
    clients.set(chatId, new Set());
  }
  clients.get(chatId).add(ws);

  console.log(`Client registered to chatId: ${chatId}`);
});

console.log("WebSocket server is running on ws://localhost:8081");
