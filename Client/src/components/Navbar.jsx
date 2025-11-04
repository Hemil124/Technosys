// // import React, { useContext } from "react";
// // import { assets } from "../assets/assets";
// // import { useNavigate } from "react-router-dom";
// // import { AppContext } from "../context/AppContext";
// // import axios from "axios";
// // import { toast } from "react-toastify";

// // export const Navbar = () => {
// //   const navigate = useNavigate();
// //   const { isLoggedIn, userData, setIsLoggedIn, setUserData, backendUrl } =
// //     useContext(AppContext);

// //   // Logout function
// //   const logout = async () => {
// //     try {
// //       axios.defaults.withCredentials = true;
// //       const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
// //       if (data?.success) {
// //         setIsLoggedIn(false);
// //         setUserData(null);
// //         navigate("/");
// //       } else {
// //         toast.error(data?.message || "Logout failed");
// //       }
// //     } catch (error) {
// //       toast.error(
// //         error.response?.data?.message || error.message || "Something went wrong"
// //       );
// //     }
// //   };

// //   return (
// //     <div className="w-full flex justify-between items-center p-2 sm:p-3 sm:px-24 fixed top-0 bg-white shadow-md z-50">
// //       {/* Logo */}
// //       <img
// //         src={assets.navbarlogo}
// //         alt="Logo"
// //         className="w-12 sm:w-16 cursor-pointer"
// //         onClick={() => navigate("/")}
// //       />

// //       {/* Conditional rendering based on login */}
// //       {isLoggedIn && userData ? (
// //         <div className="relative group cursor-pointer">
// //           {userData.avatar ? (
// //             // Show avatar if Google provided it
// //             <img
// //               src={userData.avatar}
// //               alt="profile"
// //               className="w-10 h-10 rounded-full object-cover border border-gray-300
// //                          transition-transform duration-300 ease-in-out group-hover:scale-110
// //                          group-hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]"
// //               title={userData.name}
// //               onClick={() => navigate("/profile")}
// //             />
// //           ) : (
// //             // Fallback: First letter of name
// //             <div
// //               className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold text-lg
// //                          transition-transform duration-300 ease-in-out group-hover:scale-110
// //                          group-hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]"
// //               title={userData.name}
// //               onClick={() => navigate("/profile")}
// //             >
// //               {userData.name?.charAt(0).toUpperCase()}
// //             </div>
// //           )}

// //           {/* Dropdown menu */}
// //           <div
// //             className="pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto
// //                        group-hover:translate-y-0 transition-all duration-300 absolute top-full right-0 mt-2 w-44 bg-white shadow-lg rounded-lg
// //                        ring-1 ring-black ring-opacity-5 z-10"
// //           >
// //             <ul className="py-2">
// //               <li onClick={logout}>
// //                 <button
// //                   className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors
// //                              rounded-md hover:shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]"
// //                 >
// //                   <svg
// //                     xmlns="http://www.w3.org/2000/svg"
// //                     className="h-5 w-5 text-red-600"
// //                     fill="none"
// //                     viewBox="0 0 24 24"
// //                     stroke="currentColor"
// //                   >
// //                     <path
// //                       strokeLinecap="round"
// //                       strokeLinejoin="round"
// //                       strokeWidth={2}
// //                       d="M17 16l4-4m0 0l-4-4m4 4H7"
// //                     />
// //                   </svg>
// //                   Logout
// //                 </button>
// //               </li>
// //             </ul>
// //           </div>
// //         </div>
// //       ) : (
// //         <button
// //           onClick={() => navigate("/login")}
// //           className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
// //         >
// //           Login
// //           <img src={assets.arrow_icon} alt="Arrow" className="w-4 h-4" />
// //         </button>
// //       )}
// //     </div>
// //   );
// // };







// import React, { useContext } from "react";
// import { assets } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { AppContext } from "../context/AppContext";
// import { toast } from "react-toastify";
// import axios from "axios";

// export const Navbar = () => {
//   const navigate = useNavigate();
//   const { isLoggedIn, userData, setIsLoggedIn, setUserData, backendUrl } =
//     useContext(AppContext);
//   const [dropdownOpen, setDropdownOpen] = React.useState(false);

//   // Logout function
//   const logout = async () => {
//     try {
//       axios.defaults.withCredentials = true;
//       const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
//       if (data.success) {
//         setIsLoggedIn(false);
//         setUserData(false);
//         navigate("/");
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Logout failed");
//     }
//   };

