import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRef } from "react";

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { userData, backendUrl, socket } = useContext(AppContext);
  const navigate = useNavigate();
  const processedAutoCancels = useRef(new Set());

  const fetchBookings = async () => {
    try {
      const customerId = userData?._id || userData?.id;
      const { data } = await axios.get(
        `${backendUrl}/api/bookings/customer/${customerId}`,
        { withCredentials: true }
      );
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?._id || userData?.id) fetchBookings();
  }, [userData, backendUrl]);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cancel trigger when countdown expires
  useEffect(() => {
    if (!bookings?.length) return;

    const expiredPending = bookings.filter(b => {
      if (b.Status !== "Pending") return false;
      const bookingTime = new Date(b.createdAt);
      const diffMs = (10 * 60 * 1000) - (currentTime - bookingTime);
      return diffMs <= 0 && !processedAutoCancels.current.has(String(b._id));
    });

    expiredPending.forEach(async (b) => {
      try {
        processedAutoCancels.current.add(String(b._id));
        await axios.post(
          `${backendUrl}/api/bookings/auto-cancel`,
          { bookingId: b._id },
          { withCredentials: true }
        );
        // Toast will be shown by socket listener
        // Optimistically update status locally
        setBookings(prev => prev.map(x => String(x._id) === String(b._id) ? { ...x, Status: 'AutoCancelled' } : x));
        // Refresh to ensure server state
        fetchBookings();
      } catch (err) {
        // If API fails, allow retry on next tick by removing from processed set
        processedAutoCancels.current.delete(String(b._id));
        console.error('Auto-cancel trigger failed', err);
      }
    });
  }, [currentTime, bookings, backendUrl]);

  // Listen for booking acceptance from technician
  useEffect(() => {
    if (!socket) return;

    const handleBookingAccepted = ({ bookingId, technicianId, status }) => {
      toast.success('A technician has accepted your booking!');
      
      // Update the specific booking in the list
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          String(booking._id) === String(bookingId)
            ? { ...booking, Status: status, TechnicianID: technicianId }
            : booking
        )
      );
      
      // Refresh to get full technician details
      fetchBookings();
    };

    const handleBookingAutoCancelled = ({ bookingId, message }) => {
      toast.error(message || 'Your booking was automatically cancelled due to no technician acceptance.');
      
      // Update the specific booking in the list
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          String(booking._id) === String(bookingId)
            ? { ...booking, Status: 'AutoCancelled' }
            : booking
        )
      );
      
      // Refresh to get updated status
      fetchBookings();
    };

    socket.on('booking-accepted', handleBookingAccepted);
    socket.on('booking-auto-cancelled', handleBookingAutoCancelled);

    return () => {
      socket.off('booking-accepted', handleBookingAccepted);
      socket.off('booking-auto-cancelled', handleBookingAutoCancelled);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        Loading your bookings...
      </div>
    );
  }

  // If no bookings available
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center min-h-[70vh] bg-white px-6">
        <div className="w-full max-w-2xl border-b border-gray-200 flex justify-between items-center pb-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2" size={18} />
            <span className="font-semibold">My Bookings</span>
          </button>
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-1 px-3 py-1 text-sm text-purple-700 border border-purple-200 rounded-md hover:bg-purple-50"
          >
            <HelpCircle size={15} />
            Help
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-800">No bookings yet.</h2>
        <p className="text-gray-500 mt-2">
          Looks like you haven’t experienced quality services at home.
        </p>

        <button
          onClick={() => navigate("/customer/services")}
          className="mt-4 text-purple-700 font-medium hover:underline flex items-center gap-1"
        >
          Explore our services →
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { icon: Clock, color: "text-yellow-700 bg-yellow-50 border-yellow-200", text: "Pending" },
      Confirmed: { icon: CheckCircle, color: "text-green-700 bg-green-50 border-green-200", text: "Confirmed" },
      Cancelled: { icon: XCircle, color: "text-red-700 bg-red-50 border-red-200", text: "Cancelled" },
      AutoCancelled: { icon: XCircle, color: "text-orange-700 bg-orange-50 border-orange-200", text: "Auto-Cancelled" },
      Completed: { icon: CheckCircle, color: "text-blue-700 bg-blue-50 border-blue-200", text: "Completed" }
    };
    const config = statusConfig[status] || statusConfig["Pending"];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const canCancel = (booking) => {
    if (booking.Status !== "Pending") return false;
    const bookingTime = new Date(booking.createdAt);
    const diffMinutes = (currentTime - bookingTime) / (1000 * 60);
    return diffMinutes <= 10;
  };

  const getTimeRemaining = (booking) => {
    if (booking.Status !== "Pending") return null;
    const bookingTime = new Date(booking.createdAt);
    const diffMs = (10 * 60 * 1000) - (currentTime - bookingTime);
    if (diffMs <= 0) return null;
    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await axios.post(
        `${backendUrl}/api/bookings/cancel`,
        { bookingId },
        { withCredentials: true }
      );
      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  // If bookings exist
  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2" size={20} />
          <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
        </button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition flex gap-4"
          >
            {/* Service Image */}
            {booking.SubCategoryID?.image && (
              <img
                src={booking.SubCategoryID.image}
                alt={booking.SubCategoryID.name}
                className="w-24 h-24 object-cover rounded-md"
              />
            )}

            {/* Booking Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {booking.SubCategoryID?.name || "Service"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ₹{booking.SubCategoryID?.price || booking.TotalAmount}
                  </p>
                </div>
                {getStatusBadge(booking.Status)}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Date:</strong> {new Date(booking.Date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
                <p>
                  <strong>Time:</strong> {booking.TimeSlot}
                </p>
                {booking.CustomerID?.Address && (
                  <p>
                    <strong>Address:</strong> {booking.CustomerID.Address.houseNumber || booking.CustomerID.Address.house_no}, {booking.CustomerID.Address.street || booking.CustomerID.Address.road}, {booking.CustomerID.Address.city || booking.CustomerID.Address.town}, {booking.CustomerID.Address.pincode || booking.CustomerID.Address.postcode}
                  </p>
                )}
                {booking.TechnicianID && (
                  <p>
                    <strong>Technician:</strong> {booking.TechnicianID.Name} ({booking.TechnicianID.MobileNumber})
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2 items-center">
                {canCancel(booking) && (
                  <>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="px-4 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition"
                    >
                      Cancel Booking
                    </button>
                    {getTimeRemaining(booking) && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Clock size={12} />
                        {getTimeRemaining(booking)} remaining
                      </span>
                    )}
                  </>
                )}
                {booking.Status === "Pending" && !canCancel(booking) && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Cancellation window expired
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerBookings;
