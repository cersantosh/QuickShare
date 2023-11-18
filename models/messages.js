import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
    },
    message: {
      type: String,
    },
    file: {
      type: Boolean,
      default: false,
    },
    fileName : String
  },

  {
    timestamps: true,
  }
);

const messages = mongoose.model("messages", messageSchema);

export default messages;