//   // Close dropdown when clicking outside
//   React.useEffect(() => {
//     if (!dropdownOpen) return;
//     const handleClick = (e) => {
//       if (!e.target.closest(".profile-dropdown-group")) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, [dropdownOpen]);

//   // console.log("Navbar userData:", userData);
//   return (
//     <div className="w-full flex justify-between items-center p-2 sm:p-3 sm:px-24 fixed top-0 bg-white shadow-md z-50">
//       {/* Logo */}
//       <img
//         src={assets.navbarlogo}
//         alt="Logo"
//         className="w-12 sm:w-16 cursor-pointer"
//         onClick={() => navigate("/")}
//       />

//       {/* Conditional rendering based on login */}
//       {isLoggedIn && userData ? (
//         <div className="relative flex items-center group cursor-pointer">
//           {/* Avatar */}
//           {/* {userData.avatar ? (
//       <img
//         src={userData.avatar}
//         alt="profile"
//         className="w-10 h-10 rounded-full object-cover border border-gray-300 transition-all duration-300
//                    group-hover:scale-110 group-hover:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)]"
//         title={userData.name}
//       />
//     ) : ( */}
//           <div
//             className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-semibold text-lg 
//                    transition-all duration-300 
//                    group-hover:scale-110 group-hover:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)]"
//             title={userData.name}
//           >
//             {userData.name?.charAt(0).toUpperCase()}
//           </div>
//           {/* )} */}

//           {/* Dropdown menu */}
//           <div
//             className="absolute hidden group-hover:block top-0 right-0 pt-12 z-10 text-black rounded
//                  transition-all duration-300"
//           >
//             <ul className="list-none m-0 p-2 bg-gray-100 text-sm rounded shadow-lg w-44">
//               {/* Optional verify email */}
//               {/* {!userData.isAccountVerified && (
//           <li
//             onClick={sendVerificationOtp}
//             className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
//           >
//             Verify Email
//           </li>
//         )}  */}

//               <li
//                 onClick={logout}
//                 className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded flex items-center gap-2 text-red-600 hover:text-red-700 hover:shadow-[0_0_6px_1px_rgba(239,68,68,0.4)]"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5 text-red-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 16l4-4m0 0l-4-4m4 4H7"
//                   />
//                 </svg>
//                 Logout
//               </li>
//             </ul>
//           </div>
//         </div>
//       ) : (
//         <button
//           onClick={() => navigate("/login")}
//           className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
//         >
//           Login
//           <img src={assets.arrow_icon} alt="Arrow" className="w-4 h-4" />
//         </button>
//       )}
//     </div>
//   );
// };



import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userData, setIsLoggedIn, setUserData, backendUrl } =
    useContext(AppContext);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!loginDropdownOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest(".login-dropdown-group")) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [loginDropdownOpen]);

  // Logout function
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(false);
        navigate("/temp");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-2 sm:p-3 sm:px-24 fixed top-0 bg-white shadow-md z-50">
      {/* Logo */}
      <img
        src={assets.navbarlogo}
        alt="Logo"
        className="w-12 sm:w-16 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* Conditional rendering based on login */}
      {isLoggedIn && userData ? (
        <div className="relative flex items-center group cursor-pointer">
          {/* Avatar */}
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white font-semibold text-lg 
                   transition-all duration-300 
                   group-hover:scale-110 group-hover:shadow-[0_0_8px_2px_rgba(59,130,246,0.6)]"
            title={userData.name}
          >
            {userData.name?.charAt(0).toUpperCase()}
          </div>

          {/* Dropdown menu */}
          <div
            className="absolute hidden group-hover:block top-0 right-0 pt-12 z-10 text-black rounded
                 transition-all duration-300"
          >
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm rounded shadow-lg w-44">
              <li
                onClick={logout}
                className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded flex items-center gap-2 text-red-600 hover:text-red-700 hover:shadow-[0_0_6px_1px_rgba(239,68,68,0.4)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7"
                  />
                </svg>
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="login-dropdown-group relative">
          <button
            onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
            className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
          >
            Login
            <img src={assets.arrow_icon} alt="Arrow" className="w-4 h-4" />
          </button>
          
          {/* Login Options Dropdown */}
          {loginDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <button
                onClick={() => {
                  navigate("/login");
                  setLoginDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                Login as Technician
              </button>
              <button
                onClick={() => {
                  navigate("/login-customer");
                  setLoginDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-t border-gray-100"
              >
                Login as Customer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};