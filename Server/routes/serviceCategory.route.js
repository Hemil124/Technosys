import express from "express";
import multer from "multer";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/serviceCategory.controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Ensure uploads/categories directory exists
const ensureCategoriesDir = async () => {
	try {
		if (!existsSync("uploads/categories")) {
			await mkdir("uploads/categories", { recursive: true });
		}
	} catch (error) {
		console.error("Error creating categories upload directory:", error);
	}
};
ensureCategoriesDir();

// Multer storage for category images
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/categories");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const extension = file.originalname.split(".").pop();
		cb(null, "category-" + uniqueSuffix + "." + extension);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype && file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Only image files are allowed for category image"), false);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// GET /api/service-categories - Public (list active categories)
router.get("/", getAllCategories);

// POST /api/service-categories - Admin only (create category)
router.post("/", userAuth, upload.single("image"), createCategory);

// PUT /api/service-categories/:id - Admin only (update category)
router.put("/:id", userAuth, upload.single("image"), updateCategory);

// DELETE /api/service-categories/:id - Admin only (delete category)
router.delete("/:id", userAuth, deleteCategory);

export default router;
