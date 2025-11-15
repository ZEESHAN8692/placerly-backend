import mongoose from "mongoose";


const chatSchema = new mongoose.Schema({
  userId: String, 
  message: String,
  sender: { type: String, enum: ["user", "admin"] },
  createdAt: { type: Date, default: Date.now }
});

const ChatModel = mongoose.model("Chat", chatSchema);