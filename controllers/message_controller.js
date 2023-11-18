import messages from "../models/messages.js";
import "dotenv/config.js";

class MessageController {
  async addMessage(req, res) {
    try {
      console.log("adding message", req.body);
      let response = await messages.create(req.body);
      res.json({
        success: true,
        message: "Message uploaded Successfully",
        response,
      });
    } catch (error) {
      res.send({ success: false, message: error });
    }
  }

  async fetchMessageByData(req, res) {
    try {
      const data = req.body;
      console.log("data ", data);
      const response = await messages
        .find(data)
        .populate("receiver")
        .populate("sender")
        .populate("replyTo")
        .sort({ createdAt: 1 });
      res.json({
        success: true,
        message: `Message fetched with data : ${data}`,
        response,
      });
    } catch (error) {
      res.json({
        success: false,
        message: error,
      });
    }
  }

  async editMessage(req, res) {
    try {
      const { id } = req.params;
      const response = await messages.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json({
        success: true,
        message: "Message updated successfully",
        response,
      });
    } catch (error) {
      res.json({
        success: false,
        message: error,
      });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const response = await messages.findByIdAndDelete(id);
      res.json({
        success: true,
        message: "Message deleted successfully",
        response,
      });
    } catch (error) {
      res.json({
        success: false,
        message: error,
      });
    }
  }
}

export default MessageController;
