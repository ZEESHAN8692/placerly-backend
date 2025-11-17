import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: String, enum: ["user", "admin"], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ChatModel = mongoose.model("Chat", chatSchema);
export default ChatModel;
