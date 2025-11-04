// import React, { useState, useRef, useContext } from "react";
// import axios from "axios";
// import { assets } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { AppContext } from "../context/AppContext";
// import { toast } from "react-toastify";

// export const ResetPassword = () => {
//   const { backendUrl: contextBackendUrl } = useContext(AppContext);
//   const backendUrl = contextBackendUrl || "http://localhost:4000";
//   axios.defaults.withCredentials = true;

//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [isEmailsent, setISEmailsent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [isOtpSubmited, setIsOtpSubmit] = useState(false);

//   const inputRefs = useRef([]);

//   // Handle OTP input
//   const handleInput = (e, index) => {
//     const val = e.target.value.replace(/\D/g, "").slice(-1);
//     e.target.value = val;
//     if (val && index < inputRefs.current.length - 1) {
//       inputRefs.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && e.target.value === "" && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };

//   // Email submit
//   const handleEmailSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // const { data } = await axios.post(
//       //   `${backendUrl}/api/auth/send-reset-otp`,
//       //   { email }
//       // );
//       const { data } = await axios.post(
//   `${backendUrl}/api/auth/reset-password`,
//   {
//     email,
//     otp,
//     newPassword, // ✅ Correct key name
//   }
// );
//       data.success ? toast.success(data.message) : toast.error(data.message);
//       if (data.success) setISEmailsent(true);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong");
//     }
//   };

//   // OTP submit
//   const onSubmitOTP = (e) => {
//     e.preventDefault();
//     const otpValue = inputRefs.current.map((input) => input.value).join("");
//     if (otpValue.length !== 6) {
//       toast.error("Please enter the full 6-digit OTP");
//       return;
//     }
//     setOtp(otpValue); // Store OTP for next step
//     setIsOtpSubmit(true);
//   };

//   // New password submit
//   const onSubmitNewPassword = async (e) => {
//     e.preventDefault();
//     if (!email || !otp || !newPassword) {
//       toast.error("Email, OTP, and new password are required");
//       return;
//     }
//     try {
//       const { data } = await axios.post(
//         `${backendUrl}/api/auth/reset-password`,
//         {
//           email,
//           otp,
//           newPassword, // ✅ Correct key name
//         }
//       );
//       data.success ? toast.success(data.message) : toast.error(data.message);
//       if (data.success) navigate("/login");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400 relative">
//       <img
//         onClick={() => navigate("/")}
//         src={assets.navbarlogo}
//         alt="Logo"
//         className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
//       />

//       {/* Email form */}
//       {!isEmailsent && (
//         <form
//           onSubmit={handleEmailSubmit}
//           className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
//         >
//           <h1 className="text-white text-2xl font-semibold text-center mb-4">
//             Email Verify
//           </h1>
//           <p className="text-center mb-6 text-indigo-300">
//             Enter your registered email address.
//           </p>
//           <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
//             <img src={assets.mail_icon} alt="" className="w-3 h-3" />
//             <input
//               type="email"
//               placeholder="Email id"
//               className="bg-transparent outline-none text-white"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3"
//           >
//             Submit
//           </button>
//         </form>
//       )}

//       {/* OTP form */}
//       {!isOtpSubmited && isEmailsent && (
//         <form
//           onSubmit={onSubmitOTP}
//           className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
//         >
//           <h1 className="text-white text-2xl font-semibold text-center mb-4">
//             Password Reset OTP
//           </h1>
//           <p className="text-center mb-6 text-indigo-300">
//             Enter the 6-digit code sent to your email id.
//           </p>
//           <div className="flex justify-between mb-8">
//             {Array.from({ length: 6 }).map((_, index) => (
//               <input
//                 key={index}
//                 type="text"
//                 inputMode="numeric"
//                 pattern="[0-9]*"
//                 maxLength={1}
//                 required
//                 className="w-12 h-12 bg-[#333A5c] text-center text-xl rounded-md text-white"
//                 ref={(el) => (inputRefs.current[index] = el)}
//                 onInput={(e) => handleInput(e, index)}
//                 onKeyDown={(e) => handleKeyDown(e, index)}
//               />
//             ))}
//           </div>
//           <button
//             type="submit"
//             className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full"
//           >
//             Verify email
//           </button>
//         </form>
//       )}

//       {/* New password form */}
//       {isOtpSubmited && isEmailsent && (
//         <form
//           onSubmit={onSubmitNewPassword}
//           className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
//         >
//           <h1 className="text-white text-2xl font-semibold text-center mb-4">
//             New Password
//           </h1>
//           <p className="text-center mb-6 text-indigo-300">
//             Enter your new password.
//           </p>
//           <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
//             <img src={assets.lock_icon} alt="" className="w-3 h-3" />
//             <input
//               type="password"
//               placeholder="New Password"
//               className="bg-transparent outline-none text-white"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3"
//           >
//             Submit
//           </button>
//         </form>
//       )}
//     </div>
//   );
// };

import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

export const ResetPassword = () => {
  const { backendUrl: contextBackendUrl } = useContext(AppContext);
  const backendUrl = contextBackendUrl || "http://localhost:4000";
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailsent, setISEmailsent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmited, setIsOtpSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  // Handle OTP input
  const handleInput = (e, index) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    e.target.value = val;
    if (val && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Email submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      data.success ? toast.success(data.message) : toast.error(data.message);
      if (data.success) setISEmailsent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // OTP submit
  const onSubmitOTP = (e) => {
    e.preventDefault();
    const otpValue = inputRefs.current.map((input) => input.value).join('');
    if (otpValue.length !== 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }
    setOtp(otpValue);
    setIsOtpSubmit(true);
  };

  // New password submit
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400 relative">
      <img
        onClick={() => navigate('/')}
        src={assets.navbarlogo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer hover:scale-105 transition-transform"
      />

      {/* Email form */}
      {!isEmailsent && (
        <form
          onSubmit={handleEmailSubmit}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter your registered email address to receive a reset OTP.</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-4 h-4" />
            <input
              type="email"
              placeholder="Email address"
              className="bg-transparent outline-none text-white w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 hover:from-indigo-600 hover:to-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>
      )}

      {/* OTP form */}
      {!isOtpSubmited && isEmailsent && (
        <form
          onSubmit={onSubmitOTP}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Enter OTP</h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to <span className="font-medium">{email}</span>
          </p>
          <div className="flex justify-between mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                required
                className="w-12 h-12 bg-[#333A5c] text-center text-xl rounded-md text-white border border-gray-600 focus:border-indigo-400 focus:outline-none"
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={loading}
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:from-indigo-600 hover:to-indigo-800 transition-colors"
          >
            Verify OTP
          </button>
        </form>
      )}

      {/* New password form */}
      {isOtpSubmited && isEmailsent && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">Set New Password</h1>
          <p className="text-center mb-6 text-indigo-300">Create a new password for your account.</p>
          
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-4 h-4" />
            <input
              type="password"
              placeholder="New Password"
              className="bg-transparent outline-none text-white w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <div className="mb-6 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-4 h-4" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="bg-transparent outline-none text-white w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:from-indigo-600 hover:to-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};