import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import dbConnection from "../dataBase/db";

import CommonService from "../service/commonService";

const commonService = new CommonService(dbConnection);
const app = express();
const server = http.createServer(app);
const inputOutput = new Server(server);

app.use(express.json());

inputOutput.on("connection", (socket: Socket) => {
  console.log("A user connected with client id:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected client id:", socket.id);
  });
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  commonService.startRecommendationEngine();
  console.log(`Server is running `);
  commonService.setEventScheduler();
});
