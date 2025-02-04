const WebSocket = require("ws");

class WebSocketService {
  constructor() {
    this.clients = new Map(); // Map to store connected clients by chatId
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ noServer: true }); // WebSocket server without its own port

    this.wss.on("connection", (ws, req) => {
      console.log("WebSocket client connected");

      // Extract chatId from query params
      const urlParams = new URLSearchParams(req.url.replace("/chatapp/ws?", ""));
      const chatId = urlParams.get("chatId");

      if (!chatId) {
        console.error("No chatId provided in WebSocket URL");
        ws.close(4000, "Chat ID is required");
        return;
      }

      if (!this.clients.has(chatId)) {
        this.clients.set(chatId, new Set());
      }
      this.clients.get(chatId).add(ws);

      console.log(`Client registered to chatId: ${chatId}`);

      ws.on("close", () => {
        console.log("Client disconnected");
        this.clients.get(chatId)?.delete(ws);
        if (this.clients.get(chatId)?.size === 0) {
          this.clients.delete(chatId);
        }
      });
    });

    // Attach WebSocket server to existing HTTP server
    server.on("upgrade", (req, socket, head) => {
      if (req.url.startsWith("/chatapp/ws")) {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss.emit("connection", ws, req);
        });
      } else {
        socket.destroy();
      }
    });
  }

  // Function to send messages to all clients connected to a specific chatId
  sendMessage(chatId, messagePayload) {
    if (!this.clients.has(chatId)) return;

    const message = JSON.stringify(messagePayload);
    this.clients.get(chatId).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log(`Message sent to chatId ${chatId}:`, messagePayload);
  }

  updateStatus(chatId, status) {
    if (!this.clients.has(chatId)) return;

    const statusPayload = {
      type: "status",
      status,
    };

    const message = JSON.stringify(statusPayload);
    this.clients.get(chatId).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log(`Status updated for chatId ${chatId}:`, status);
  }
}

module.exports = new WebSocketService();
