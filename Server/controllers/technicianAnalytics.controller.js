import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import TechnicianWallet from '../models/TechnicianWallet.js';
import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';
import SubscriptionPayment from '../models/SubscriptionPayment.js';
import CustomerPayment from '../models/CustomerPayment.js';
import SubServiceCategory from '../models/SubServiceCategory.js';
import ServiceCategory from '../models/ServiceCategory.js';
import TechnicianAvailability from '../models/TechnicianAvailability.js';

// Get Technician Dashboard Overview
export const getTechnicianDashboard = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    // Get wallet balance
    const wallet = await TechnicianWallet.findOne({ TechnicianID: technicianId });
    const walletBalance = wallet ? wallet.BalanceCoins : 0;

    // Get total earnings (all completed bookings)
    const totalEarningsResult = await CustomerPayment.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId,
          'booking.Status': 'Completed',
          Status: 'Success'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$Amount' }
        }
      }
    ]);
    const totalEarnings = totalEarningsResult[0]?.totalEarnings || 0;

    // Get total bookings count
    const totalBookings = await Booking.countDocuments({ TechnicianID: technicianId });
    const completedBookings = await Booking.countDocuments({ 
      TechnicianID: technicianId, 
      Status: 'Completed' 
    });

    // Get average rating
    const ratingResult = await Feedback.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$Rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    const avgRating = ratingResult[0]?.avgRating || 0;
    const totalReviews = ratingResult[0]?.totalReviews || 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      TechnicianID: technicianId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayEarningsResult = await CustomerPayment.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId,
          'booking.Status': 'Completed',
          Status: 'Success',
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          todayEarnings: { $sum: '$Amount' }
        }
      }
    ]);
    const todayEarnings = todayEarningsResult[0]?.todayEarnings || 0;

    // Active bookings
    const activeBookings = await Booking.countDocuments({
      TechnicianID: technicianId,
      Status: { $in: ['In-Progress', 'Accepted'] }
    });

    // Calculate hours worked today (estimate based on completed bookings)
    const completedToday = await Booking.countDocuments({
      TechnicianID: technicianId,
      Status: 'Completed',
      updatedAt: { $gte: today, $lt: tomorrow }
    });
    const hoursWorked = completedToday * 2; // Estimate 2 hours per booking

    // Completion rate
    const completionRate = totalBookings > 0 
      ? ((completedBookings / totalBookings) * 100).toFixed(1) 
      : 0;

    // Cancellation count and rate
    const cancelledBookings = await Booking.countDocuments({
      TechnicianID: technicianId,
      Status: 'Cancelled'
    });
    const cancellationRate = totalBookings > 0 
      ? ((cancelledBookings / totalBookings) * 100).toFixed(1) 
      : 0;

    // Pending payouts
    const pendingPayouts = wallet?.PendingAmount || 0;

    // Active complaints
    const activeComplaintsResult = await Complaint.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId
        }
      },
      {
        $count: 'count'
      }
    ]);
    const activeComplaints = activeComplaintsResult[0]?.count || 0;

    // Pending bookings
    const pendingBookings = await Booking.countDocuments({
      TechnicianID: technicianId,
      Status: 'Pending'
    });

    // Get subscription status
    const latestSubscription = await SubscriptionPayment.findOne({
      TechnicianID: technicianId,
      Status: 'Success'
    }).sort({ createdAt: -1 });

    let subscriptionStatus = 'No Active Subscription';
    let daysRemaining = 0;
    let subscriptionPlan = 'N/A';
    
    if (latestSubscription && latestSubscription.ExpiryDate) {
      const expiryDate = new Date(latestSubscription.ExpiryDate);
      const now = new Date();
      if (expiryDate > now) {
        daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        subscriptionStatus = 'Active';
      } else {
        subscriptionStatus = 'Expired';
      }
      subscriptionPlan = latestSubscription.PackageName || 'N/A';
    }

    // Get today's availability
    const todayAvailability = await TechnicianAvailability.findOne({
      TechnicianID: technicianId,
      Date: { $gte: today, $lt: tomorrow }
    });
    const availabilityStatus = todayAvailability?.IsAvailable ? 'Available' : 'Not Available';

    // Platform commission paid (sum of all subscription payments)
    const commissionPaid = await SubscriptionPayment.aggregate([
      {
        $match: {
          TechnicianID: technicianId,
          Status: 'Success'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$Amount' }
        }
      }
    ]);
    const platformCommission = commissionPaid[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalEarnings,
          walletBalance,
          totalBookings,
          avgRating: avgRating.toFixed(1),
          totalReviews
        },
        todayStats: {
          todayBookings,
          todayEarnings,
          activeBookings,
          completedToday,
          hoursWorked
        },
        performance: {
          completionRate: parseFloat(completionRate),
          cancellationRate: parseFloat(cancellationRate),
          totalReviews,
          avgRating: avgRating.toFixed(1)
        },
        alerts: {
          activeComplaints,
          pendingBookings,
          subscriptionStatus,
          daysRemaining,
          availabilityStatus
        },
        financial: {
          pendingPayouts,
          totalEarnings,
          walletBalance,
          platformCommission
        },
        subscription: {
          plan: subscriptionPlan,
          status: subscriptionStatus,
          expiryDate: latestSubscription?.ExpiryDate || null,
          daysRemaining
        }
      }
    });
  } catch (error) {
    console.error('Error in getTechnicianDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get Weekly Earnings
export const getWeeklyEarnings = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyData = await CustomerPayment.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId,
          'booking.Status': 'Completed',
          Status: 'Success',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          earnings: { $sum: '$Amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = weeklyData.map(item => ({
      day: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      earnings: item.earnings
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getWeeklyEarnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly earnings',
      error: error.message
    });
  }
};

