import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";
 const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. Token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id || decoded._id).select(
      "-password -confirmPassword"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found. Invalid token." });
    }
    req.user = user;

    next(); 
  } catch (err) {
    console.error("Token Verification Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Session expired. Please log in again." });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};



const isLogging = (req, res, next) => {
  let token;
  const secretKey = process.env.JWT_SECRET;
  console.log("Secret key:", secretKey);

  // Check header
  const authHeader = req.headers.cookie;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  // Check cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
 
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = {
      id: decoded._id,
      role: decoded.role,
      username: decoded.username,
      full_name: decoded.full_name,
    };
    console.log("Decoded user:", req.user);
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};



export {
    verifyToken,
    isLogging
};