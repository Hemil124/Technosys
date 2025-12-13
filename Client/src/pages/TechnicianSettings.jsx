import React, { useState, useEffect, useContext } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Star,
  Clock, CheckCircle, XCircle, AlertCircle, Wallet,
  Activity, MessageSquare, ArrowRight, CreditCard, MapPin,
  BarChart3, TrendingDown as TrendingDownIcon
} from 'lucide-react';
import ServiceOrbitLoader from '../components/ServiceOrbitLoader';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function TechnicianSettings() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  
  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalEarnings: 0,
      walletBalance: 0,
      totalBookings: 0,
      avgRating: 0,
      totalReviews: 0
    },
    todayStats: {
      todayBookings: 0,
      todayEarnings: 0,
      activeBookings: 0,
      completedToday: 0,
      hoursWorked: 0
    },
    performance: {
      completionRate: 0,
      cancellationRate: 0,
      totalReviews: 0,
      avgRating: 0
    },
    alerts: {
      activeComplaints: 0,
      pendingBookings: 0,
      subscriptionStatus: 'No Active Subscription',
      daysRemaining: 0,
      availabilityStatus: 'Not Available'
    },
    financial: {
      pendingPayouts: 0,
      totalEarnings: 0,
      walletBalance: 0,
      platformCommission: 0
    },
    subscription: {
      plan: 'N/A',
      status: 'No Active Subscription',
      expiryDate: null,
      daysRemaining: 0
    }
  });

  const [weeklyEarnings, setWeeklyEarnings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [bookingStatus, setBookingStatus] = useState([]);
  const [revenueByService, setRevenueByService] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [mostBookedServices, setMostBookedServices] = useState([]);
  const [ratingTrend, setRatingTrend] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topLocations, setTopLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchOptions = {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Fetch all endpoints in parallel
      const [
        dashboardRes,
        weeklyRes,
        monthlyRes,
        statusRes,
        revenueServiceRes,
        feedbackRes,
        upcomingRes,
        mostBookedRes,
        ratingTrendRes,
        transactionsRes,
        peakHoursRes,
        locationsRes
      ] = await Promise.all([
        fetch(`${API_URL}/api/technician-analytics/dashboard`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/weekly-earnings`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/monthly-earnings`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/booking-status`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/revenue-by-service`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/recent-feedback`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/upcoming-bookings`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/most-booked-services`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/rating-trend`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/recent-transactions`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/peak-hours`, fetchOptions),
        fetch(`${API_URL}/api/technician-analytics/top-locations`, fetchOptions)
      ]);

      // Check for authentication errors
      if (!dashboardRes.ok) {
        if (dashboardRes.status === 401) {
          throw new Error('You are not logged in. Please login to view the dashboard.');
        } else if (dashboardRes.status === 403) {
          throw new Error('Access denied.');
        } else {
          throw new Error('Failed to load dashboard data.');
        }
      }

      // Parse responses
      const dashboard = await dashboardRes.json();
      const weekly = await weeklyRes.json();
      const monthly = await monthlyRes.json();
      const status = await statusRes.json();
      const revenueService = await revenueServiceRes.json();
      const feedback = await feedbackRes.json();
      const upcoming = await upcomingRes.json();
      const mostBooked = await mostBookedRes.json();
      const ratingData = await ratingTrendRes.json();
      const transactions = await transactionsRes.json();
      const peakData = await peakHoursRes.json();
      const locationData = await locationsRes.json();

      // Update state
      if (dashboard.success) setDashboardData(dashboard.data);
      if (weekly.success) setWeeklyEarnings(weekly.data);
      if (monthly.success) setMonthlyEarnings(monthly.data);
      if (status.success) setBookingStatus(status.data);
      if (revenueService.success) setRevenueByService(revenueService.data);
      if (feedback.success) setRecentFeedback(feedback.data);
      if (upcoming.success) setUpcomingBookings(upcoming.data);
      if (mostBooked.success) setMostBookedServices(mostBooked.data);
      if (ratingData.success) setRatingTrend(ratingData.data);
      if (transactions.success) setRecentTransactions(transactions.data);
      if (peakData.success) setPeakHours(peakData.data);
      if (locationData.success) setTopLocations(locationData.data);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Helper: lighten/darken hex color for gradient shading
  const lightenDarkenColor = (hex, amt) => {
    if (!hex) return '#999999';
    let col = hex.trim();
    if (col.startsWith('rgb')) return col;
    if (col[0] === '#') col = col.slice(1);
    if (col.length === 3) col = col.split('').map(c => c + c).join('');
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0xff) + amt;
    let b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  // Component: KPI Card
  const KPICard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  // Component: Alert Card
  const AlertCard = ({ title, count, icon: Icon, bgClass, accentClass, onClick }) => (
    <button
      onClick={onClick}
      className={`group ${bgClass} rounded-xl px-5 py-4 w-full text-left shadow-sm hover:shadow-md transition-all hover:-translate-y-[2px] focus:outline-none focus:ring-2 focus:ring-offset-2 ${accentClass}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center justify-center rounded-full p-2 bg-white/40 ${accentClass}`}>
            <Icon size={20} />
          </span>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-2xl font-extrabold">{count}</p>
          </div>
        </div>
        <ArrowRight size={20} className="opacity-60 group-hover:opacity-100" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">Track your performance, earnings, and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ServiceOrbitLoader show={true} size={120} />
            <p className="text-gray-600 mt-6">Loading your analytics...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="text-red-500 mx-auto mb-3" size={48} />
            <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          
          {/* 1. Key Metrics (KPI Cards) */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-purple-600" size={20} />
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Total Earnings"
                value={`₹${(dashboardData.kpis.totalEarnings / 1000).toFixed(1)}K`}
                subtitle="All-time revenue"
                icon={DollarSign}
                color="bg-green-500"
              />
              <KPICard
                title="Wallet Balance"
                value={`₹${dashboardData.kpis.walletBalance.toFixed(0)}`}
                subtitle="Available balance"
                icon={Wallet}
                color="bg-blue-500"
                onClick={() => navigate('/technician/subscription')}
              />
              <KPICard
                title="Total Bookings"
                value={dashboardData.kpis.totalBookings}
                subtitle="All-time bookings"
                icon={Calendar}
                color="bg-purple-500"
              />
              <KPICard
                title="Average Rating"
                value={dashboardData.kpis.avgRating}
                subtitle={`${dashboardData.kpis.totalReviews} reviews`}
                icon={Star}
                color="bg-yellow-500"
              />
            </div>
          </div>

          {/* 2. Today's Activity */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              Today's Activity
            </h2>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="animate-pulse" size={24} />
                <h3 className="text-xl font-bold">Live Activity</h3>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm animate-pulse">● LIVE</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Bookings Today</p>
                  <p className="text-3xl font-bold">{dashboardData.todayStats.todayBookings}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Earnings Today</p>
                  <p className="text-3xl font-bold">₹{dashboardData.todayStats.todayEarnings.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Active Bookings</p>
                  <p className="text-3xl font-bold animate-pulse">{dashboardData.todayStats.activeBookings}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Completed Today</p>
                  <p className="text-3xl font-bold">{dashboardData.todayStats.completedToday}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Hours Worked</p>
                  <p className="text-3xl font-bold">{dashboardData.todayStats.hoursWorked}h</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Financial Overview */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              Financial Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="text-orange-600" size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Pending Payouts</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{dashboardData.financial.pendingPayouts.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">This Month's Earnings</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{monthlyEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Current Balance</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{dashboardData.financial.walletBalance.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* 4. Alerts & Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="text-orange-600" size={20} />
              Alerts & Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AlertCard
                title="Pending Bookings"
                count={dashboardData.alerts.pendingBookings}
                icon={Clock}
                bgClass="bg-orange-50"
                accentClass="text-orange-700"
                onClick={() => navigate('/technician/bookings')}
              />
              <AlertCard
                title="Active Complaints"
                count={dashboardData.alerts.activeComplaints}
                icon={MessageSquare}
                bgClass="bg-red-50"
                accentClass="text-red-700"
                onClick={() => navigate('/technician/feedbacks')}
              />
              <AlertCard
                title="Availability"
                count={dashboardData.alerts.availabilityStatus}
                icon={Activity}
                bgClass={dashboardData.alerts.availabilityStatus === 'Available' ? "bg-green-50" : "bg-gray-50"}
                accentClass={dashboardData.alerts.availabilityStatus === 'Available' ? "text-green-700" : "text-gray-700"}
                onClick={() => navigate('/technician/availability')}
              />
            </div>
          </div>

          {/* 5. Booking Statistics - Charts Row */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              Booking Statistics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Status 3D Donut */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.2" />
                      </filter>
                      {bookingStatus.map((item, index) => (
                        <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={lightenDarkenColor(item.color, 28)} />
                          <stop offset="55%" stopColor={item.color} />
                          <stop offset="100%" stopColor={lightenDarkenColor(item.color, -18)} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={bookingStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={60}
                      padAngle={2}
                      cornerRadius={6}
                      fill="#8884d8"
                      dataKey="value"
                      filter="url(#donutShadow)"
                    >
                      {bookingStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {bookingStatus.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Earnings */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Earnings Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyEarnings}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="earnings" stroke="#10B981" fillOpacity={1} fill="url(#colorEarnings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 6. Service Analytics */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-cyan-600" size={20} />
              Service Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Service */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Service Type</h3>
                {revenueByService.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByService}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (₹)" />
                      <Bar dataKey="bookings" fill="#10B981" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <p>No service data available yet</p>
                  </div>
                )}
              </div>

              {/* Most Booked Services */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Most Booked Services</h3>
                {mostBookedServices.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mostBookedServices} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <p>No booking data available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 7. Performance Metrics */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-yellow-600" size={20} />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
                <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                <p className="text-3xl font-bold text-gray-900">{dashboardData.performance.completionRate}%</p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
                <XCircle className="text-red-500 mx-auto mb-2" size={32} />
                <p className="text-3xl font-bold text-gray-900">{dashboardData.performance.cancellationRate}%</p>
                <p className="text-sm text-gray-600">Cancellation Rate</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
                <Star className="text-yellow-500 mx-auto mb-2" size={32} />
                <p className="text-3xl font-bold text-gray-900">{dashboardData.performance.avgRating}/5</p>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
              </div>
            </div>
          </div>

          {/* 8. Rating Trend */}
          {ratingTrend.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rating" stroke="#F59E0B" strokeWidth={3} name="Average Rating" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 9. Additional Insights */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-red-600" size={20} />
              Additional Insights
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Peak Hours */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Booking Hours</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Locations */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📍 Top Service Locations
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {topLocations.length > 0 ? topLocations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <p className="font-semibold text-gray-900">{location.city}</p>
                      </div>
                      <p className="font-bold text-blue-600">{location.bookings} bookings</p>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-6">No location data</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 10. Upcoming Bookings & Recent Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-blue-600" size={18} />
                Upcoming Bookings
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {upcomingBookings.length > 0 ? upcomingBookings.map((booking, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{booking.serviceName}</p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                        booking.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{booking.customerName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.timeSlot}
                    </p>
                    {booking.customerPhone && (
                      <p className="text-xs text-gray-400 mt-1">{booking.customerPhone}</p>
                    )}
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-6">No upcoming bookings</p>
                )}
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={18} />
                Recent Customer Reviews
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentFeedback.length > 0 ? recentFeedback.map((feedback, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{feedback.customerName}</p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="font-bold text-sm">{feedback.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{feedback.review}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(feedback.date).toLocaleDateString()}
                    </p>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-6">No reviews yet</p>
                )}
              </div>
            </div>
          </div>

          {/* 11. Recent Coin Usage History */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="text-purple-600" size={18} />
              Recent Coin Usage History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Coins Used</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length > 0 ? recentTransactions.map((txn, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {txn.serviceName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {txn.categoryName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                          {txn.coinsUsed} 🪙
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          txn.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          txn.status === 'In-Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-500">
                        {new Date(txn.date).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">No coin usage history yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* Footer */}
          <div className="text-center text-gray-500 text-sm py-4">
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
