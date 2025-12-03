import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { 
  Star, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";
import { toast } from "react-toastify";
import ServiceOrbitLoader from "../components/ServiceOrbitLoader";

export const AdminFeedbacks = () => {
  const { backendUrl } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("feedbacks"); // feedbacks or complaints
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch feedbacks and complaints
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [feedbackRes, complaintRes] = await Promise.all([
          axios.get(`${backendUrl}/api/feedback/admin/all`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/complaints/admin/all`, { withCredentials: true })
        ]);

        if (feedbackRes.data.success) {
          setFeedbacks(feedbackRes.data.feedbacks || []);
        }
        if (complaintRes.data.success) {
          setComplaints(complaintRes.data.complaints || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl]);

  // Calculate statistics
  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.Rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.Status === "Pending").length;

  // Handle complaint status update
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/complaints/admin/status/${complaintId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (data.success) {
        setComplaints(complaints.map(c => 
          c._id === complaintId ? { ...c, Status: newStatus } : c
        ));
        toast.success(`Complaint ${newStatus.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint status");
    }
  };

  // Filter complaints by status
  const filteredComplaints = complaints.filter(complaint => {
    if (statusFilter !== "All" && complaint.Status !== statusFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = complaint.BookingID?.CustomerID?.Name || 
                          `${complaint.BookingID?.CustomerID?.FirstName || ""} ${complaint.BookingID?.CustomerID?.LastName || ""}`;
      return customerName.toLowerCase().includes(searchLower) ||
             complaint.ComplaintText?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = feedback.BookingID?.CustomerID?.Name || 
                          `${feedback.BookingID?.CustomerID?.FirstName || ""} ${feedback.BookingID?.CustomerID?.LastName || ""}`;
      return customerName.toLowerCase().includes(searchLower) ||
             feedback.FeedbackText?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ServiceOrbitLoader show={true} size={80} speed={700} />
        <p className="text-gray-600 mt-4">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Feedbacks & Complaints
          </h1>
          <p className="text-gray-600">Monitor customer feedback and manage complaints</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Feedbacks */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MessageSquare className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{totalFeedbacks}</div>
            <div className="text-blue-100 text-sm">Total Feedbacks</div>
          </div>

          {/* Average Rating */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Star className="h-6 w-6" />
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(parseFloat(averageRating)))}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{averageRating}</div>
            <div className="text-orange-100 text-sm">Average Rating</div>
          </div>

          {/* Total Complaints */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <AlertCircle className="h-6 w-6" />
              </div>
              <Users className="h-5 w-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{totalComplaints}</div>
            <div className="text-red-100 text-sm">Total Complaints</div>
          </div>

          {/* Pending Complaints */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
              <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-medium">Action Needed</span>
            </div>
            <div className="text-3xl font-bold mb-1">{pendingComplaints}</div>
            <div className="text-purple-100 text-sm">Pending Complaints</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("feedbacks")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-300 ${
                activeTab === "feedbacks"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Star size={18} />
                <span>Feedbacks ({totalFeedbacks})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("complaints")}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-300 ${
                activeTab === "complaints"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle size={18} />
                <span>Complaints ({totalComplaints})</span>
              </div>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by customer name or text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {activeTab === "complaints" && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "feedbacks" ? (
              // Feedbacks Table
              <div className="overflow-x-auto">
                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No feedbacks found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Service</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Technician</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Rating</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Feedback</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedbacks.map((feedback) => {
                        const customerName = feedback.BookingID?.CustomerID?.Name || 
                          `${feedback.BookingID?.CustomerID?.FirstName || ""} ${feedback.BookingID?.CustomerID?.LastName || ""}`.trim() || "N/A";
                        const serviceName = feedback.BookingID?.SubCategoryID?.name || "N/A";
                        const technicianName = feedback.BookingID?.TechnicianID?.Name || "N/A";
                        const date = new Date(feedback.createdAt).toLocaleDateString();

                        return (
                          <tr key={feedback._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{customerName}</div>
                              <div className="text-sm text-gray-500">{feedback.BookingID?.CustomerID?.Email || ""}</div>
                            </td>
                            <td className="py-4 px-4 text-gray-700">{serviceName}</td>
                            <td className="py-4 px-4 text-gray-700">{technicianName}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {renderStars(feedback.Rating)}
                                <span className="text-sm font-semibold text-gray-700">{feedback.Rating}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-gray-700 line-clamp-2">{feedback.FeedbackText || "No comment"}</p>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">{date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              // Complaints Table
              <div className="overflow-x-auto">
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No complaints found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Service</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Technician</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Complaint</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map((complaint) => {
                        const customerName = complaint.BookingID?.CustomerID?.Name || 
                          `${complaint.BookingID?.CustomerID?.FirstName || ""} ${complaint.BookingID?.CustomerID?.LastName || ""}`.trim() || "N/A";
                        const serviceName = complaint.BookingID?.SubCategoryID?.name || "N/A";
                        const technicianName = complaint.BookingID?.TechnicianID?.Name || "N/A";
                        const date = new Date(complaint.createdAt).toLocaleDateString();

                        return (
                          <tr key={complaint._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{customerName}</div>
                              <div className="text-sm text-gray-500">{complaint.BookingID?.CustomerID?.Email || ""}</div>
                            </td>
                            <td className="py-4 px-4 text-gray-700">{serviceName}</td>
                            <td className="py-4 px-4 text-gray-700">{technicianName}</td>
                            <td className="py-4 px-4">
                              <p className="text-gray-700 line-clamp-2">{complaint.ComplaintText}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                complaint.Status === "Pending" 
                                  ? "bg-yellow-100 text-yellow-800"
                                  : complaint.Status === "Resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {complaint.Status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">{date}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {complaint.Status === "Pending" && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(complaint._id, "Resolved")}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Resolve"
                                    >
                                      <CheckCircle size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(complaint._id, "Rejected")}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Reject"
                                    >
                                      <XCircle size={18} />
                                    </button>
                                  </>
                                )}
                                {complaint.Status !== "Pending" && (
                                  <span className="text-gray-400 text-sm">No actions</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
