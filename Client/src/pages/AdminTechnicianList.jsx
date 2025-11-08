import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function AdminTechnicianList() {
  const { backendUrl } = useContext(AppContext);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all technicians
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
      toast.error(
        error.response?.data?.message || "Error fetching technicians"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Technician List
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading technicians...
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No technicians found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered On
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {technicians.map((tech) => (
                  <tr key={tech._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tech.Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tech.Email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tech.MobileNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tech.ServiceCategoryID || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tech.VerifyStatus === "Approved"
                            ? "bg-green-100 text-green-700"
                            : tech.VerifyStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tech.VerifyStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
