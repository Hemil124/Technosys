import React, { useContext, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, History, Menu, X, ChevronDown } from "lucide-react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const backendUrl = "http://localhost:4000";

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const { userData, setIsLoggedIn, setUserData } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef();
  const mobileMenuRef = useRef();

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}

    setIsLoggedIn(false);
    setUserData(null);
    setMobileMenuOpen(false);
    setProfileOpen(false);
    navigate("/login-customer");
  };

  // --- NAVIGATION WITH MENU CLOSE ---
  const handleNavigation = (path) => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  // --- CLOSE DROPDOWNS ON OUTSIDE CLICK ---
  useEffect(() => {
    const handler = (e) => {
      // Close profile dropdown
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      
      // Close mobile menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  // --- CLOSE MOBILE MENU WHEN RESIZING TO DESKTOP ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">

            {/* LOGO */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavigation("/customer/dashboard")}
            >
              <img
                src={assets.navbarlogo}
                className="w-10 h-10 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                alt="Technosys Logo"
              />
              <div className="hidden md:block">
                <span className="text-lg font-semibold text-gray-900">Technosys</span>
                <div className="text-xs text-gray-500">Home Services</div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

              {/* DESKTOP PROFILE */}
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in fade-in-0 zoom-in-95">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">
                        {userData?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {userData?.email || "user@example.com"}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => handleNavigation("/customer/profile")}
                        className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 group"
                      >
                        <User size={18} className="text-gray-400 group-hover:text-blue-600" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => handleNavigation("/customer/bookings")}
                        className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 group"
                      >
                        <History size={18} className="text-gray-400 group-hover:text-blue-600" />
                        <span>My Bookings</span>
                      </button>

                      <button
                        onClick={() => handleNavigation("/customer/settings")}
                        className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 group"
                      >
                        <Settings size={18} className="text-gray-400 group-hover:text-blue-600" />
                        <span>Settings</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={logout}
                        className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-3 group"
                      >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE MENU BUTTON */}
              <button 
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X size={24} className="text-gray-700" />
                ) : (
                  <Menu size={24} className="text-gray-700" />
                )}
              </button>

            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden absolute top-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top-5 duration-200"
          >
            {/* User Info */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <p className="font-medium text-gray-900">
                {userData?.name || "User"}
              </p>
              <p className="text-sm text-gray-500">
                {userData?.email || "user@example.com"}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleNavigation("/customer/profile")}
                className="w-full px-6 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-4 border-b border-gray-100"
              >
                <User size={20} className="text-gray-400" />
                <span className="font-medium">Profile</span>
              </button>

              <button
                onClick={() => handleNavigation("/customer/bookings")}
                className="w-full px-6 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-4 border-b border-gray-100"
              >
                <History size={20} className="text-gray-400" />
                <span className="font-medium">My Bookings</span>
              </button>

              <button
                onClick={() => handleNavigation("/customer/settings")}
                className="w-full px-6 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-4 border-b border-gray-100"
              >
                <Settings size={20} className="text-gray-400" />
                <span className="font-medium">Settings</span>
              </button>

              <button
                onClick={logout}
                className="w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-4"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-in fade-in-0 duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="h-20" />
    </>
  );
};

export default CustomerNavbar;