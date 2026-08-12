import DocumentMember from "../models/docsMember.models.js";
import Document from "../models/document.models.js";

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

export const start_writing = (op, socket) => {
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
