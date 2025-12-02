import Booking from "../models/Booking.js";
import Technician from "../models/Technician.js";
import TechnicianAvailability from "../models/TechnicianAvailability.js";
import ServiceCategory from "../models/ServiceCategory.js"; // kept if needed elsewhere
import SubServiceCategory from "../models/SubServiceCategory.js";
import Customer from "../models/Customer.js";
import ServiceRequest from "../models/ServiceRequest.js";
import TechnicianServiceCategory from "../models/TechnicianServiceCategory.js";
import TechnicianWallet from "../models/TechnicianWallet.js";
import mongoose from "mongoose";
import { getIo } from "../config/realtime.js";

// Helper: radius technicians by category and timeslot
async function findEligibleTechnicians({ coords, radiusKm = 5, serviceCategoryId, date, timeSlot }) {
  const [lng, lat] = coords;
  
  // First, find technicians by category using the linking table
  const technicianCategories = await TechnicianServiceCategory.find({
    ServiceCategoryID: serviceCategoryId
  }).lean();
  
  const categoryTechIds = technicianCategories.map(tc => tc.TechnicianID);
  if (!categoryTechIds.length) return [];
  
  // Then filter by location and approval status
  const technicians = await Technician.find({
    _id: { $in: categoryTechIds },
    VerifyStatus: "Approved",
    location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: radiusKm * 1000 } },
  }).lean();
  
  console.log('  ✓ Approved technicians within', radiusKm, 'km:', technicians.length);
  technicians.forEach((tech, idx) => {
    const techCoords = tech.location?.coordinates || [];
    const distance = calculateDistance(lat, lng, techCoords[1], techCoords[0]);
    console.log(`    ${idx + 1}. ${tech.Name} (ID: ${String(tech._id).slice(-6)}) - ${distance.toFixed(2)} km away at [${techCoords[1]}, ${techCoords[0]}]`);
  });

  if (!technicians.length) return [];

  const techIds = technicians.map(t => t._id);

  // Format date as YYYY-MM-DD string to match model
  const dateStr = new Date(date).toISOString().split('T')[0];
  
  // Build the time slot string (e.g., "18:00-19:00")
  const timeSlotStr = `${timeSlot}-${String(parseInt(timeSlot.split(':')[0]) + 1).padStart(2, '0')}:00`;

  const availabilities = await TechnicianAvailability.find({
    technicianId: { $in: techIds },
    date: dateStr,
    timeSlots: { $elemMatch: { slot: timeSlotStr, status: "available" } }
  }).lean();
  
  console.log('  ✓ Technicians with availability for', timeSlotStr, 'on', dateStr, ':', availabilities.length);
  availabilities.forEach((avail, idx) => {
    const tech = technicians.find(t => String(t._id) === String(avail.technicianId));
    console.log(`    ${idx + 1}. ${tech?.Name || 'Unknown'} (ID: ${String(avail.technicianId).slice(-6)}) has slot available`);
  });
  
  const availableTechIds = new Set(availabilities.map(a => String(a.technicianId)));
  const eligible = technicians.filter(t => availableTechIds.has(String(t._id)));
  return eligible;
}

