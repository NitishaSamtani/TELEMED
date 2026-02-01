import Signup from "../models/Signup.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

/* =====================================================
    SIGNUP CONTROLLER
===================================================== */

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Duplicate user check
    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Create USER (auth)
    const user = await Signup.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: role === "patient",
    });

    // 2️⃣ Create role-based profile
    if (role === "patient") {
      await Patient.create({
        userId: user._id,
        name,
        email,
      });
    }

    if (role === "doctor") {
      await Doctor.create({
        userId: user._id,
        name,
        email,
        phone: req.body.phone || null,
        qualification: req.body.qualification || null,
        specialization: req.body.specialization || null,
        experience: req.body.experience || null,
        bio: req.body.bio || null,
        languagesSpoken: req.body.languagesSpoken
          ? JSON.parse(req.body.languagesSpoken)
          : [],
        availability: req.body.availability
          ? JSON.parse(req.body.availability)
          : [],
        breakTime: req.body.breakTime
          ? JSON.parse(req.body.breakTime)
          : null,
        profilePhoto: req.files?.profilePhoto?.[0]?.path || null,
        medicalLicense: req.files?.medicalLicense?.[0]?.path || null,
        identityProof: req.files?.identityProof?.[0]?.path || null,
      });
    }

    return res.status(201).json({
      message: "Signup successful. Please login.",
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/* =====================================================
    LOGIN CONTROLLER
===================================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const user = await Signup.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Doctor cannot login until verified
    if (user.role === "doctor" && !user.verified) {
      return res.status(403).json({ msg: "Your account is not verified yet." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

/* =====================================================
    GET ALL USERS (ADMIN PANEL)
===================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await Signup.find().select("-password");
    return res.json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};