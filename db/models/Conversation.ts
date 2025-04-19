"use server";
import mongoose from "mongoose";

// Define member interface
interface IConversationMember {
  memberId: mongoose.Types.ObjectId;
  lastSeenMessage: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

// Define conversation document interface
interface IConversation {
  name?: string;
  isGroup: boolean;
  lastMessageId: mongoose.Types.ObjectId | null;
  members: IConversationMember[];
  createdAt: Date;
  updatedAt: Date;
}

// Conversation Member sub-schema (to be embedded in Conversation)
const conversationMemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastSeenMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true, _id: true }
);

// Conversation Schema with embedded members
const conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    isGroup: {
      type: Boolean,
      required: true,
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    members: [conversationMemberSchema],
  },
  { timestamps: true }
);

// Create indexes for efficient member lookup within conversations
conversationSchema.index({ "members.memberId": 1 });
conversationSchema.index({ "members.memberId": 1, _id: 1 });

// Define model
const Conversation = (mongoose.models?.Conversation ||
  mongoose.model(
    "Conversation",
    conversationSchema
  )) as mongoose.Model<IConversation>;

export default Conversation;
