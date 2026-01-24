import express from "express";
import upload from "../middleware/upload.js";
import { signup, login, getAllUsers } from "../controllers/authController.js";

const router = express.Router();

// SIGNUP ROUTE → supports patient & doctor file uploads
router.post(
  "/signup",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalLicense", maxCount: 1 },
    { name: "identityProof", maxCount: 1 },            
  ]),
  signup
);

// LOGIN ROUTE
router.post("/login", login);

// ADMIN or internal route → GET all users
router.get("/all", getAllUsers);

export default router;
