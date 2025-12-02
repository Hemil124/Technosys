import express from "express";
import {
  createBooking,
  precheckAvailability,
  simulatePayment,
  broadcastBooking,
  acceptBooking,
  autoCancelIfNoAcceptance,
  cancelBooking,
  getCustomerBookings,
  getTechnicianPendingRequests,
  getTechnicianAcceptedBookings,
  getBookingById,
} from "../controllers/booking.controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create", userAuth, createBooking);
router.post("/precheck", userAuth, precheckAvailability);
router.post("/simulate-payment", userAuth, simulatePayment);
router.post("/broadcast", userAuth, broadcastBooking);
router.post("/accept", userAuth, acceptBooking);
router.post("/auto-cancel", userAuth, autoCancelIfNoAcceptance);
router.post("/cancel", userAuth, cancelBooking);
router.get("/customer/:customerId", userAuth, getCustomerBookings);
router.get("/technician/pending", userAuth, getTechnicianPendingRequests);
router.get("/technician/accepted", userAuth, getTechnicianAcceptedBookings);
router.get("/:id", userAuth, getBookingById);

export default router;
