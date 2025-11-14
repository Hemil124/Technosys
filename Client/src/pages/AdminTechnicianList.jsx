import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function AdminTechnicianList() {
  const { backendUrl } = useContext(AppContext);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Get correct photo URL
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;

    if (photoPath.startsWith("http")) return photoPath;

    if (photoPath.startsWith("/uploads")) {
      return `${backendUrl}${photoPath}`;
    }

    return `${backendUrl}/uploads/photos/${photoPath}`;
  };

  // ⭐ Fallback Avatar
  const DefaultAvatar = ({ name }) => (
    <div className="w-12 h-12 bg-blue-100 border border-blue-200 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
      {name?.charAt(0)?.toUpperCase() || "T"}
    </div>
  );

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/technicians`, {
        withCredentials: true,
      });

      if (data.success) {
        setTechnicians(data.technicians);
      } else {
        toast.error(data.message || "Failed to fetch technicians");
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      toast.error(error.response?.data?.message || "Error fetching technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          👨‍🔧 Technician List
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading technicians...</div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No technicians found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Registered</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {technicians.map((tech) => (
                  <tr key={tech._id} className="hover:bg-blue-50 transition">
                    
                    {/* PROFILE IMAGE WITH FALLBACK */}
                    <td className="px-6 py-4">
                      {tech.Photo ? (
                        <img
                          src={getPhotoUrl(tech.Photo)}
                          alt="Profile"
                          className="w-12 h-12 rounded-full border shadow-sm object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = e.target.parentElement.querySelector(".fallback-avatar");
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}

                      {/* Fallback Avatar */}
                      <div
                        className="fallback-avatar"
                        style={{ display: tech.Photo ? "none" : "flex" }}
                      >
                        <DefaultAvatar name={tech.Name} />
                      </div>
                    </td>

                    {/* NAME */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {tech.Name}
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 text-sm text-gray-700">{tech.Email}</td>

                    {/* MOBILE */}
                    <td className="px-6 py-4 text-sm text-gray-700">{tech.MobileNumber}</td>

                    {/* CATEGORY */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {tech.ServiceCategoryID?.name || "N/A"}
                    </td>

                    {/* STATUS BADGE */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full 
                          ${
                            tech.VerifyStatus === "Approved"
                              ? "bg-green-100 text-green-700"
                              : tech.VerifyStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {tech.VerifyStatus}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tech.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTechnicianList;
