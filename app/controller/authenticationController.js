import sendEmailVerificationOTP from "../helper/sendEmailOtp.js";
import EmailVerificationModel from "../models/otpModel.js";
import { UserModel , userValidation } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

class AuthenticationController {
    async register(req, res) {
        try {
            const { error } = userValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const { name, email, phone, password, confirmPassword , role } = req.body;

            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "User already exists" });
            }
            const hash = await bcrypt.hash(password, 10);
            const user = new UserModel({ name, email, phone, password: hash, confirmPassword: hash , role });
            await user.save();

            // send OTP Mail
            await sendEmailVerificationOTP(user)

            return res.status(201).json({ message: "User registered successfully , OTP sent to email" , data : user });

        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
  
   async verifyEmail(req, res) {
    try {
      const { userId, otp } = req.body;

      const record = await EmailVerificationModel.findOne({ userId, otp });
      if (!record) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Verify user
      await UserModel.findByIdAndUpdate(userId, { isVerified: true });

      // Delete OTP after use
      await EmailVerificationModel.deleteMany({ userId });

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("OTP Verify Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }


  async profile(req, res) {
    try {
      const user = await UserModel.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Profile Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateProfile (req ,res){
    try {
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      await user.save();
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async resetPassword (req , res){
    const {oldPassword , password} = req.body

    try {
     
      const user = await UserModel.findById(req.user._id)
      if(!user){
        return res.status(404).json({message : "User not found"})
      }

      const isMatch = await bcrypt.compare(oldPassword , user.password)

      if(!isMatch){
        return res.status(400).json({message : "Old password is incorrect"})
      }
      const hash = await bcrypt.hash(password , 10)
      user.password = hash
      await user.save()

      res.status(200).json({message : "Password updated successfully"})
    } catch (error) {
      console.error("Reset Password Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }

  }


  async login(req , res){
    try {
      const {email , password} = req.body

      const user = await UserModel.findOne({email})
      if(!user){
        return res.status(404).json({message : "User not found"})
      }

      const isMatch = await bcrypt.compare(password , user.password)

      if(!isMatch){
        return res.status(400).json({message : "Password is incorrect"})
      }

      const token = jwt.sign({_id : user._id , name : user.name , email : user.email , phone : user.phone , role : user.role } , process.env.JWT_SECRET)
      res.cookie("token", token, {
        httpOnly: false, 
        secure: true, 
        sameSite: "none",
        path : "/"
      });

      const subcriptionStatus = user.subscription.status
      console.log("subcriptionStatus" , subcriptionStatus)
      if(subcriptionStatus === "active"){
        res.cookie("subscriptionActive", subcriptionStatus, {
          httpOnly: false, 
          secure: true, 
          sameSite: "none",
          path : "/"
        })
      }


      res.status(200).json({
        status: true,
        message : "Login successfully",
        data:user
      })
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async adminLogin (req ,res){
    try {
      const {email , password} = req.body

      const user = await UserModel.findOne({email})
      if(!user){
        return res.status(404).json({message : "User not found"})
      }

      if(user.role !== "admin"){
        return res.status(401).json({message : "You are not admin"})
      }

      const isMatch = await bcrypt.compare(password , user.password)

      if(!isMatch){
        return res.status(400).json({message : "Password is incorrect"})
      }

      const token = jwt.sign({_id : user._id, name : user.name , email : user.email , phone : user.phone, role : user.role } , process.env.JWT_SECRET)

      if(user.role === "admin"){
        res.cookie("token", token, {
          httpOnly: false, 
          secure: true, 
          sameSite: "none",
          path : "/"
        });
        res.status(200).json({
          status: true,
          message : "Login successfully",
          data:user
        })
      }else{
        res.status(401).json({status: false , message : "You are not admin"})
      }
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
  }

  async logout (req , res){
    try {
      res.clearCookie("token")
      res.status(200).json({message : "Logout successfully"})
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  


}

export default new AuthenticationController();