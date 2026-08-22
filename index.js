import app from "./src/app.js";
import express from "express";
import { PORT, MONGODB_URI } from "./config/env.config.js";

import { connectDB } from "./connect/db.connect.js";
import dns from "dns";
import globalError from "./src/middlewares/globalError.middlewares.js";

import pino from "pino";

import http from "http";

import path from "path";

import { Server } from "socket.io";

import { initializeSocket } from "./src/sockets/socket.js";
import { connectRedis } from "./config/redis.config.js";

const server = http.createServer(app);

app.get("/lala", (req, res) => {
  return res.sendFile(path.join(path.resolve("./public"), "index.html"));
});

dns.setServers(["8.8.8.8", "8.8.4.4"]);
app.use(globalError);

const startServer = async () => {
  try {
    await connectRedis();
    await connectDB(MONGODB_URI);
    const io = await initializeSocket(server);

    server.listen(PORT, () => {
      console.log("Server running at->", PORT);
    });
  } catch (err) {
    console.error(err, "Server failed to start");
    process.exit(1);
  }
};

startServer();
