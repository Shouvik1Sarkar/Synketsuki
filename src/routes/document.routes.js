import express from "express";

import logInAuth from "../middlewares/logInAuth.middlewares.js";
import {
  cleanTrashCan,
  createDocument,
  deleteDocument,
  duplicateDocument,
  getDocumentById,
  getUserDocuments,
  permanentlyDeleteDocument,
  restoreDocument,
  toggleArchiveDocument,
  trashCan,
  updateDocument,
  version_update,
} from "../controllers/document.controllers.js";
import { authorize } from "../middlewares/authorize_roles.middlewares.js";

const documentRouter = express.Router();

documentRouter.post("/create-docs", logInAuth, createDocument);
documentRouter.get("/all-docs", logInAuth, getUserDocuments);
documentRouter.post("/get-docs/:id", logInAuth, getDocumentById);
documentRouter.patch(
  "/update/:id",
  logInAuth,

  updateDocument,
);
documentRouter.delete("/delete/:id", logInAuth, deleteDocument);
documentRouter.delete(
  "/delete/permanent/:id",
  logInAuth,
  permanentlyDeleteDocument,
);
documentRouter.get("/trashCan", logInAuth, trashCan);
documentRouter.delete("/clean-trashCan", logInAuth, cleanTrashCan);
documentRouter.patch("/restore/:id", logInAuth, restoreDocument);
documentRouter.patch("/toggle-archive/:id", logInAuth, toggleArchiveDocument);
documentRouter.post("/duplicate/:id", logInAuth, duplicateDocument);
documentRouter.post("/documents/:id/snapshot", logInAuth, version_update);

export default documentRouter;
