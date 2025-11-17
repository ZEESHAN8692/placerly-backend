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


const AuthCheck = (req, res, next) => {
  const token = req.cookies.token;
    // req?.body?.token || req?.query?.token || req?.headers["x-access-token"];
  if (!token) {
    return res.status(400).json({
      message: "Token is required for access this page",
    });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    console.log("before login data", req.user);
    req.user = decoded;
    console.log("afetr login data", req.user);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  return next();
};




const adminCheck = (req, res, next) => {
  const token = req.cookies.token;
    // req?.body?.token || req?.query?.token || req?.headers["x-access-token"];
  if (!token) {
    return res.status(400).json({
      message: "Token is required for access this page",
    });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decoded;
    console.log("afetr login data", req.user);
    if (req.user.role !== "admin") {
      return res.status(400).json({
        message: "You are not admin",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  return next();
};

const executorBlock = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({
      message: "Token is required to access this page",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log("after login data", req.user);

    if (req.user.role === "executor") {
      return res.status(403).json({
        message: `Access declined: You are executor, you cannot ${req.method.toLowerCase()} here`,
      });
    }

    next(); // user allowed

  } catch (err) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
};




export {
    verifyToken,
    AuthCheck,
    adminCheck,
    executorBlock
  
};