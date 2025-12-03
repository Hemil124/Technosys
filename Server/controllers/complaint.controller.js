import Complaint from "../models/Complaint.js";
import Booking from "../models/Booking.js";

// Submit or Update Complaint
export const submitComplaint = async (req, res) => {
  try {
    const { bookingId, complaintText } = req.body;
    const customerId = req.userId;

    if (!bookingId || !complaintText || !complaintText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and complaint text are required",
      });
    }

    // Verify booking exists and belongs to customer
    const booking = await Booking.findOne({
      _id: bookingId,
      CustomerID: customerId,
      Status: "Completed",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Completed booking not found",
      });
    }

    // Check if complaint already exists
    let complaint = await Complaint.findOne({ BookingID: bookingId });

    if (complaint) {
      // Update existing complaint
      complaint.ComplaintText = complaintText;
      complaint.Status = "Pending"; // Reset status when editing
      await complaint.save();

      return res.status(200).json({
        success: true,
        message: "Complaint updated successfully",
        complaint,
      });
    } else {
      // Create new complaint
      complaint = await Complaint.create({
        BookingID: bookingId,
        ComplaintText: complaintText,
        Status: "Pending",
      });

      return res.status(201).json({
        success: true,
        message: "Complaint submitted successfully",
        complaint,
      });
    }
  } catch (error) {
    console.error("Error submitting complaint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
};

// Get Complaint for a Booking
export const getComplaint = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.userId;

    // Verify booking belongs to customer
    const booking = await Booking.findOne({
      _id: bookingId,
      CustomerID: customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const complaint = await Complaint.findOne({ BookingID: bookingId });

    return res.status(200).json({
      success: true,
      complaint: complaint || null,
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

// Get All Complaints for Customer's Bookings
export const getCustomerComplaints = async (req, res) => {
  try {
    const customerId = req.userId;

    // Get all customer's completed bookings
    const bookings = await Booking.find({
      CustomerID: customerId,
      Status: "Completed",
    }).select("_id");

    const bookingIds = bookings.map((b) => b._id);

    // Get complaints for those bookings
    const complaints = await Complaint.find({
      BookingID: { $in: bookingIds },
    }).populate("BookingID");

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Error fetching customer complaints:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// Get All Complaints (Admin)
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate({
        path: "BookingID",
        populate: [
          { path: "CustomerID", select: "FirstName LastName Name MobileNumber Email" },
          { path: "TechnicianID", select: "Name MobileNumber Email" },
          { path: "SubCategoryID", select: "name price" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// Update Complaint Status (Admin)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    if (!status || !["Pending", "Resolved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (Pending, Resolved, or Rejected)",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { Status: status },
      { new: true }
    ).populate({
      path: "BookingID",
      populate: [
        { path: "CustomerID", select: "FirstName LastName Name MobileNumber Email" },
        { path: "TechnicianID", select: "Name MobileNumber Email" },
      ],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
};
