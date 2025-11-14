import React, { useContext, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, History, Menu, X } from "lucide-react";
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

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}

    setIsLoggedIn(false);
    setUserData(null);
    setMobileMenuOpen(false);
    navigate("/login-customer");
  };

  // --- CLOSE MOBILE + NAVIGATE IMMEDIATELY (NO DELAY) ---
  const goTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // --- CLOSE PROFILE ON OUTSIDE CLICK ---
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">

            {/* LOGO */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => goTo("/customer/dashboard")}
            >
              <img
                src={assets.navbarlogo}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="hidden md:block">
                <span className="text-lg font-semibold">Technosys</span>
                <div className="text-xs text-gray-500">Home Services</div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

              {/* MOBILE MENU BUTTON */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>

              {/* DESKTOP PROFILE */}
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold"
                >
                  {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border rounded-lg shadow-md text-gray-700">

                    <div
                      onClick={() => goTo("/customer/profile")}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <User size={16} /> Profile
                    </div>

                    <div
                      onClick={() => goTo("/customer/bookings")}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <History size={16} /> My Bookings
                    </div>

                    <div
                      onClick={() => goTo("/customer/settings")}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <Settings size={16} /> Settings
                    </div>

                    <div
                      onClick={logout}
                      className="px-4 py-3 hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-100 border-t shadow-inner py-2 animate-fadeIn">

            <div
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/customer/profile");
              }}
              className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200"
            >
              <User size={18} /> Profile
            </div>

            <div
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/customer/bookings");
              }}
              className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200"
            >
              <History size={18} /> My Bookings
            </div>

            <div
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/customer/settings");
              }}
              className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200"
            >
              <Settings size={18} /> Settings
            </div>

            <div
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-red-100 text-red-600"
            >
              <LogOut size={18} /> Logout
            </div>

          </div>
        )}
      </header>

      <div className="h-20" />
    </>
  );
};

export default CustomerNavbar;
