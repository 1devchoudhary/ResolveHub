import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, mobile } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, mobile });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id, // This is the userId (MongoDB _id)
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        mobile: newUser.mobile
      }
      
    });
  } catch (error) {
    console.error("🔴 Registration Error:", error); // <== See exact error
    res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload (userId and role)
      process.env.JWT_SECRET, // Secret key from .env
      { expiresIn: "1h" } // Token expiration (1 hour)
    );

    // Send the token back to the frontend
    res.status(200).json({
      success: true,
      token, // Send the JWT token to frontend
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        mobile: user.mobile
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};


// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile } = req.body;
    
      // Check if the logged-in user's ID matches the param
    if (req.user.id !== id && req.user._id !== id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Find the user and update their data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, mobile },
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user profile" });
  }
};

//  Get user data  from backend
export const getUserProfile = async (req, res) => {
  try {
    console.log("🟢 req.user:", req.user); // log decoded JWT
    const userId = req.user._id; // Get userId from JWT token in the middleware
    console.log("🟢 Extracted userId:", userId);
    console.log(userId);
    const user = await User.findById(userId).select("-password"); // Exclude password
    console.log("🟢 Found user:", user);
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
