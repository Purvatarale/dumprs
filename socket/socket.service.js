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

    console.log(`Socket.IO initialized on path: /chatapp/socket.io. Port ${process.env.PORT}. Listening for connections...`);

    this.io.on("connection", (socket) => {
      console.log("A client connected:", socket.id);

      const {chatId} = socket.handshake.auth; // Extract chatId from frontend
      if (!chatId) {
        console.error("No chatId provided!");
        socket.disconnect();
        return;
      }

      socket.join(chatId); // Join the chat room
      console.log(`Client joined chatId: ${chatId}`);

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
    console.log("Current rooms:", this.io.sockets.adapter.rooms);
  
    // Use emit() with the event name "message"
    this.io.send(messagePayload);
  }  
}

module.exports = new WebSocketService();
