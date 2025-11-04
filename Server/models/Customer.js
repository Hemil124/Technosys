import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  Name: { 
    type: String, 
    required: true, 
    maxlength: 100 
  },
  Mobile: { 
    type: String, 
    required: true, 
    unique: true, 
    maxlength: 15 
  },
  Email: { 
    type: String, 
    maxlength: 100, 
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
  Address: { 
    type: String, 
    default: null 
  }

  
}, { timestamps: true }); // auto manages createdAt & updatedAt

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
