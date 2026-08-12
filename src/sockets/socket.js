import { Server } from "socket.io";

import { socketAuth } from "./socket_auth.js";
import { join_document } from "./document.socket.js";

export const initializeSocket = (httpServer) => {
  // Initialize Socket.IO with the HTTP server
  const io = new Server(httpServer);

  // Authenticate every socket connection
  io.use(socketAuth);

  // Handle new socket connections
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Register document-related socket events
    join_document(io, socket);

    // Handle socket disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
