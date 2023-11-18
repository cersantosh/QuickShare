import express, { urlencoded } from "express";
import mongoose from "mongoose";
import usersRouter from "./routes/users.js";
import messageRouter from "./routes/message.js";
import cors from "cors";
import { Server } from "socket.io";
import messages from "./models/messages.js";
import firebaseStorage from "./utils/firebase_initialize.js";
import { ref, deleteObject } from "firebase/storage";
import { fileURLToPath } from "url";
import { dirname } from "path";

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
    const __dirname = dirname(__filename);
    res.sendFile(path.resolve(__dirname, "frontend/build/index.html"));
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

const io = new Server(server);

const users = new Map();

io.on("connection", (socket) => {
  console.log("socket connection established");
  io.emit("connected");
  socket.on("userConnected", (user) => {
    if (socket.id && user) {
      users.set(user._id, socket.id);
      io.emit("updateOnlineUsers", user);
    }
  });
  socket.on("userDisconnected", (userId) => {
    console.log("user is disconnected", userId);
    io.emit("deleteOnlineUsers", userId);
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
