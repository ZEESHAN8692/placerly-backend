import dotenv from "dotenv"
dotenv.config()
import express from 'express';
import Database from "./app/config/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();


// Database
Database()

// Middleware
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get('/', (req, res) => {
 res.send('Hello World!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
 console.log(`Server running on port ${port}`);
});
