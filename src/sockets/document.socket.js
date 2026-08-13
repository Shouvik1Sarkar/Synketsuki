import DocumentMember from "../models/docsMember.models.js";
import Document from "../models/document.models.js";

/*
|────────────────|
|                |
|     ROOM       |
|                |
|────────────────|
*/

// join_document;

export const join_document = (io, socket) => {
  socket.on("join_document", async (documentId, documentName) => {
    const userId = socket.user._id;
    const userName = socket.user.userName;

    const membership = await DocumentMember.findOne({
      document: documentId,
      user: userId,
    });

    if (!membership) {
      return;
    }

    socket.join(`document:${documentId}`);

    io.to(`document:${documentId}`).emit(
      "join_document",
      `User ${userName} has joined the document: ${documentName}.`,
    );
  });
};

// leave_document;

export const leave_document = (io, socket) => {
  socket.on("leave_document", (documentId, documentName) => {
    const userName = socket.user.userName;

    socket.leave(`document:${documentId}`);

    io.to(`document:${documentId}`).emit(
      "leave_document",
      `User ${userName} has left the document: ${documentName}.`,
    );
  });
};

/*
|────────────────|
|                |
|     EDITING    |
|                |
|────────────────|
*/

// document_edit

export const start_writing = (io, socket) => {
  socket.on("edit_document", async (documentId, documentName) => {
    const userId = socket.user._id;
    const userName = socket.user.userName;

    /************ Might if FE can ensure that socket will be triggered once the controller is done.************/
    /** Although good for the security purposes **/
    const membership = await DocumentMember.findOne({
      document: documentId,
      user: userId,
    });

    if (!membership) {
      return;
    }
    if (!["admin", "editor", "owner"].includes(membership.role)) {
      return;
    }
    /******************************************************************************************************************/

    io.to(`document:${documentId}`).emit(
      "edit_document",
      `User ${userName} is editing document: ${documentName}.`,
    );
  });
};

// document_updated

export const save_document = (io, socket) => {
  socket.on("save_document", async (documentId, documentName) => {
    const userId = socket.user._id;
    const userName = socket.user.userName;

    /************ Might if FE can ensure that socket will be triggered once the controller is done.************/
    /** Although good for the security purposes **/
    const membership = await DocumentMember.findOne({
      document: documentId,
      user: userId,
    });

    if (!membership) {
      return;
    }
    if (!["admin", "editor", "owner"].includes(membership.role)) {
      return;
    }
    /******************************************************************************************************************/

    io.to(`document:${documentId}`).emit(
      "save_document",
      `Document: ${documentName} is updated.`,
    );
  });
};

/*
|────────────────|
|                |
|    PRESENCE    |
|                |
|────────────────|
*/

// online_users;

export const get_online_users = (io, socket) => {
  socket.on("online_users", async (documentId) => {
    const room = `document:${documentId}`;
    const sockets = await io.in(roon).fetchSockets();
    const onlineUsers = sockets.map((socket) => ({
      socketId: socket.id,
      userId: socket.user._id,
      userName: socket.user.userName,
    }));

    socket.emit("online_users", onlineUsers);
  });
};
