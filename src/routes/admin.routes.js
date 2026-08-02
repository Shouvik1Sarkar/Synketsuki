import express from "express";

import logInAuth from "../middlewares/logInAuth.middlewares.js";
import validate from "../middlewares/validationError.middlewares.js";
import { registerValidator } from "../utils/auth_validate.utils.js";

import { authorize } from "../middlewares/authorize_roles.middlewares.js";
import { available_user_roles } from "../utils/constants.utils.js";
import { Suspend_unsuspend_users } from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

adminRouter.get(
  "/suspension/:id",
  logInAuth,
  authorize("user", "product_owner", "product_admin"),
  Suspend_unsuspend_users,
);

export default adminRouter;
