import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://yourapp.vercel.app",
  "http://localhost:8000",
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

// app.use(helmet());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World there");
});

app.use("/api/v1/auth", userRouter);

export default app;