// Helper: Calculate distance between two lat/lng points in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function createBooking(req, res) {
  try {
    const customerId = req.userId || req.user?._id || req.body.CustomerID;
    const { SubCategoryID, Date: bookingDate, TimeSlot } = req.body;

    if (!bookingDate || !TimeSlot) {
      return res.status(400).json({ success: false, message: "Date and TimeSlot are required" });
    }
    // Ensure customer has an address
    const customer = await Customer.findById(customerId).lean();
    if (!customer || !customer.Address || !customer.Address.houseNumber || !customer.Address.pincode) {
      return res.status(400).json({ success: false, message: "Please set your address before booking." });
    }

    const booking = await Booking.create({
      CustomerID: customerId,
      SubCategoryID,
      Date: new Date(bookingDate),
      TimeSlot,
      Status: "Pending",
      AutoCancelAt: null,
    });

    // Create a paired service request document (empty details for now)
    await ServiceRequest.create({ BookingID: booking._id });

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error("createBooking error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function precheckAvailability(req, res) {
  try {
    const { CustomerID, SubCategoryID, Date: bookingDate, TimeSlot } = req.body;
    
    if (!CustomerID || !SubCategoryID || !bookingDate || !TimeSlot) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    const customer = await Customer.findById(CustomerID).lean();
    if (!customer) {
      return res.status(400).json({ success: false, message: "Customer not found" });
    }
    
    if (!customer.location || !Array.isArray(customer.location.coordinates)) {
      return res.status(400).json({ success: false, message: "Please update your profile with your location to find nearby technicians" });
    }
    
    // Infer service category from subcategory
    const sub = await SubServiceCategory.findById(SubCategoryID).lean();
    const serviceCategoryId = sub?.serviceCategoryId || sub?.CategoryID || sub?.ServiceCategoryID || null;
    if (!serviceCategoryId) {
      console.error('SubCategory lookup failed or missing serviceCategoryId:', sub);
      return res.status(400).json({ success: false, message: "Invalid service category. Please contact support." });
    }
    
    const eligible = await findEligibleTechnicians({ coords: customer.location.coordinates, radiusKm: 5, serviceCategoryId, date: bookingDate, timeSlot: TimeSlot });
    if (!eligible.length) {
      return res.json({ success: false, message: "No technician available for the selected time. Please change date or location." });
    }
    res.json({ success: true, technicians: eligible });
  } catch (err) {
    console.error("precheckAvailability error", err);
    res.status(500).json({ success: false, message: "Internal error: " + err.message });
  }
}

export async function simulatePayment(req, res) {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Payment simulated successfully." });
  } catch (err) {
    console.error("simulatePayment error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function broadcastBooking(req, res) {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    
    // Find eligible technicians using customer's location and category inferred from subcategory
    const customer = await Customer.findById(booking.CustomerID).lean();
    if (!customer || !customer.location || !Array.isArray(customer.location.coordinates)) {
      return res.status(400).json({ success: false, message: "Customer location required" });
    }
    
    const sub = await SubServiceCategory.findById(booking.SubCategoryID).lean();
    const serviceCategoryId = sub?.serviceCategoryId || sub?.CategoryID || sub?.ServiceCategoryID || null;
    
    const eligible = await findEligibleTechnicians({ coords: customer.location.coordinates, radiusKm: 5, serviceCategoryId, date: booking.Date, timeSlot: booking.TimeSlot });

    if (!eligible.length) {
      return res.status(400).json({ success: false, message: "No technicians available" });
    }

    // Update service request with broadcast technicians
    const techIds = eligible.map(t => t._id);
    console.log('💾 Saving broadcast technicians:', techIds.length, 'IDs:', techIds.map(id => String(id).slice(-6)));
    
    const serviceRequest = await ServiceRequest.findOne({ BookingID: booking._id });
    if (serviceRequest) {
      serviceRequest.BroadcastTechnicians = techIds;
      await serviceRequest.save();
      console.log('✅ ServiceRequest saved. BroadcastTechnicians:', serviceRequest.BroadcastTechnicians.length);
    } else {
      console.log('❌ ServiceRequest not found for booking:', booking._id);
    }
    
    booking.AutoCancelAt = new Date(Date.now() + 10 * 60 * 1000);
    await booking.save();

    // Emit socket event to all matched technicians
    const io = getIo();
    console.log('📡 Broadcasting to', eligible.length, 'technicians via socket...');
    eligible.forEach((t, idx) => {
      const techId = String(t._id);
      const payload = { 
        bookingId: String(booking._id), 
        customerId: String(booking.CustomerID), 
        date: booking.Date, 
        timeSlot: booking.TimeSlot 
      };
      console.log(`  ${idx + 1}. Emitting to ${t.Name} (ID: ${techId.slice(-6)})`);
      io.to(techId).emit("new-booking-request", payload);
    });

    res.json({ success: true, technicians: eligible.length });
  } catch (err) {
    console.error("broadcastBooking error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function acceptBooking(req, res) {
  try {
    const { bookingId } = req.body;
    const technicianId = req.userId || req.user?._id || req.body.TechnicianID;

    const booking = await Booking.findById(bookingId).populate('SubCategoryID');
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.Status !== "Pending") return res.status(400).json({ success: false, message: "Booking already processed" });

    // Get coins required for this service
    const coinsRequired = booking.SubCategoryID?.coinsRequired || 0;

    // Check technician wallet balance
    let wallet = await TechnicianWallet.findOne({ TechnicianID: technicianId });
    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await TechnicianWallet.create({ TechnicianID: technicianId, BalanceCoins: 0 });
    }

    // Check if technician has enough coins
    if (wallet.BalanceCoins < coinsRequired) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient coins. Please purchase a subscription to continue.",
        insufficientCoins: true,
        requiredCoins: coinsRequired,
        currentBalance: wallet.BalanceCoins
      });
    }

    // Deduct coins from wallet
    wallet.BalanceCoins -= coinsRequired;
    wallet.LastUpdate = new Date();
    await wallet.save();

    // Update booking status
    booking.Status = "Confirmed";
    booking.TechnicianID = technicianId;
    booking.AcceptedAt = new Date();
    await booking.save();

    const io = getIo();
    
    // Notify the customer that their booking was accepted
    const customerId = String(booking.CustomerID);
    io.to(customerId).emit("booking-accepted", { 
      bookingId: String(booking._id), 
      technicianId: String(technicianId),
      status: "Confirmed"
    });
    
    // Notify all other technicians to remove the request via ServiceRequest broadcast list
    const serviceRequest = await ServiceRequest.findOne({ BookingID: booking._id }).lean();
    (serviceRequest?.BroadcastTechnicians || []).forEach(tid => {
      if (String(tid) !== String(technicianId)) {
        io.to(String(tid)).emit("booking-request-closed", { bookingId: booking._id });
      }
    });

    res.json({ 
      success: true, 
      data: booking,
      coinsDeducted: coinsRequired,
      newBalance: wallet.BalanceCoins
    });
  } catch (err) {
    console.error("acceptBooking error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function autoCancelIfNoAcceptance(req, res) {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.Status === "Pending" && booking.AutoCancelAt && Date.now() >= booking.AutoCancelAt.getTime()) {
      booking.Status = "AutoCancelled";
      await booking.save();
      
      const io = getIo();
      const serviceRequest = await ServiceRequest.findOne({ BookingID: booking._id }).lean();
      
      // Notify all technicians to remove the request
      (serviceRequest?.BroadcastTechnicians || []).forEach(tid => {
        io.to(String(tid)).emit("booking-request-closed", { bookingId: String(booking._id) });
      });
      
      // Notify customer about auto-cancellation
      const customerId = String(booking.CustomerID);
      io.to(customerId).emit("booking-auto-cancelled", { 
        bookingId: String(booking._id),
        message: "Your booking was automatically cancelled due to no technician acceptance within 10 minutes."
      });
      
      return res.json({ success: true, message: "Booking auto-cancelled. Refund will be processed." });
    }

    res.json({ success: true, message: "Still waiting" });
  } catch (err) {
    console.error("autoCancelIfNoAcceptance error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).lean();
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    console.error("getBookingById error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { bookingId } = req.body;
    const customerId = req.userId || req.user?._id || req.body.CustomerID;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    
    // Check if booking belongs to customer
    if (String(booking.CustomerID) !== String(customerId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if already cancelled or confirmed
    if (booking.Status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Booking already cancelled" });
    }
    if (booking.Status === "Confirmed") {
      return res.status(400).json({ success: false, message: "Cannot cancel confirmed booking" });
    }

    // Check 10-minute window
    const createdTime = new Date(booking.createdAt).getTime();
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    
    if (now - createdTime > tenMinutes) {
      return res.status(400).json({ success: false, message: "Cancellation window (10 minutes) has expired" });
    }

    // Cancel booking
    booking.Status = "Cancelled";
    await booking.save();

    // Notify technicians to close the request
    const io = getIo();
    const serviceRequest = await ServiceRequest.findOne({ BookingID: booking._id }).lean();
    (serviceRequest?.BroadcastTechnicians || []).forEach(tid => {
      io.to(String(tid)).emit("booking-request-closed", { bookingId: booking._id });
    });

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("cancelBooking error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function getCustomerBookings(req, res) {
  try {
    const customerId = req.userId || req.user?._id || req.params.customerId;
    
    const bookings = await Booking.find({ CustomerID: customerId })
      .populate('SubCategoryID', 'name price image')
      .populate('TechnicianID', 'Name MobileNumber')
      .populate('CustomerID', 'Address')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("getCustomerBookings error", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function getTechnicianPendingRequests(req, res) {
  try {
    const technicianId = req.userId || req.user?._id || req.params.technicianId;
    if (!technicianId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Find service requests where this technician was broadcasted
    const requests = await ServiceRequest.find({ BroadcastTechnicians: technicianId })
      .select('BookingID BroadcastTechnicians')
      .lean();

    const bookingIds = requests.map(r => r.BookingID).filter(Boolean);
    if (!bookingIds.length) {
      return res.json({ success: true, requests: [] });
    }

    // Find pending bookings that haven't been auto-cancelled (newest first)
    const now = Date.now();
    const bookings = await Booking.find({
      _id: { $in: bookingIds },
      Status: 'Pending',
    }).select('_id CustomerID SubCategoryID Date TimeSlot AutoCancelAt createdAt')
      .populate('SubCategoryID', 'coinsRequired name')
      .sort({ createdAt: -1 })
      .lean();

    const active = bookings.filter(b => !b.AutoCancelAt || now < new Date(b.AutoCancelAt).getTime());

    const result = active.map(b => ({
      bookingId: String(b._id),
      customerId: String(b.CustomerID),
      date: b.Date,
      timeSlot: b.TimeSlot,
      coinsRequired: b.SubCategoryID?.coinsRequired || 0,
    }));

    return res.json({ success: true, requests: result });
  } catch (err) {
    console.error('getTechnicianPendingRequests error', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

export async function getTechnicianAcceptedBookings(req, res) {
  try {
    const technicianId = req.userId || req.user?._id || req.params.technicianId;
    if (!technicianId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const bookings = await Booking.find({
      TechnicianID: technicianId,
      Status: 'Confirmed',
    })
      .populate('SubCategoryID', 'name image price coinsRequired')
      .populate('CustomerID', 'FirstName LastName Phone Address')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, bookings });
  } catch (err) {
    console.error('getTechnicianAcceptedBookings error', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

export default {
  createBooking,
  precheckAvailability,
  simulatePayment,
  broadcastBooking,
  acceptBooking,
  autoCancelIfNoAcceptance,
  getBookingById,
  cancelBooking,
  getCustomerBookings,
  getTechnicianPendingRequests,
  getTechnicianAcceptedBookings,
};
