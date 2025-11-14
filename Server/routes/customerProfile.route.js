import express from "express";
import { getCustomerProfile,updateCustomerProfile } from "../controllers/customerProfile.controller.js";

const router = express.Router();

// GET customer profile by customer ID
router.get("/:id", getCustomerProfile);
// UPDATE profile
router.put("/:id", updateCustomerProfile);

export default router;
