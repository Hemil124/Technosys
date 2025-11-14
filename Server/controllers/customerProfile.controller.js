import Customer from "../models/Customer.js";

export const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Fetch customer details
    const customer = await Customer.findById(customerId).select("-__v");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// 📌 UPDATE customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { Name, Mobile, Email, Address } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        Name,
        Mobile,
        Email,
        Address,
      },
      { new: true }
    ).select("-__v");

    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Mobile or Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
