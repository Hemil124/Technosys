import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  axios.defaults.withCredentials = true;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
      }
    } catch (error) {
      // Handle 401 errors gracefully (user not logged in)
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        setUserData(null);
      } else {
        // Only show other errors
        toast.error(error.response?.data?.message || "Authentication failed");
      }
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const getUserData = async () => {
    try {
      //   const { data } = await axios.get(`${backendUrl}/api/user/data`);
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
      });
      console.log("Full user data response:", data); // More detailed log
      if (data.success) {
        // Handle both UserData and userData properties
        const userData = data.UserData || data.userData;
        setUserData(userData);
        // Store user role in context or localStorage if needed
        // localStorage.setItem("userRole", userData.role || "technician");
        console.log("AppContext userData:", userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user data");
    }
  };

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

