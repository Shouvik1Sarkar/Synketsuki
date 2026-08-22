import { Server } from "socket.io";

import { socketAuth } from "./socket_auth.js";
import { join_document } from "./document.socket.js";
import { subscriberUserEvent } from "../../config/redis.config.js";

export const initializeSocket = async (httpServer) => {
  // Initialize Socket.IO with the HTTP server
  const io = new Server(httpServer);

  // Authenticate every socket connection
  io.use(socketAuth);

  /*
   * join-document -> the user event type (for pub sub)
   * join_document -> the user event (Socket)
   */
  // await subscriberUserEvent((message) => {
  //   const event = JSON.parse(message);

  //   if (event.type === "join-document") {
  //     io.to(event.data.docId).emit("join_document", event.data.message);
  //   }
  // });
  // await subscriberUserEvent((message) => {
  //   const event = JSON.parse(message);

  //   if (event.type === "leave-document") {
  //     io.to(event.data.docId).emit("leave_document", event.data.message);
  //   }
  // });
  // await subscriberUserEvent((message) => {
  //   const event = JSON.parse(message);

  //   if (event.type === "edit-document") {
  //     io.to(event.data.docId).emit("edit_document", event.data.message);
  //   }
  // });
  // await subscriberUserEvent((message) => {
  //   const event = JSON.parse(message);

  //   if (event.type === "save-document") {
  //     io.to(event.data.docId).emit("save_document", event.data.message);
  //   }
  // });

  // Handle new socket connections

  await subscriberUserEvent((message) => {
    const event = JSON.parse(message);

    switch (event.type) {
      case "join-document":
        io.to(event.data.docId).emit("join_document", event.data.message);
        break;

      case "leave-document":
        io.to(event.data.docId).emit("leave_document", event.data.message);
        break;

      case "edit-document":
        io.to(event.data.docId).emit("edit_document", event.data.message);
        break;

      case "save-document":
        io.to(event.data.docId).emit("save_document", event.data.message);
        break;
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Register document-related socket events
    join_document(io, socket);
    leave_document(io, socket);
    start_writing(io, socket);
    save_document(io, socket);
    get_online_users(io, socket);

    // Handle socket disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
