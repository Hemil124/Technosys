import express from "express";
import multer from "multer";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import userAuth from "../middleware/userAuth.js";
import {
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategory,
} from "../controllers/subServiceCategory.controller.js";

const router = express.Router();

// Ensure uploads/subcategories directory exists
const ensureSubcategoriesDir = async () => {
  try {
    if (!existsSync("uploads/subcategories")) {
      await mkdir("uploads/subcategories", { recursive: true });
    }
  } catch (error) {
    console.error("Error creating subcategories upload directory:", error);
  }
};
ensureSubcategoriesDir();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/subcategories");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, "subcategory-" + uniqueSuffix + "." + extension);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for sub-category image"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// GET /api/sub-service-categories - list, optional ?serviceCategoryId=
router.get("/", getAllSubCategories);

// GET /api/sub-service-categories/:id
router.get("/:id", getSubCategory);

// POST - admin only
router.post("/", userAuth, upload.single("image"), createSubCategory);

// PUT - admin only
router.put("/:id", userAuth, upload.single("image"), updateSubCategory);

// DELETE - admin only (soft)
router.delete("/:id", userAuth, deleteSubCategory);

export default router;
