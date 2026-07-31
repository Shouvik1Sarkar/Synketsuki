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

const userRouter = express.Router();

// userRouter.get("/", (req, res) => {
//   res.send("Hello This is auth");
// });

userRouter.post("/register", register);
userRouter.post("/email-verify", emailVerified);
userRouter.post("/send-email-verification-otp", sendEmailVerificationOtp);
userRouter.post("/log-in", logIn);

userRouter.post("/log-out", logOut);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/change-password", changePassword);
userRouter.post("/forgot-password", forgotPassword);

export default userRouter;
