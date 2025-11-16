import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { Loader2, Search, User, Mail, Phone, MapPin, Calendar, CheckCircle, Clock } from "lucide-react";

function AdminCustomerList() {
  const { backendUrl } = useContext(AppContext);

  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // search
  const [query, setQuery] = useState("");

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/customers/all`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setAllCustomers(res.data.customers);
          setCustomers(res.data.customers);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Client-side search
  useEffect(() => {
    const q = query.toLowerCase();
    let filtered = allCustomers;

    if (q.trim().length > 0) {
      filtered = allCustomers.filter(
        (c) =>
          c.Name?.toLowerCase().includes(q) ||
          c.Email?.toLowerCase().includes(q) ||
          c.Mobile?.toLowerCase().includes(q)
      );
    }

    setCustomers(filtered);
    setPage(1);
  }, [query, allCustomers]);

  const totalCount = customers.length;

  const paginated = customers.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const Avatar = ({ name }) => (
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
      {name?.[0]?.toUpperCase()}
    </div>
  );

  const Pagination = ({ page, totalPages, onChange }) => (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6 px-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
      >
        <span>Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onChange(pageNum)}
              className={`min-w-[40px] h-10 border rounded-lg transition-all duration-200 ${
                page === pageNum 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg" 
                  : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
      >
        <span>Next</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Customer Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and view all customer accounts
          </p>
        </div>

        {/* Search and Stats Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-auto flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            
            <div className="flex items-center gap-4 text-sm sm:text-base">
              <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                <span className="text-blue-600 font-semibold">{totalCount}</span>
                <span className="text-gray-600 ml-1">customers</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200">
            <Loader2 className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">Loading customers...</p>
          </div>
        ) : (
          <>
            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                <div className="lg:col-span-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Customer</span>
                </div>
                <div className="lg:col-span-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Contact Information</span>
                </div>
                <div className="lg:col-span-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </div>
                <div className="lg:col-span-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <div className="lg:col-span-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Registered</span>
                </div>
              </div>

              {/* Mobile Header */}
              <div className="lg:hidden px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700 text-sm">
                  Customer List ({totalCount})
                </h3>
              </div>

              {/* Customer Rows */}
              {paginated.length === 0 ? (
                <div className="py-12 sm:py-16 text-center">
                  <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-500 mb-2">
                    No customers found
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {query ? "Try adjusting your search terms" : "No customers in the system"}
                  </p>
                </div>
              ) : (
                paginated.map((c) => (
                  <div
                    key={c._id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200 group"
                  >
                    {/* Customer Info */}
                    <div className="lg:col-span-3 flex items-start gap-3">
                      {c.Photo ? (
                        <img
                          src={backendUrl + c.Photo}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-blue-100 transition-colors duration-200"
                          alt={c.Name}
                        />
                      ) : (
                        <Avatar name={c.Name} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {c.Name || "—"}
                        </div>
                        {/* <div className="text-xs text-gray-500 mt-1">
                          ID: {c._id?.slice(-8) || "—"}
                        </div> */}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-3 space-y-2">
                      <div className="lg:hidden text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Contact
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="text-sm text-gray-900 truncate min-w-0">
                          {c.Email || "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          {c.Mobile || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="lg:col-span-2">
                      <div className="lg:hidden text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Address
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {c.Address || "—"}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                      <div className="lg:hidden text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Status
                      </div>
                      {c.isProfileComplete ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                          <Clock className="h-3 w-3" />
                          Incomplete
                        </span>
                      )}
                    </div>

                    {/* Registration Date */}
                    <div className="lg:col-span-2">
                      <div className="lg:hidden text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Registered
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination */}
              {paginated.length > 0 && (
                <div className="bg-white border-t border-gray-200">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminCustomerList;