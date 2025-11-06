import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);

export default ServiceCategory;
