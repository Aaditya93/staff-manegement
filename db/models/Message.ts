"use server";
import mongoose from "mongoose";

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    content: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

// Create indexes for messages
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

// Define message document interface
interface IMessage {
  senderId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  type: string;
  content: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define model
const Message = (mongoose.models?.Message ||
  mongoose.model("Message", messageSchema)) as mongoose.Model<IMessage>;

export default Message;
