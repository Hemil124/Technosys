import React, { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  ChevronDown,
  Grid3X3,
  Hourglass,
  ToggleRight,
  ToggleLeft,
  Loader2,
  Folder,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { AppContext } from "../context/AppContext";

const TechnicianRequest = () => {
  const { backendUrl, userData } = useContext(AppContext);

  // data
  const [allTechs, setAllTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Dropdown states
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;

  // modals & selections
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch once on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/admin/technicians`, {
          withCredentials: true,
          timeout: 10000,
        });
        if (res.data?.success) {
          setAllTechs(Array.isArray(res.data.technicians) ? res.data.technicians : []);
        } else {
          toast.error(res.data?.message || "Failed to load technicians");
        }
      } catch (err) {
        console.error(err);
        if (err.response) {
          toast.error(err.response.data?.message || "Failed to load technicians");
        } else {
          toast.error("Network error — check backend or connection");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Helpers
  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `${backendUrl}${path}`;
    return `${backendUrl}/uploads/photos/${path}`;
  };

  const DefaultAvatar = ({ name }) => (
    <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-400 text-white rounded-full flex items-center justify-center font-bold shadow">
      {name?.[0]?.toUpperCase() || "T"}
    </div>
  );

  // Statistics
  const stats = useMemo(() => {
    const total = allTechs.length;
    const pending = allTechs.filter((t) => t.VerifyStatus === "Pending").length;
    const approved = allTechs.filter((t) => t.VerifyStatus === "Approved").length;
    const rejected = allTechs.filter((t) => t.VerifyStatus === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [allTechs]);

  // Filters
  const filtered = useMemo(() => {
    return allTechs.filter((tech) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        tech.Name?.toLowerCase().includes(searchLower) ||
        tech.Email?.toLowerCase().includes(searchLower) ||
        tech.MobileNumber?.toLowerCase().includes(searchLower) ||
        tech.ServiceCategoryID?.name?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      if (statusFilter !== "all" && tech.VerifyStatus !== statusFilter) return false;

      if (categoryFilter && tech.ServiceCategoryID?._id !== categoryFilter) return false;

      return true;
    });
  }, [allTechs, searchTerm, statusFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, statusFilter, categoryFilter]);

  // Category list for filter
  const categoryList = [
    ...new Map(
      allTechs.map((t) => [t.ServiceCategoryID?._id, t.ServiceCategoryID])
    ).values(),
  ].filter(Boolean);

  // Pagination Component
  const Pagination = ({ page, totalPages, onChange }) => {
    const getPages = () => {
      let arr = [];
      arr.push(1);

      if (page > 3) arr.push("...");

      for (let p = page - 1; p <= page + 1; p++) {
        if (p > 1 && p < totalPages) arr.push(p);
      }

      if (page < totalPages - 2) arr.push("...");

      if (totalPages > 1) arr.push(totalPages);

      return arr;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-6 select-none">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg bg-gray-100 
          ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          Prev
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-gray-500">…</span>
          ) : (
            <button
              key={i}
              onClick={() => onChange(p)}
              className={`w-10 h-10 rounded-lg transition font-medium
              ${p === page
                  ? "bg-black text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg bg-gray-100 
          ${page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          Next
        </button>
      </div>
    );
  };

  // Actions
  const handleApprove = async (id) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/admin/technicians/${id}/approve`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Technician approved");
        setAllTechs((prev) => prev.map((t) => (t._id === id ? { ...t, VerifyStatus: "Approved" } : t)));
        setShowDetailsModal(false);
        setShowRejectModal(null);
      } else {
        toast.error(res.data?.message || "Approve failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }
    try {
      const res = await axios.patch(
        `${backendUrl}/api/admin/technicians/${id}/reject`,
        { reason: rejectReason },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Technician rejected");
        setAllTechs((prev) =>
          prev.map((t) =>
            t._id === id ? { ...t, VerifyStatus: "Rejected", rejectReason } : t
          )
        );
        setShowRejectModal(null);
        setRejectReason("");
        setShowDetailsModal(false);
      } else {
        toast.error(res.data?.message || "Reject failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Reject failed");
    }
  };

  const openDetails = (id) => {
    const t = allTechs.find((x) => x._id === id);
    setSelectedTechnician(t || null);
    setShowDetailsModal(true);
  };

  // Security check
  if (userData?.role && userData.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Technician Management</h2>
          <p className="text-gray-500">Manage technician registrations and account status</p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-blue-600">
              <Grid3X3 size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-extrabold text-blue-700">{stats.total}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-yellow-600">
              <Hourglass size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-extrabold text-yellow-600">{stats.pending}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-green-600">
              <ToggleRight size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Approved</div>
              <div className="text-2xl font-extrabold text-green-600">{stats.approved}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="text-red-600">
              <ToggleLeft size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Rejected</div>
              <div className="text-2xl font-extrabold text-red-600">{stats.rejected}</div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, mobile, category..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="px-4 py-2 rounded-lg bg-white flex items-center gap-2 hover:bg-gray-100 whitespace-nowrap"
              style={{ maxWidth: "300px" }}
            >
              <Filter size={16} />
              <span className="truncate max-w-[180px]">
                {categoryFilter
                  ? categoryList.find((c) => c?._id === categoryFilter)?.name
                  : "All Categories"}
              </span>
              <ChevronDown size={18} />
            </button>

            {showCategoryDropdown && (
              <div
                className="absolute top-full mt-2 bg-white rounded-xl shadow-lg p-3 z-20 border"
                style={{
                  width: "max-content",
                  minWidth: "14rem",
                  maxWidth: "20rem",
                }}
              >
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search category..."
                  className="w-full px-3 py-2 mb-2 border rounded-lg"
                />

                <div
                  onClick={() => {
                    setCategoryFilter("");
                    setCategorySearch("");
                    setShowCategoryDropdown(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  All Categories
                </div>

                {categoryList
                  .filter((c) =>
                    c?.name?.toLowerCase().includes(categorySearch.toLowerCase())
                  )
                  .map((cat) => (
                    <div
                      key={cat?._id}
                      className="p-2 hover:bg-blue-100 rounded cursor-pointer whitespace-nowrap"
                      onClick={() => {
                        setCategoryFilter(cat._id);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

        {/* TABLE */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl shadow border border-gray-200">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
            <p className="text-gray-600">Loading technicians...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Profile</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Contact</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Category</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Registered</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-500 mb-2">
                          No technicians found
                        </h3>
                        <p className="text-gray-400">
                          {searchTerm || statusFilter !== "all" || categoryFilter
                            ? "Try adjusting your search or filters"
                            : "No technicians in the system"
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((tech) => (
                      <tr key={tech._id} className="hover:bg-gray-50 border-b">
                        <td className="px-6 py-4">
                          {tech.Photo ? (
                            <img
                              src={getPhotoUrl(tech.Photo)}
                              className="w-12 h-12 object-cover rounded-full border shadow"
                              onError={(e) => (e.target.style.display = "none")}
                              alt={tech.Name}
                              loading="lazy"
                            />
                          ) : (
                            <DefaultAvatar name={tech.Name} />
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium">{tech.Name}</td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{tech.Email}</div>
                          <div className="text-sm text-gray-500">{tech.MobileNumber}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            {tech.ServiceCategoryID?.name || "N/A"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 w-fit ${
                                tech.VerifyStatus === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : tech.VerifyStatus === "Approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {tech.VerifyStatus === "Pending" && <Clock size={14} />}
                              {tech.VerifyStatus === "Approved" && <CheckCircle size={14} />}
                              {tech.VerifyStatus === "Rejected" && <XCircle size={14} />}
                              {tech.VerifyStatus}
                            </span>

                            {tech.VerifyStatus === "Approved" && (
                              <span
                                className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 w-fit ${
                                  tech.ActiveStatus === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {tech.ActiveStatus === "Active" && <CheckCircle size={14} />}
                                {tech.ActiveStatus || "Not Active"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {new Date(tech.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {tech.VerifyStatus === "Pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(tech._id)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setShowRejectModal(tech._id)}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => openDetails(tech._id)}
                              className="px-3 py-1 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-900"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filtered.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowRejectModal(null);
            setRejectReason("");
          }
        }}>
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Reject Technician</h3>
            <p className="text-sm text-gray-600 mb-3">Provide reason (visible to technician)</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring"
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal - Keep existing functionality */}
      {showDetailsModal && selectedTechnician && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black bg-opacity-50 p-4 overflow-auto" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDetailsModal(false);
          }
        }}>
          <div className="bg-white rounded-lg w-full max-w-4xl p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedTechnician.Name}</h3>
                <p className="text-sm text-gray-500">Technician</p>
              </div>
              <div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 text-xl">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-center">
                  {selectedTechnician.Photo ? (
                    <img src={getPhotoUrl(selectedTechnician.Photo)} alt={selectedTechnician.Name} className="w-32 h-32 rounded-full object-cover mx-auto" />
                  ) : (
                    <DefaultAvatar name={selectedTechnician.Name} className="mx-auto" />
                  )}
                  <h4 className="mt-3 text-lg font-semibold">{selectedTechnician.Name}</h4>

                  <div className="mt-4 space-y-2 text-left">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Status</span><span>{selectedTechnician.VerifyStatus}</span></div>
                    {selectedTechnician.VerifyStatus === "Approved" && (
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Active</span><span>{selectedTechnician.ActiveStatus || "-"}</span></div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Documents</h5>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-600">Profile Photo</div>
                      {selectedTechnician.Photo ? (
                        <a className="text-blue-600 text-sm" href={getPhotoUrl(selectedTechnician.Photo)} target="_blank" rel="noreferrer">View</a>
                      ) : (
                        <div className="text-xs text-gray-500">Not provided</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">ID Proof</div>
                      {selectedTechnician.IDProof ? <a className="text-blue-600 text-sm" href={getPhotoUrl(selectedTechnician.IDProof)} target="_blank" rel="noreferrer">View</a> : <div className="text-xs text-gray-500">Not provided</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Personal Info</h5>
                    <div className="mt-2 space-y-2">
                      <div><div className="text-xs text-gray-500">Full name</div><div className="text-sm text-gray-900">{selectedTechnician.Name}</div></div>
                      <div><div className="text-xs text-gray-500">Email</div><div className="text-sm text-gray-900">{selectedTechnician.Email}</div></div>
                      <div><div className="text-xs text-gray-500">Mobile</div><div className="text-sm text-gray-900">{selectedTechnician.MobileNumber}</div></div>
                      <div><div className="text-xs text-gray-500">Address</div><div className="text-sm text-gray-900">{selectedTechnician.Address || "-"}</div></div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Professional</h5>
                    <div className="mt-2 space-y-2">
                      <div><div className="text-xs text-gray-500">Service Category</div><div className="text-sm text-gray-900">{selectedTechnician.ServiceCategoryID?.name || "-"}</div></div>
                      <div><div className="text-xs text-gray-500">Bank</div><div className="text-sm text-gray-900">{selectedTechnician.BankAccountNo || "-"}</div></div>
                      <div><div className="text-xs text-gray-500">IFSC</div><div className="text-sm text-gray-900">{selectedTechnician.IFSCCode || "-"}</div></div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h5 className="text-sm font-medium text-gray-700">Verification</h5>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">Mobile</div>
                        <div className="text-sm">{selectedTechnician.isMobileVerified ? "✅ Verified" : "❌ Pending"}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm">{selectedTechnician.isEmailVerified ? "✅ Verified" : "❌ Pending"}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">Registered</div>
                        <div className="text-sm">{new Date(selectedTechnician.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">Last updated</div>
                        <div className="text-sm">{new Date(selectedTechnician.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {selectedTechnician.VerifyStatus === "Pending" && (
                    <>
                      <button onClick={() => handleApprove(selectedTechnician._id)} className="px-4 py-2 bg-green-600 text-white rounded">Approve</button>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setShowRejectModal(selectedTechnician._id);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 border rounded">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianRequest;