// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Home } from './pages/Home';
// import { Login } from './pages/Login';
// import { EmailVerify } from './pages/EmailVerify';
// import { ResetPassword } from './pages/ResetPassword';
// import { ToastContainer } from 'react-toastify';
// // import 'react-toastify/dist/ReactToastify.css';

// const App = () => {
//   return (
//     <div>
//       <ToastContainer/>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/email-verify" element={<EmailVerify />} />
//        <Route path="/reset-password" element={<ResetPassword />} />
//       </Routes>
//     </div>
//   );
// };

// export default App;

import React, { useEffect, useContext } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";
import { Login } from "./pages/Login";
import { EmailVerify } from "./pages/EmailVerify";
import { ResetPassword } from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import { AppContext } from "./context/AppContext";
import "react-toastify/dist/ReactToastify.css";
import { Technicion } from "./pages/Technicion";
import { LoginCustomer } from "./pages/LoginCustomer";
import { Customer }from "./pages/Customer";
import { TempPage }from "./pages/TempPage";

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { isLoggedIn, loadingUser, userData } = useContext(AppContext);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }
  console.log(
    "ProtectedRoute - isLoggedIn:",
    isLoggedIn,
    "userData:",
    userData
  );

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // if (role && userData?.role !== role) {
  //   // Redirect to correct dashboard
  //   return <Navigate to={userData?.role === 'admin' ? '/admin' : '/technicion'} />;
  // }

  if (role && userData?.role !== role) {
    // Redirect to correct dashboard based on user role
    if (userData?.role === "admin") return <Navigate to="/admin" />;
    if (userData?.role === "technician") return <Navigate to="/technicion" />;
    if (userData?.role === "customer") return <Navigate to="/customer" />;

    return <Navigate to="/" />;
  }

  return children;
};

// Component to handle automatic redirects
const AuthRedirectHandler = () => {
  const { isLoggedIn, loadingUser, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log(
      "AuthRedirectHandler - isLoggedIn:",
      isLoggedIn,
      "loadingUser:",
      loadingUser,
      "pathname:",
      location.pathname
    );

    if (!loadingUser) {
      const publicRoutes = ["/login", "/login-customer","/reset-password", "/email-verify", "/"];

      // Redirect to login if not authenticated and trying to access protected routes
      if (!isLoggedIn && !publicRoutes.includes(location.pathname)) {
        console.log("Redirecting to login");
        navigate("/login");
      }

      //     // Redirect to home if already authenticated and trying to access auth pages
      //     if (
      //       isLoggedIn &&
      //       ["/login", "/reset-password", "/email-verify"].includes(
      //         location.pathname
      //       )
      //     ) {
      //       {
      //         if (userData?.role === "admin") {
      //           console.log("Redirecting to admin");
      //           navigate("/admin");
      //         } else {
      //           console.log("Redirecting to technicion");
      //           navigate("/technicion");
      //         }
      //       }
      //       // console.log("Redirecting to home");
      //       // navigate("/");
      //     }
      //   }
      // }, [isLoggedIn, loadingUser, navigate, location.pathname]);

      // Redirect to appropriate dashboard if already authenticated
      if (
        isLoggedIn && publicRoutes.includes(location.pathname)
      ) {
        if (userData?.role === "admin") {
          navigate("/admin");
        } else if (userData?.role === "technician") {
          navigate("/technicion");
        } else if (userData?.role === "customer") {
          console.log("Redirecting to customer");
          navigate("/customer");
        } else {
          navigate("/");
        }
      }
    }
  }, [isLoggedIn, loadingUser, navigate, location.pathname, userData]);

  return null;
};

const App = () => {
  const { isLoggedIn, userData, loadingUser } = useContext(AppContext);

  console.log(
    "App - isLoggedIn:",
    isLoggedIn,
    "userData:",
    userData,
    "loadingUser:",
    loadingUser
  );

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <AuthRedirectHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/admin" element={<Admin />} /> */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/technicion" element={<Technicion />} /> */}
        <Route
          path="/technicion"
          element={
            <ProtectedRoute role="technician">
              <Technicion />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <Customer />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/login-customer" element={<LoginCustomer />} />


        {/* temp */}
        <Route path="/temp" element={<TempPage />} />

        {/* Example of protected routes */}
        {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
