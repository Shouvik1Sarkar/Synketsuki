import express from "express";
import {
  changePassword,
  emailVerified,
  forgotPassword,
  logIn,
  logOut,
  register,
  resetPassword,
  sendEmailVerificationOtp,
} from "../controllers/auth.controllers.js";
import logInAuth from "../middlewares/logInAuth.middlewares.js";
import validate from "../middlewares/validationError.middleware.js";
import { registerValidator } from "../utils/auth_validate.utils.js";

const userRouter = express.Router();

// userRouter.get("/", (req, res) => {
//   res.send("Hello This is auth");
// });

userRouter.post("/register", registerValidator(), validate, register);
userRouter.post("/email-verify", emailVerified);
userRouter.post("/send-email-verification-otp", sendEmailVerificationOtp);
userRouter.post("/log-in", logIn);

userRouter.get("/log-out", logInAuth, logOut);
userRouter.post("/change-password", logInAuth, changePassword);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
