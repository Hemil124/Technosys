import express from "express";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/serviceCategory.controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// GET /api/service-categories - Public (list active categories)
router.get("/", userAuth,getAllCategories);

// POST /api/service-categories - Admin only (create category)
router.post("/", userAuth, createCategory);

// PUT /api/service-categories/:id - Admin only (update category)
router.put("/:id", userAuth, updateCategory);

// DELETE /api/service-categories/:id - Admin only (delete category)
router.delete("/:id", userAuth, deleteCategory);

export default router;
