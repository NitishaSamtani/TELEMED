import jwt from "jsonwebtoken";
import Signup from "../models/Signup.js";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    const user = await Signup.findById(decoded.id);
    console.log("User:", user);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AdminAuth error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default adminAuth;