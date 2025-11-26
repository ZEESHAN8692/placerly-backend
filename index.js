import dotenv from "dotenv"
dotenv.config()
import express from 'express';
import Database from "./app/config/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes/routes.js";
import http from "http";
import { Server } from "socket.io";
const app = express();



// Database
Database()

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL, "http://localhost:5174", "http://localhost:5173" ,"https://placerly-frontend-c7r6.vercel.app","https://placerly-admin.vercel.app"],
    credentials: true
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); 

app.get('/', (req, res) => {
 res.send('Hello World!');
});
app.use("/api", router)


// HTTP + SOCKET SERVER
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL, "http://localhost:5174", "http://localhost:5173","https://placerly-frontend-c7r6.vercel.app","https://placerly-admin.vercel.app"],
    credentials: true
  }
});

export { io };

// Socket Logic
import chatSocket from "./app/sockets/chat.socket.js";
chatSocket(io);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server running on " + port);
});




// app.listen(port, () => {
//  console.log(`Server running on port ${port}`);
// });
