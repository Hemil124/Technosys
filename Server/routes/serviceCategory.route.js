import express from "express";
import { getAllCategories, createCategory } from "../controllers/serviceCategory.controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// GET /api/service-categories
router.get("/", getAllCategories);
router.post("/", userAuth, createCategory);

export default router;
