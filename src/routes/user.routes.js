import express from "express";

import logInAuth from "../middlewares/logInAuth.middlewares.js";
import validate from "../middlewares/validationError.middlewares.js";
import { registerValidator } from "../utils/auth_validate.utils.js";
import {
  deleteMyProfile,
  getAllUsers,
  getMe,
  getUserById,
  updateYourProfile,
} from "../controllers/user.controllers.js";
import { authorize } from "../middlewares/authorize_roles.middlewares.js";

const userRouter = express.Router();

userRouter.get("/get-me", logInAuth, getMe);
userRouter.get(
  "/get-user/:id",
  logInAuth,
  authorize("user", "product_owner", "product_admin"),
  getUserById,
);
userRouter.get(
  "/get-all-users",
  logInAuth,
  authorize("user", "product_owner", "product_admin"),
  getAllUsers,
);
userRouter.patch("/update", logInAuth, updateYourProfile);
userRouter.delete("/delete", logInAuth, deleteMyProfile);

export default userRouter;
