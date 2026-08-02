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

const authRouter = express.Router();

// authRouter.get("/", (req, res) => {
//   res.send("Hello This is auth");
// });

authRouter.post("/register", registerValidator(), validate, register);
authRouter.post("/email-verify", emailVerified);
authRouter.post("/send-email-verification-otp", sendEmailVerificationOtp);
authRouter.post("/log-in", logIn);

authRouter.get("/log-out", logInAuth, logOut);
authRouter.post("/change-password", logInAuth, changePassword);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
