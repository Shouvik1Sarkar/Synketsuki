// create_share_link;
import express from "express";

import logInAuth from "../middlewares/logInAuth.middlewares.js";
import {
  access_share_url,
  all_shared_url,
  create_share_url,
  delete_share_url,
  revoke_share_url,
} from "../controllers/share_url.controllers.js";

const shareUrlRouter = express.Router();

shareUrlRouter.post("/create-share-url/:id", logInAuth, create_share_url);
shareUrlRouter.get("/share-url/:token", logInAuth, access_share_url);
shareUrlRouter.patch("/share-url/:id", logInAuth, revoke_share_url);
shareUrlRouter.delete("/share-url/:share_url_id", logInAuth, delete_share_url);
shareUrlRouter.get(
  "/share-urls/document/:documentId",
  logInAuth,
  all_shared_url,
);

export default shareUrlRouter;
