import mongoose from "mongoose";

const subscriptionPaymentSchema = new mongoose.Schema({
  HistoryID: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionHistory", required: true },
  TechnicianID: { type: mongoose.Schema.Types.ObjectId, ref: "Technician", required: true },
  Amount: { type: Number, required: true },
  Method: { type: String, required: true },
  Status: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },
}, { timestamps: true });

const SubscriptionPayment = mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);

export default SubscriptionPayment;
