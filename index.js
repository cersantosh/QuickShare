import express, { urlencoded } from "express";
import mongoose from "mongoose";
import usersRouter from "./routes/users.js";
import messageRouter from "./routes/message.js";
import cors from "cors";
import { Server } from "socket.io";
import messages from "./models/messages.js";
import firebaseStorage from "./utils/firebase_initialize.js";
import { ref, deleteObject } from "firebase/storage";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.static("uploads"));
app.use(urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", usersRouter);
app.use("/messages", messageRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build"));
  app.get("*", (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // res.sendFile("./frontend/build/index.html");
    res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("home page");
  });
}

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, async () => {
  // connecting to mongodb database
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("connected to database");
  } catch (error) {
    console.log("error while connecting to database", error);
  }
  console.log(`Server started on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const onlineUsers = [];
const users = new Map();

io.on("connection", (socket) => {
  console.log("socket connection established");

  let userIpAddress =
    socket.request.headers["x-forwarded-for"] ||
    socket.request.socket.remoteAddress;
  const userIpWithoutPort = userIpAddress.split(":")[0];
  userIpAddress = userIpWithoutPort.split(".").slice(0, 3).join("");
  console.log("user ip address", userIpAddress);

  io.emit("connected");
  socket.on("userConnected", (userInfo) => {
    if (socket.id && userInfo) {
      console.log("online users", onlineUsers);
      const isSameIdExist = onlineUsers.filter(
        (user) => user._id === userInfo._id
      );

      if (isSameIdExist.length == 0) {
        users.set(userInfo._id, socket.id);
        onlineUsers.push({
          [userInfo._id]: socket.id,
          ipAddress: userIpAddress,
          ...userInfo,
        });
      }
      socket.join(userIpAddress);
      const usersWithSameIP = onlineUsers.filter(
        (user) => user.ipAddress === userIpAddress
      );
      console.log("users with same ip", usersWithSameIP);

      io.to(userIpAddress).emit("updateOnlineUsers", usersWithSameIP);
    }
  });
  socket.on("userDisconnected", (userId) => {
    console.log("user is disconnected", userId);
    const indexToDelete = onlineUsers.findIndex((user) => user._id === userId);
    if (indexToDelete != -1) {
      onlineUsers.splice(indexToDelete, 1);
    }
    const usersWithSameIP = onlineUsers.filter(
      (user) => user.ipAddress === userIpAddress
    );
    io.to(userIpAddress).emit("deleteOnlineUsers", usersWithSameIP);
  });
  socket.on("sendMessage", (data) => {
    socket.to(users.get(data.receiver._id)).emit("messageReceived", data);
    socket.emit("messageReceived", data);
  });
  socket.on("deleteMessage", (data) => {
    socket.to(users.get(data.receiverId)).emit("messageDeleted", data.messages);
    socket.emit("messageDeleted", data.messages);
  });
  socket.on("editMessage", (data) => {
    socket.emit("messageEdited", data);
    socket.to(users.get(data.receiverId)).emit("messageEdited", data);
  });
});

setInterval(async () => {
  const fiveMinutes = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const files = await messages.find({
      createdAt: {
        $lte: fiveMinutes,
      },
      file: true,
    });
    for (const file of files) {
      const fileRef = ref(firebaseStorage, `shared_files/${file.fileName}`);
      await deleteObject(fileRef);
    }
    const response = await messages.deleteMany({
      createdAt: {
        $lte: fiveMinutes,
      },
    });
    if (response.deletedCount > 0) {
      io.emit("oldMessageDeleted");
    }
  } catch (error) {
    console.log("Error while deleting messages after 5 minutes", error);
  }
}, 1000 * 60);
