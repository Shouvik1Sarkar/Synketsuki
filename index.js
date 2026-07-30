import app from "./src/app.js";
import express from "express";
import { PORT, MONGODB_URI } from "./config/env.config.js";

import { connectDB } from "./connect/db.connect.js";
import dns from "dns";
import globalError from "./src/middlewares/globalError.middlewares.js";

import pino from "pino";

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

dns.setServers(["8.8.8.8", "8.8.4.4"]);
app.use(globalError);

const startServer = async () => {
  try {
    await connectDB(MONGODB_URI);

    app.listen(PORT, () => {
      console.log("Server running at->", PORT);
    });
  } catch (err) {
    console.error(err, "Server failed to start");
    process.exit(1);
  }
};

startServer();

/**
 * 
 * Mongodb connection error Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.ajhohvt.mongodb.net
    at QueryReqWrap.onresolve [as oncomplete] (node:internal/dns/promises:295:17) {
  errno: undefined,
  code: 'ECONNREFUSED',
  syscall: 'querySrv',
  hostname: '_mongodb._tcp.cluster0.ajhohvt.mongodb.net'
}


Mongodb connection error MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
 */
