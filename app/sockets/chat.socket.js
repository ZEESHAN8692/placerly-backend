// chatSocket.js
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ChatModel from "../models/chatModel.js";
import { UserModel } from "../models/userModel.js";

export default function chatSocket(io) {
    io.on("connection", (socket) => {
        console.log("User Connected:", socket.id);

        socket.on("registerUser", async (data) => {
            const token = data?.token;
            let userId;
            let name = "Guest User";

            try {
                if (token) {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded._id;

                    const user = await UserModel.findById(userId);
                    name = user?.name || "User";
                } else {
                    userId = new mongoose.Types.ObjectId();
                }
            } catch {
                userId = new mongoose.Types.ObjectId();
            }

            socket.userId = userId;

            // JOIN USER ROOM
            socket.join(userId.toString());

            // SEND REGISTERED DETAILS
            socket.emit("userRegistered", {
                userId,
                name,
            });
        });

        // USER SEND MESSAGE
        socket.on("sendMessage", async (data) => {
            try {
                const msg = await ChatModel.create({
                    userId: socket.userId,
                    message: data.message,
                    sender: "user",
                });

                // SEND TO ADMIN
                io.emit("newMessageToAdmin", msg);

                // SEND BACK TO USER ROOM
                io.to(socket.userId.toString()).emit("messageHistory", [msg]);
            } catch (error) {
                console.log("Message Save Error:", error);
            }
        });

        // ADMIN REPLY
        socket.on("adminReply", async (data) => {
            try {
                const msg = await ChatModel.create({
                    userId: data.userId,
                    message: data.message,
                    sender: "admin",
                });

                // SEND TO SPECIFIC USER ROOM
                io.to(data.userId.toString()).emit("messageHistory", [msg]);
            } catch (error) {
                console.log("Admin Reply Error:", error);
            }
        });

        // ADMIN REQUESTS CHAT HISTORY
        socket.on("getChatHistory", async (userId) => {
            const history = await ChatModel.find({ userId }).sort({ createdAt: 1 });
            socket.emit("loadChatHistory", history);
        });

        

        console.log("User Disconnected");
    });
}
