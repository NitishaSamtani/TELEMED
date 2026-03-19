import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { body, validationResult } from "express-validator";

import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import Contact from "./models/Contact.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mongo URL
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/telemed";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

/* =============================================================
   HEALTH CHECK
============================================================= */
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, dbState: mongoose.connection.readyState });
});

/* =============================================================
   CONTACT FORM API
============================================================= */
app.post(
  "/api/contact",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("message").notEmpty().withMessage("Message required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, phone, subject, message, agree } = req.body;

      const contact = new Contact({
        name,
        email,
        phone,
        subject,
        message,
        agree: !!agree,
      });

      const saved = await contact.save();

      res.status(201).json({
        message: "Contact saved",
        id: saved._id,
      });
    } catch (err) {
      console.error("Contact save error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* =============================================================
   AUTH ROUTES
============================================================= */
app.use("/api/auth", authRoutes);

/* =============================================================
   ADMIN ROUTES
============================================================= */
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =============================================================
   CONNECT TO DATABASE & START SERVER
============================================================= */
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });