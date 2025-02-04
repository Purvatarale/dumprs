const { Server } = require("socket.io");

class WebSocketService {
  constructor() {
    this.io = null;
  }

  initialize(server) {
    this.io = new Server(server, {
      path: "/chatapp/socket.io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      
    });

    this.io.on("connection", (socket) => {
      console.log("A client connected:", socket.id);

      const chatId = socket.handshake.query.chatId; // Extract chatId from frontend
      if (!chatId) {
        console.error("No chatId provided!");
        socket.disconnect();
        return;
      }

      socket.join(chatId); // Join the chat room
      console.log(`Client joined chatId: ${chatId}`);

      // Listen for incoming messages from clients
      socket.on("sendMessage", (message) => {
        console.log(`Message received for chatId ${chatId}:`, message);

        // Broadcast the message to all clients in the same chatId room
        this.io.to(chatId).emit("receiveMessage", message);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Function to send messages to a specific chatId (used in Chatwoot webhook)
  sendMessage(chatId, messagePayload) {
    if (!this.io) {
      console.error("Socket.IO not initialized");
      return;
    }

    console.log(`Sending message to chatId ${chatId}:`, messagePayload);
    this.io.to(chatId).emit("receiveMessage", messagePayload);
  }
}

module.exports = new WebSocketService();
