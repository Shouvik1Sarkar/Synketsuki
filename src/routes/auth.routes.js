import express from "express";
import {
  emailVerified,
  logIn,
  register,
} from "../controllers/auth.controllers.js";

const userRouter = express.Router();

// userRouter.get("/", (req, res) => {
//   res.send("Hello This is auth");
// });

userRouter.post("/register", register);
userRouter.post("/email-verify", emailVerified);
userRouter.post("/log-in", logIn);

export default userRouter;
