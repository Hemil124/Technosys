import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    CustomerID: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    TechnicianID: { type: mongoose.Schema.Types.ObjectId, ref: "Technician" },
    SubCategoryID: { type: mongoose.Schema.Types.ObjectId, ref: "SubServiceCategory" },
    Date: { type: Date, required: true },
    Status: {
      type: String,
      enum: ["Pending","Rejected", "Confirmed", "InProgress", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
