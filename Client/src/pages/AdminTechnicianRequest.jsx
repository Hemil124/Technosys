// TechnicianRequest.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Grid3X3,
  Hourglass,
  ToggleRight,
  ToggleLeft,
  Loader2,
  Folder,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

const TechnicianRequest = () => {
  const { backendUrl, userData } = useContext(AppContext);

  // data
  const [allTechs, setAllTechs] = useState([]); // full list (fetched once)
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | Pending | Approved | Rejected
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modals & selections
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // derived stats (from allTechs)
  const stats = useMemo(() => {
    const total = allTechs.length;
    const pending = allTechs.filter((t) => t.VerifyStatus === "Pending")
      .length;
    const approved = allTechs.filter((t) => t.VerifyStatus === "Approved")
      .length;
    const rejected = allTechs.filter((t) => t.VerifyStatus === "Rejected")
      .length;
    return { total, pending, approved, rejected };
  }, [allTechs]);

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
          // ensure array
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once

  // Filtered list based on `filter`
  const filtered = useMemo(() => {
    if (filter === "all") return allTechs;
    return allTechs.filter((t) => t.VerifyStatus === filter);
  }, [allTechs, filter]);

  // Pagination calculations
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  useEffect(() => {
    // clamp page when pageSize or filtered changes
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Utility helpers
  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `${backendUrl}${path}`;
    return `${backendUrl}/uploads/photos/${path}`;
  };

  const DefaultAvatar = ({ name, className = "" }) => (
    <div
      className={`bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-semibold ${className}`}
      style={{ width: 48, height: 48 }}
    >
      {name?.charAt(0)?.toUpperCase() || "T"}
    </div>
  );

  // Actions: Approve / Reject
  const handleApprove = async (id) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/admin/technicians/${id}/approve`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Technician approved");
        // update local list
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
        // update local list
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

  // open details modal (try to get data from allTechs)
  const openDetails = (id) => {
    const t = allTechs.find((x) => x._id === id);
    setSelectedTechnician(t || null);
    setShowDetailsModal(true);
  };

  // UI: subtle glows/pulse classes
  const glowBadge = "rounded-full p-3 ";
  const pulseText = "animate-pulse";

  // security: only admin
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Technician Management</h1>
        <p className="text-gray-600 mb-6">Manage technician registrations and account status</p>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className={`${glowBadge}  text-blue-600`}>
              <Grid3X3 size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-extrabold text-blue-700">{stats.total}</div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className={`${glowBadge}  text-yellow-600`}>
              <Hourglass size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-extrabold text-yellow-600">{stats.pending}</div>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className={`${glowBadge}  text-green-600`}>
              <ToggleRight size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Approved</div>
              <div className="text-2xl font-extrabold text-green-600">{stats.approved}</div>
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className={`${glowBadge}  text-red-600`}>
              <ToggleLeft size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Rejected</div>
              <div className="text-2xl font-extrabold text-red-600">{stats.rejected}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {[
            { key: "all", label: "All", count: stats.total },
            { key: "Pending", label: "Pending", count: stats.pending },
            { key: "Approved", label: "Approved", count: stats.approved },
            { key: "Rejected", label: "Rejected", count: stats.rejected },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => {
                setFilter(b.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === b.key ? "bg-blue-600 text-white" : "bg-white border"
                }`}
            >
              {b.label} ({b.count})
            </button>
          ))}
        </div>

        {/* List + Table header */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto" />
              <p className="mt-3 text-gray-600">Loading technicians...</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="p-10 text-center">
              <Folder className="h-12 w-12 text-gray-300 mx-auto" />
              <div className="mt-4 text-gray-600">No technicians found.</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginated.map((tech) => (
                      <tr key={tech._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {tech.Photo ? (
                                <img
                                  src={getPhotoUrl(tech.Photo)}
                                  alt={tech.Name}
                                  className="h-12 w-12 rounded-full object-cover border"
                                  onError={(e) => (e.target.style.display = "none")}
                                />
                              ) : (
                                <DefaultAvatar name={tech.Name} />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{tech.Name}</div>
                              <div className="text-xs text-gray-400">ID: {tech._id?.toString().slice(-6)}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{tech.Email}</div>
                          <div className="text-sm text-gray-500">{tech.MobileNumber}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{tech.ServiceCategoryID?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">Bank: {tech.BankAccountNo?.slice(-4) || "-"}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">

                            {/* Main Verify Status Badge */}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${tech.VerifyStatus === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : tech.VerifyStatus === "Approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                            >
                              {tech.VerifyStatus}
                            </span>

                            {/* Active Status Badge (only when Approved) */}
                            {tech.VerifyStatus === "Approved" && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium 
          ${tech.ActiveStatus === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                  }
                                `}
                              >
                                {tech.ActiveStatus || "Not Active"}
                              </span>
                            )}
                          </div>
                        </td>


                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{formatDate(tech.createdAt)}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center gap-2">

                            {tech.VerifyStatus === "Pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(tech._id)}
                                  className="px-4 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 shadow-sm"
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() => setShowRejectModal(tech._id)}
                                  className="px-4 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 shadow-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            <button
                              onClick={() => openDetails(tech._id)}
                              className="px-14 py-1.5 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-900 shadow-sm"
                            >
                              View
                            </button>

                          </div>
                        </td>



                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


              {/* SMART PAGINATION */}
              <div className="flex justify-center items-center gap-2 py-6 select-none">

                {/* PREV BUTTON */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg border text-sm transition 
      ${page === 1
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-100 shadow-sm"}`}
                >
                  Prev
                </button>

                {/* PAGES */}
                {(() => {
                  const pages = [];
                  const total = totalPages;

                  // Always show page 1
                  pages.push(1);

                  // Left dots
                  if (page > 3) pages.push("left");

                  // Middle pages
                  for (let p = page - 1; p <= page + 1; p++) {
                    if (p > 1 && p < total) pages.push(p);
                  }

                  // Right dots
                  if (page < total - 2) pages.push("right");

                  // Last page
                  if (total > 1) pages.push(total);

                  return pages.map((p, i) =>
                    p === "left" || p === "right" ? (
                      <span key={i} className="px-3 py-2 text-gray-500">…</span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm transition
            ${p === page
                            ? "bg-gray-900 text-white shadow"
                            : "hover:bg-gray-100"}`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                {/* NEXT BUTTON */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg border text-sm transition 
      ${page === totalPages
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-100 shadow-sm"}`}
                >
                  Next
                </button>

              </div>



            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
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

      {/* Details Modal */}
      {showDetailsModal && selectedTechnician && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black bg-opacity-40 p-4 overflow-auto">
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
                  <p className="text-sm text-gray-500">ID: {selectedTechnician._id?.slice(-6)}</p>

                  <div className="mt-4 space-y-2 text-left">
                    <div className="flex justify-between"><span className="text-sm text-gray-600">Status</span><span>{selectedTechnician.VerifyStatus}</span></div>
                    {selectedTechnician.VerifyStatus === "Approved" && (
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Active</span><span>{selectedTechnician.ActiveStatus || "-"}</span></div>
                    )}
                  </div>
                </div>

                {/* documents */}
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
                        <div className="text-sm">{formatDate(selectedTechnician.createdAt)}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">Last updated</div>
                        <div className="text-sm">{formatDate(selectedTechnician.updatedAt)}</div>
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
