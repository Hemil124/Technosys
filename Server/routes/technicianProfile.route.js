import express from "express";
import multer from "multer";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import userAuth from "../middleware/userAuth.js";
import {
  getTechnicianProfile,
  updateTechnicianProfile,
  changeTechnicianPassword,
  sendMobileOTP,
  sendEmailOTP,
  verifyMobileOTP,
  verifyEmailOTP,
} from "../controllers/technicianProfile.controller.js";

const router = express.Router();

// Ensure upload directories exist
async function ensureUploadDirectories() {
  try {
    if (!existsSync("uploads/photos")) {
      await mkdir("uploads/photos", { recursive: true });
    }
    if (!existsSync("uploads/idProofs")) {
      await mkdir("uploads/idProofs", { recursive: true });
    }
  } catch (error) {
    console.error("Error ensuring upload directories:", error);
  }
}

// Call on startup
ensureUploadDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "photo") {
      cb(null, "uploads/photos");
    } else if (file.fieldname === "idProof") {
      cb(null, "uploads/idProofs");
    } else {
      cb(null, "uploads");
    }
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Configure multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// GET /api/technician/profile - Get technician profile (protected)
router.get("/", userAuth, getTechnicianProfile);

// POST /api/technician/profile/send-mobile-otp - Send OTP for mobile verification
router.post("/send-mobile-otp", userAuth, sendMobileOTP);

// POST /api/technician/profile/verify-mobile-otp - Verify mobile OTP
router.post("/verify-mobile-otp", userAuth, verifyMobileOTP);

// POST /api/technician/profile/send-email-otp - Send OTP for email verification
router.post("/send-email-otp", userAuth, sendEmailOTP);

// POST /api/technician/profile/verify-email-otp - Verify email OTP
router.post("/verify-email-otp", userAuth, verifyEmailOTP);

// PATCH /api/technician/profile - Update technician profile (protected, with file uploads)
router.patch(
  "/",
  userAuth,
  upload.fields([
    { name: "photo", maxCount: 1 },
    // ID Proof is managed by admin only, not by technician
    // { name: "idProof", maxCount: 1 },
  ]),
  updateTechnicianProfile
);

// POST /api/technician/profile/change-password - Change password (protected)
router.post("/change-password", userAuth, changeTechnicianPassword);

export default router;
