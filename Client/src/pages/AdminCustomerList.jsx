import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { Search, Filter, ChevronDown, User, Mail, Phone, MapPin, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";

function AdminCustomerList() {
  const { backendUrl } = useContext(AppContext);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Status search
  const [statusSearch, setStatusSearch] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/customers/all`, {
        withCredentials: true,
      });
      if (data.success) setCustomers(data.customers);
      else console.error("Failed to load customers");
    } catch (err) {
      console.error("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Helpers
  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads")) return backendUrl + path;
    return `${backendUrl}/uploads/photos/${path}`;
  };

  const DefaultAvatar = ({ name }) => (
    <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-400 text-white rounded-full flex items-center justify-center font-bold shadow">
      {name?.[0]?.toUpperCase()}
    </div>
  );

  // Filters
  const filtered = customers.filter((c) => {
    const s = searchTerm.toLowerCase();

    const matches =
      c.Name?.toLowerCase().includes(s) ||
      c.Email?.toLowerCase().includes(s) ||
      c.Mobile?.toLowerCase().includes(s) ||
      c.Address?.toLowerCase().includes(s);

    if (!matches) return false;

    if (statusFilter !== "all") {
      if (statusFilter === "complete" && !c.isProfileComplete) return false;
      if (statusFilter === "incomplete" && c.isProfileComplete) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, statusFilter]);

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
        {/* Prev */}
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg bg-gray-100 
          ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          Prev
        </button>

        {/* Pages */}
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

        {/* Next */}
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

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "complete", label: "Profile Complete" },
    { value: "incomplete", label: "Profile Incomplete" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Customer Directory</h2>
          <p className="text-gray-500">View and manage all registered customers</p>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, mobile, address..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="px-4 py-2 rounded-lg bg-white flex items-center gap-2 hover:bg-gray-100 whitespace-nowrap"
              style={{ maxWidth: "300px" }}
            >
              <Filter size={16} />

              {/* Selected Status Name */}
              <span className="truncate max-w-[180px]">
                {statusFilter !== "all" 
                  ? statusOptions.find(s => s.value === statusFilter)?.label
                  : "All Status"
                }
              </span>

              <ChevronDown size={18} />
            </button>

            {/* Dropdown */}
            {showStatusDropdown && (
              <div
                className="absolute top-full mt-2 bg-white rounded-xl shadow-lg p-3 z-20 border"
                style={{
                  width: "max-content",
                  minWidth: "14rem",
                  maxWidth: "20rem",
                }}
              >
                {/* Search inside dropdown */}
                <input
                  type="text"
                  value={statusSearch}
                  onChange={(e) => setStatusSearch(e.target.value)}
                  placeholder="Search status..."
                  className="w-full px-3 py-2 mb-2 border rounded-lg"
                />

                {/* Status List */}
                {statusOptions
                  .filter(option =>
                    option.label.toLowerCase().includes(statusSearch.toLowerCase())
                  )
                  .map((option) => (
                    <div
                      key={option.value}
                      className="p-2 hover:bg-blue-100 rounded cursor-pointer whitespace-nowrap"
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowStatusDropdown(false);
                        setStatusSearch("");
                      }}
                    >
                      {option.label}
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
            <p className="text-gray-600">Loading customers...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Profile</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Mobile</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Address</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase">Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-500 mb-2">
                          No customers found
                        </h3>
                        <p className="text-gray-400">
                          {searchTerm || statusFilter !== "all" 
                            ? "Try adjusting your search or filters" 
                            : "No customers in the system"
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50 border-b">
                        <td className="px-6 py-4">
                          {customer.Photo ? (
                            <img
                              src={getPhotoUrl(customer.Photo)}
                              className="w-12 h-12 object-cover rounded-full border shadow"
                              onError={(e) => (e.target.style.display = "none")}
                              alt={customer.Name}
                            />
                          ) : (
                            <DefaultAvatar name={customer.Name} />
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium">{customer.Name || "—"}</td>
                        <td className="px-6 py-4">{customer.Email || "—"}</td>
                        <td className="px-6 py-4">{customer.Mobile || "—"}</td>

                        <td className="px-6 py-4 max-w-xs">
                          <span className="text-sm text-gray-600 line-clamp-2">
                            {customer.Address || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 w-fit ${
                              customer.isProfileComplete
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {customer.isProfileComplete ? (
                              <>
                                <CheckCircle size={14} />
                                Complete
                              </>
                            ) : (
                              <>
                                <Clock size={14} />
                                Incomplete
                              </>
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {new Date(customer.createdAt).toLocaleDateString()}
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
    </div>
  );
}

export default AdminCustomerList;