import express from "express";
import MessageController from "../controllers/message_controller.js";

const messageRouter = express.Router();

const messageController = new MessageController();

messageRouter.post("/add_message", messageController.addMessage);
messageRouter.post("/fetch_message", messageController.fetchMessageByData);
messageRouter.put("/edit_message/:id", messageController.editMessage)
messageRouter.delete("/delete_message/:id", messageController.deleteMessage)


export default messageRouter;
