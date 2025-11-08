import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  Users,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);

  // Logout function
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate("/login");
        toast.success("Logged out successfully");
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  // Sidebar menu items
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Technicians", path: "/admin/technicians", icon: <Wrench size={18} /> },
    { name: "Customers", path: "/admin/customers", icon: <Users size={18} /> },
    { name: "Categories", path: "/admin/categories", icon: <ClipboardList size={18} /> },
    { name: "Feedbacks", path: "/admin/feedbacks", icon: <MessageSquare size={18} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-gray-100 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-5 text-2xl font-bold border-b border-gray-700 text-center tracking-wide">
        Technosys Admin
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 mt-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-gray-800 hover:text-blue-400 text-gray-300"
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}

        {/* Logout under Settings */}
        <button
          onClick={logout}
          className="flex items-center w-full px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all duration-150"
        >
          <span className="mr-3">
            <LogOut size={18} />
          </span>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
