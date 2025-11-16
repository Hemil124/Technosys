import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Search, Filter, ChevronDown, Loader2 } from "lucide-react";
import { AppContext } from "../context/AppContext";

function AdminTechnicianList() {
  const { backendUrl } = useContext(AppContext);

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Category search
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;

  // Fetch technicians
  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/technicians`, {
        withCredentials: true,
      });
      if (data.success) setTechnicians(data.technicians);
      else toast.error("Failed to load technicians");
    } catch (err) {
      toast.error("Error loading technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
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
  const filtered = technicians.filter((t) => {
    const s = searchTerm.toLowerCase();

    const matches =
      t.Name.toLowerCase().includes(s) ||
      t.Email.toLowerCase().includes(s) ||
      t.MobileNumber.toLowerCase().includes(s) ||
      (t.ServiceCategoryID?.name || "").toLowerCase().includes(s);

    if (!matches) return false;

    if (statusFilter !== "all" && t.VerifyStatus !== statusFilter) return false;

    if (categoryFilter && t.ServiceCategoryID?._id !== categoryFilter)
      return false;

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [searchTerm, statusFilter, categoryFilter]);

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


  const categoryList = [
    ...new Map(
      technicians.map((t) => [t.ServiceCategoryID?._id, t.ServiceCategoryID])
    ).values(),
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 ">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Technician Directory</h2>
          <p className="text-gray-500">View and manage all registered technicians</p>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div className="bg-gray-50 p-4 rounded-xl  shadow-sm mb-6 flex flex-col md:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, mobile, email, category..."
              className="w-full pl-10 pr-4 py-2 rounded-lg  focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg  focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="px-4 py-2 rounded-lg bg-white flex items-center gap-2 hover:bg-gray-100 whitespace-nowrap"
              style={{ maxWidth: "300px" }}
            >
              <Filter size={16} />

              {/* Selected Category Name – fully visible */}
              <span className="truncate max-w-[180px]">
                {categoryFilter
                  ? categoryList.find((c) => c?._id === categoryFilter)?.name
                  : "Category"}
              </span>

              <ChevronDown size={18} />
            </button>

            {/* Dropdown */}
            {showCategoryDropdown && (
              <div
                className="absolute top-full mt-2 bg-white rounded-xl shadow-lg p-3 z-20 border"
                style={{
                  width: "max-content",        // 👈 dropdown auto-expands
                  minWidth: "14rem",           // 👈 minimum width
                  maxWidth: "20rem",           // 👈 avoid too large
                }}
              >
                {/* Search inside dropdown */}
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search category..."
                  className="w-full px-3 py-2 mb-2 border rounded-lg"
                />

                {/* All categories reset */}
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

                {/* Category List */}
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
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase">Profile</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase">Mobile</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase">Registered</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((tech) => (
                  <tr key={tech._id} className="hover:bg-gray-50 border-b">
                    <td className="px-6 py-4">
                      {tech.Photo ? (
                        <img
                          src={getPhotoUrl(tech.Photo)}
                          className="w-12 h-12 object-cover rounded-full border shadow"
                          onError={(e) => (e.target.style.display = "none")}
                          alt={tech.Name}
                        />
                      ) : (
                        <DefaultAvatar name={tech.Name} />
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium">{tech.Name}</td>
                    <td className="px-6 py-4">{tech.Email}</td>
                    <td className="px-6 py-4">{tech.MobileNumber}</td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                        {tech.ServiceCategoryID?.name || "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${tech.VerifyStatus === "Approved"
                            ? "bg-green-100 text-green-700"
                            : tech.VerifyStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {tech.VerifyStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {new Date(tech.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* PAGINATION */}
        {filtered.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>
    </div>
  );
}

export default AdminTechnicianList;