// Get Monthly Earnings
export const getMonthlyEarnings = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyResult = await CustomerPayment.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId,
          'booking.Status': 'Completed',
          Status: 'Success',
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          monthlyEarnings: { $sum: '$Amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: monthlyResult[0]?.monthlyEarnings || 0
    });
  } catch (error) {
    console.error('Error in getMonthlyEarnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly earnings',
      error: error.message
    });
  }
};

// Get Booking Status Distribution
export const getBookingStatus = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const statusData = await Booking.aggregate([
      { $match: { TechnicianID: technicianId } },
      {
        $group: {
          _id: '$Status',
          count: { $sum: 1 }
        }
      }
    ]);

    const colors = {
      'Pending': '#F59E0B',
      'Accepted': '#3B82F6',
      'In-Progress': '#8B5CF6',
      'Completed': '#10B981',
      'Cancelled': '#EF4444'
    };

    const formattedData = statusData.map(item => ({
      name: item._id,
      value: item.count,
      color: colors[item._id] || '#6B7280'
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getBookingStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking status',
      error: error.message
    });
  }
};

// Get Revenue by Service Type
export const getRevenueByService = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const revenueData = await Booking.aggregate([
      {
        $match: {
          TechnicianID: technicianId
        }
      },
      {
        $lookup: {
          from: 'subservicecategories',
          localField: 'SubCategoryID',
          foreignField: '_id',
          as: 'subService'
        }
      },
      { $unwind: { path: '$subService', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'servicecategories',
          localField: 'subService.serviceCategoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'customerpayments',
          localField: '_id',
          foreignField: 'BookingID',
          as: 'payment'
        }
      },
      { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$category.name', 'Uncategorized'] },
          revenue: { 
            $sum: { 
              $cond: [
                { $eq: ['$payment.Status', 'Success'] },
                { $ifNull: ['$payment.Amount', 0] },
                0
              ]
            }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    console.log('Revenue by Service Data:', JSON.stringify(revenueData, null, 2));

    const formattedData = revenueData.map(item => ({
      category: item._id || 'Uncategorized',
      revenue: item.revenue,
      bookings: item.bookings
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getRevenueByService:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue by service',
      error: error.message
    });
  }
};

// Get Recent Feedback
export const getRecentFeedback = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const recentFeedback = await Feedback.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'booking.CustomerID',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          customerName: { $ifNull: ['$customer.Name', 'Anonymous'] },
          rating: '$Rating',
          review: '$FeedbackText',
          date: '$createdAt'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: recentFeedback
    });
  } catch (error) {
    console.error('Error in getRecentFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent feedback',
      error: error.message
    });
  }
};

// Get Upcoming Bookings
export const getUpcomingBookings = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const upcomingBookings = await Booking.find({
      TechnicianID: technicianId,
      Status: { $in: ['Pending', 'Confirmed', 'In-Progress'] },
      Date: { $gte: new Date() }
    })
      .populate('CustomerID', 'Name MobileNumber')
      .populate('SubCategoryID', 'name')
      .sort({ Date: 1, TimeSlot: 1 })
      .limit(5)
      .select('CustomerID SubCategoryID Date TimeSlot Status');

    const formattedData = upcomingBookings.map(booking => ({
      id: booking._id,
      customerName: booking.CustomerID?.Name || 'N/A',
      customerPhone: booking.CustomerID?.MobileNumber || 'N/A',
      serviceName: booking.SubCategoryID?.name || 'N/A',
      scheduledDate: booking.Date,
      timeSlot: booking.TimeSlot,
      status: booking.Status
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getUpcomingBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bookings',
      error: error.message
    });
  }
};

// Get Most Booked Services
export const getMostBookedServices = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    // First check total bookings
    const totalBookings = await Booking.countDocuments({ TechnicianID: technicianId });
    console.log('Total bookings for technician:', totalBookings);

    const mostBooked = await Booking.aggregate([
      { $match: { TechnicianID: technicianId } },
      {
        $lookup: {
          from: 'subservicecategories',
          localField: 'SubCategoryID',
          foreignField: '_id',
          as: 'subService'
        }
      },
      { $unwind: { path: '$subService', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$subService.name', 'Unknown Service'] },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    console.log('Most Booked Services Data:', JSON.stringify(mostBooked, null, 2));

    const formattedData = mostBooked.map(item => ({
      name: item._id || 'Unknown Service',
      bookings: item.bookings
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getMostBookedServices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch most booked services',
      error: error.message
    });
  }
};

// Get Rating Trend (last 6 months)
export const getRatingTrend = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const ratingTrend = await Feedback.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'BookingID',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.TechnicianID': technicianId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          avgRating: { $avg: '$Rating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const formattedData = ratingTrend.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      rating: parseFloat(item.avgRating.toFixed(2)),
      reviews: item.count
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getRatingTrend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating trend',
      error: error.message
    });
  }
};

// Get Recent Coin Usage History
export const getRecentTransactions = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const coinUsageHistory = await Booking.aggregate([
      {
        $match: {
          TechnicianID: technicianId,
          Status: { $in: ['Confirmed', 'In-Progress', 'Completed'] }
        }
      },
      {
        $lookup: {
          from: 'subservicecategories',
          localField: 'SubCategoryID',
          foreignField: '_id',
          as: 'subService'
        }
      },
      { $unwind: { path: '$subService', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'servicecategories',
          localField: 'subService.serviceCategoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          serviceName: { $ifNull: ['$subService.name', 'Unknown Service'] },
          categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
          coinsUsed: { $ifNull: ['$subService.coinsRequired', 0] },
          date: '$createdAt',
          status: '$Status'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: coinUsageHistory
    });
  } catch (error) {
    console.error('Error in getRecentTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coin usage history',
      error: error.message
    });
  }
};

// Get Peak Hours
export const getPeakHours = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const bookings = await Booking.aggregate([
      {
        $match: {
          TechnicianID: technicianId,
          TimeSlot: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$TimeSlot',
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = bookings.map(item => ({
      hour: item._id,
      bookings: item.bookings
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getPeakHours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch peak hours',
      error: error.message
    });
  }
};

// Get Top Locations
export const getTopLocations = async (req, res) => {
  try {
    const technicianId = new mongoose.Types.ObjectId(req.userId);

    const locations = await Booking.aggregate([
      { $match: { TechnicianID: technicianId } },
      {
        $lookup: {
          from: 'customers',
          localField: 'CustomerID',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          'customer.Address.city': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$customer.Address.city',
          bookings: { $sum: 1 }
        }
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    const formattedData = locations.map(loc => ({
      city: loc._id || 'Unknown',
      bookings: loc.bookings
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getTopLocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top locations',
      error: error.message
    });
  }
};
