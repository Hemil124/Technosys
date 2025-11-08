import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // ✅ Global Axios configuration
  axios.defaults.baseURL = backendUrl;
  axios.defaults.withCredentials = true; // send cookies with every request
  axios.defaults.headers.common["Content-Type"] = "application/json";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔐 Check Authentication Status
  const getAuthState = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth", {
        withCredentials: true, // explicitly ensure cookie is sent
      });

      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        setUserData(null);
      } else {
        console.error("Auth check failed:", error);
        toast.error(error.response?.data?.message || "Authentication failed");
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // 👤 Fetch User Details
  const getUserData = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        withCredentials: true,
      });

      if (data.success) {
        const user = data.UserData || data.userData;
        setUserData(user);
        if (import.meta.env.MODE === "development") {
          console.log("✅ User Data:", user);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("User data fetch failed:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user data");
    }
  };

  // 🚀 Run on first load
  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
    loadingUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
