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

    /* ---------- Basic Validation ---------- */
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    /* ---------- Duplicate Email Check ---------- */
    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    /* ---------- Hash Password ---------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---------- Create User (Authentication) ---------- */
    const user = await Signup.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    /* ---------- Create Role-Based Profile ---------- */
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
        isVerified: false, // 🔥 Doctor must be approved by admin
      });
    }

    return res.status(201).json({
      message: "Signup successful. Please wait for approval if doctor.",
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

    /* ---------- Basic Validation ---------- */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /* ---------- Find User ---------- */
    const user = await Signup.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    /* ---------- Check Password ---------- */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    /* ---------- Doctor Approval Check ---------- */
    if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: user._id });

      if (!doctorProfile) {
        return res.status(403).json({
          message: "Doctor profile not found.",
        });
      }

      if (!doctorProfile.isVerified) {
        return res.status(403).json({
          message:
            doctorProfile.rejectionReason
              ? `Profile Disapproved: ${doctorProfile.rejectionReason}`
              : "Your profile is under review.",
        });
      }
    }

    /* ---------- Generate JWT ---------- */
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =====================================================
   GET ALL USERS (ADMIN ONLY)
===================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await Signup.find().select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};