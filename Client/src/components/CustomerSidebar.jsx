// src/components/CustomerNavbar.jsx
import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { User, History, Settings, LogOut, Menu, X } from "lucide-react";
import { assets } from "../assets/assets";

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const { userData, setIsLoggedIn, setUserData, backendUrl } =
    useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) setProfileMenuOpen(false);
      if (!e.target.closest(".mobile-menu")) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const logout = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate("/login-customer");
        toast.success("Logged out successfully");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full bg-gray-900 text-white fixed top-0 z-50 shadow-md">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left - Logo */}
            <div
              onClick={() => navigate("/customer/dashboard")}
              className="flex items-center cursor-pointer"
            >
              <img src={assets.navbarlogo} alt="Logo" className="w-10 h-10" />
            </div>

            {/* Middle - Booked Services */}
            <nav className="hidden md:flex space-x-1">
              <NavLink
                to="/customer/bookings"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <History size={18} className="mr-2" />
                Booked Services
              </NavLink>
            </nav>

            {/* Right - Profile Dropdown */}
            <div className="relative profile-menu">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                {userData?.name?.charAt(0).toUpperCase() || <User size={16} />}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                  <NavLink
                    to="/customer/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <User size={16} className="mr-3" />
                    Profile
                  </NavLink>
                  <NavLink
                    to="/customer/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Settings size={16} className="mr-3" />
                    Settings
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 border-t border-gray-100"
                  >
                    <LogOut size={16} className="mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 mobile-menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-gray-800 border-t border-gray-700">
              <div className="px-2 py-3 space-y-1">
                <NavLink
                  to="/customer/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  <History size={18} className="mr-3" />
                  Booked Services
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base text-gray-300 hover:bg-red-100 hover:text-red-600"
                >
                  <LogOut size={18} className="mr-3" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for fixed navbar height */}
      <div className="h-16"></div>
    </>
  );
};

export default CustomerNavbar;
