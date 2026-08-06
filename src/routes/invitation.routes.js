import express from "express";

import logInAuth from "../middlewares/logInAuth.middlewares.js";

import { authorize } from "../middlewares/authorize_roles.middlewares.js";
import {
  accessInvitationUrl,
  createInvitationUrl,
  getAllInvitationUrls,
  rejectInvitationUrl,
} from "../controllers/invitation_url.controllers.js";

const invitationRouter = express.Router();

invitationRouter.post("/invite/:id", logInAuth, createInvitationUrl);
invitationRouter.patch("/access-url/:token", logInAuth, accessInvitationUrl);
invitationRouter.patch("/reject-url/:token", logInAuth, rejectInvitationUrl);
invitationRouter.get(
  "/all-invitation-urls/:id",
  logInAuth,
  getAllInvitationUrls,
);

export default invitationRouter;
