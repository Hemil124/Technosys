import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CalendarCheck,
  Clock,
  Star,
  Layers,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { assets } from "../assets/assets";

const TechnicianSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setIsLoggedIn, setUserData, backendUrl } =
    useContext(AppContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [coinBalance, setCoinBalance] = useState(null);

  // Fetch technician wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (!userData) return;
        const res = await axios.get(`${backendUrl}/api/user/wallet`, { withCredentials: true });
        if (res.data && res.data.success) {
          setCoinBalance(res.data.data?.BalanceCoins ?? 0);
        }
      } catch (err) {
        console.error('Failed to fetch wallet', err?.response?.data || err.message);
      }
    };

    fetchWallet();
  }, [backendUrl, userData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) setProfileMenuOpen(false);
      if (!e.target.closest(".mobile-menu")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate("/login");
        toast.success("Logged out successfully");
      } else toast.error(data.message || "Logout failed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  // Technician nav items
  const navItems = [
    { name: "Availability", path: "/technician/availability", icon: <Clock size={18} /> },
    { name: "Bookings", path: "/technician/bookings", icon: <CalendarCheck size={18} /> },
    { name: "Subscription", path: "/technician/subscription", icon: <Layers size={18} /> },
    { name: "Feedback", path: "/technician/feedbacks", icon: <Star size={18} /> },
  ];

  return (
    <>
      {/* Technician Navbar */}
      <div className="w-full bg-gray-900 text-white fixed top-0 z-50 shadow-md">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - Logo & Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div
                onClick={() => navigate("/technician/dashboard")}
                className="flex items-center cursor-pointer mr-8"
              >
                <img src={assets.navbarlogo} alt="Logo" className="w-10 h-10" />
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right - Profile menu */}
            <div className="flex items-center space-x-3">
              {/* Coin balance badge (shown before profile) */}
              <div className="hidden sm:flex items-center px-3 py-1 rounded-md bg-white text-gray-900" title="Coin Balance">
                <div style={{ fontWeight: 600, marginRight: 8 }}>{coinBalance ?? 0}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>coins</div>
              </div>
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-800"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      menuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>

              {/* Profile menu */}
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
                      to="/technician/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <User size={16} className="mr-3" />
                      Profile
                    </NavLink>
                    <NavLink
                      to="/technician/settings"
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
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden bg-gray-800 border-t border-gray-700 mobile-menu">
              <div className="px-2 py-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-base font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default TechnicianSidebar;
