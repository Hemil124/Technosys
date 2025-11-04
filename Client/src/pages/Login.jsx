// import React, { useState, useContext, useEffect } from "react";
// import ReCAPTCHA from "react-google-recaptcha";
// import { assets } from "../assets/assets";
// import { useNavigate, useLocation } from "react-router-dom";
// import { AppContext } from "../context/AppContext";
// import axios from "axios";
// import { toast } from "react-toastify";

// export const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { backendUrl, setIsLoggedIn, getUserData, userData } =
//     useContext(AppContext);

//   // Check if we're coming from successful verification
//   const [state, setState] = useState(
//     location.state?.fromVerification ? "Login" : "Login"
//   );

//   // Validation functions
//   const [errors, setErrors] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     password: "",
//     address: "",
//     serviceCategoryID: "",
//     bankAccountNo: "",
//     ifscCode: "",
//     idProof: "",
//     photo: "",
//   });

//   const [touched, setTouched] = useState({
//     name: false,
//     email: false,
//     mobile: false,
//     password: false,
//     address: false,
//     serviceCategoryID: false,
//     bankAccountNo: false,
//     ifscCode: false,
//   });

//   // Validation functions
//   const validateField = (name, value) => {
//     let error = "";

//     switch (name) {
//       case "name":
//         if (!value.trim()) error = "Name is required";
//         else if (value.trim().length < 2)
//           error = "Name must be at least 2 characters";
//         else if (/[0-9]/.test(value)) error = "Name should not contain numbers";
//         else if (!/^[a-zA-Z\s]*$/.test(value))
//           error = "Name should only contain letters and spaces";
//         break;

//       case "email":
//         if (!value) error = "Email is required";
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
//           error = "Invalid email format";
//         break;

//       case "mobile":
//         if (!value) error = "Mobile number is required";
//         else if (!/^\d{10}$/.test(value))
//           error = "Mobile must be exactly 10 digits";
//         break;

//       case "password":
//         if (!value) error = "Password is required";
//         else if (value.length < 8)
//           error = "Password must be at least 8 characters";
//         else if (!/(?=.*[a-z])/.test(value))
//           error = "Password must contain at least one lowercase letter";
//         else if (!/(?=.*[A-Z])/.test(value))
//           error = "Password must contain at least one uppercase letter";
//         else if (!/(?=.*\d)/.test(value))
//           error = "Password must contain at least one number";
//         else if (!/(?=.*[@$!%*?&])/.test(value))
//           error =
//             "Password must contain at least one special character (@$!%*?&)";
//         break;

//       case "address":
//         if (!value.trim()) error = "Address is required";
//         break;

//       case "serviceCategoryID":
//         if (!value) error = "Service category is required";
//         break;

//       case "bankAccountNo":
//         if (!value.trim()) error = "Bank account number is required";
//         else if (!/^\d+$/.test(value))
//           error = "Bank account should contain only numbers";
//         else if (value.length < 9)
//           error = "Bank account number should be at least 9 digits";
//         else if (value.length > 18)
//           error = "Bank account number should not exceed 18 digits";
//         break;

//       case "ifscCode":
//         if (!value.trim()) error = "IFSC code is required";
//         else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase()))
//           error = "Invalid IFSC code format (e.g., ABCD0123456)";
//         break;

//       default:
//         break;
//     }

//     return error;
//   };

//   // Handle input change with filtering
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     let filteredValue = value;

//     // Apply filters based on field type
//     switch (name) {
//       case "name":
//         filteredValue = value.replace(/[0-9]/g, ""); // Remove numbers
//         break;
//       case "mobile":
//         filteredValue = value.replace(/\D/g, "").slice(0, 10); // Only numbers, max 10
//         break;
//       case "bankAccountNo":
//         filteredValue = value.replace(/\D/g, "").slice(0, 18); // Only numbers, max 18
//         break;
//       case "ifscCode":
//         filteredValue = value.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Only uppercase letters and numbers
//         break;
//       default:
//         filteredValue = value;
//     }

//     setFormData({
//       ...formData,
//       [name]: filteredValue,
//     });

//     if (touched[name]) {
//       const error = validateField(name, filteredValue);
//       setErrors({ ...errors, [name]: error });
//     }
//   };

//   // Handle blur events
//   const handleBlur = (e) => {
//     const { name } = e.target;
//     setTouched({ ...touched, [name]: true });

//     const error = validateField(name, formData[name]);
//     setErrors({ ...errors, [name]: error });
//   };

//   // Special handlers for mobile and email
//   const handleMobileChange = (e) => {
//     const value = e.target.value.replace(/\D/g, "").slice(0, 10);
//     setMobile(value);

//     if (touched.mobile) {
//       const error = validateField("mobile", value);
//       setErrors({ ...errors, mobile: error });
//     }
//   };

//   const handleEmailChange = (e) => {
//     const value = e.target.value;
//     setEmail(value);

//     if (touched.email) {
//       const error = validateField("email", value);
//       setErrors({ ...errors, email: error });
//     }
//   };

//   // File validation
//   const handleFileChange = (e, fileType) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Check file size (5MB max)
//       if (file.size > 5 * 1024 * 1024) {
//         setErrors({ ...errors, [fileType]: "File size must be less than 5MB" });
//         return;
//       }

//       // Check file type
//       let allowedTypes = [];
//       if (fileType === "idProof") {
//         allowedTypes = [
//           "image/jpeg",
//           "image/jpg",
//           "image/png",
//           "application/pdf",
//         ];
//       } else if (fileType === "photo") {
//         allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
//       }

//       if (!allowedTypes.includes(file.type)) {
//         const allowedFormats =
//           fileType === "idProof" ? "JPG, PNG, PDF" : "JPG, PNG";
//         setErrors({
//           ...errors,
//           [fileType]: `Only ${allowedFormats} files are allowed`,
//         });
//         return;
//       }

//       // File is valid
//       setErrors({ ...errors, [fileType]: "" });

//       if (fileType === "idProof") {
//         setIdProof(file);
//         setIdProofName(file.name);
//       } else if (fileType === "photo") {
//         setPhoto(file);
//         setPhotoName(file.name);
//       }
//     }
//   };

//   // Add to your component state
//   const [dragActive, setDragActive] = useState({
//     idProof: false,
//     photo: false,
//   });

//   // Drag event handlers
//   const handleDragOver = (e, fileType) => {
//     e.preventDefault();
//     setDragActive((prev) => ({ ...prev, [fileType]: true }));
//   };

//   const handleDragLeave = (e, fileType) => {
//     e.preventDefault();
//     setDragActive((prev) => ({ ...prev, [fileType]: false }));
//   };

//   const handleDrop = (e, fileType) => {
//     e.preventDefault();
//     setDragActive((prev) => ({ ...prev, [fileType]: false }));
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileChange({ target: { files: e.dataTransfer.files } }, fileType);
//     }
//   };

//   const [formData, setFormData] = useState({
//     name: "",
//     password: "",
//     address: "",
//     serviceCategoryID: "",
//     bankAccountNo: "",
//     ifscCode: "",
//   });

//   const [idProof, setIdProof] = useState(null);
//   const [photo, setPhoto] = useState(null);
//   const [idProofName, setIdProofName] = useState("");
//   const [photoName, setPhotoName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("login");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [isMobileVerified, setIsMobileVerified] = useState(false);
//   const [isEmailVerified, setIsEmailVerified] = useState(false);
//   const [isSendingOtp, setIsSendingOtp] = useState(false);
//   const [recaptchaToken, setRecaptchaToken] = useState("");
//   const [showRecaptcha, setShowRecaptcha] = useState(false);
//   const recaptchaRef = React.useRef();

//   // Verification states
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [verificationType, setVerificationType] = useState(""); // 'email' or 'mobile'
//   const [verificationId, setVerificationId] = useState(""); // For Firebase verification

//   // Send OTP function
//   const sendOtp = async (type) => {
//     setIsSendingOtp(true);
//     setVerificationType(type);

//     try {
//       let endpoint = "";
//       let payload = {};

//       if (type === "email") {
//         if (!email) {
//           toast.error("Please enter email first");
//           setIsSendingOtp(false);
//           return;
//         }
//         endpoint = "/api/auth/send-email-otp";
//         payload = { email };
//       } else if (type === "mobile") {
//         if (!mobile) {
//           toast.error("Please enter mobile number first");
//           setIsSendingOtp(false);
//           return;
//         }
//         endpoint = "/api/auth/send-mobile-otp";
//         payload = { mobile };
//       }

//       const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

//       if (data.success) {
//         setShowOtpModal(true);
//         toast.success(`OTP sent to your ${type}`);

//         // Store verification ID for mobile OTP (Firebase)
//         if (type === "mobile" && data.verificationId) {
//           setVerificationId(data.verificationId);
//         }

//         // For development - auto-fill OTP
//         if (process.env.NODE_ENV === "development" && data.otp) {
//           setOtp(data.otp);
//         }
//       } else {
//         toast.error(data.message || `Failed to send ${type} OTP`);
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           `Failed to send ${type} OTP`
//       );
//     } finally {
//       setIsSendingOtp(false);
//     }
//   };

//   // Verify OTP function
//   const verifyOtp = async () => {
//     if (!otp || otp.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP");
//       return;
//     }

//     try {
//       let endpoint = "";
//       let payload = {};

//       if (verificationType === "email") {
//         endpoint = "/api/auth/verify-email-otp";
//         payload = { email, otp };
//       } else if (verificationType === "mobile") {
//         endpoint = "/api/auth/verify-mobile-otp";
//         payload = { mobile, otp, verificationId };
//       }

//       const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

//       if (data.success) {
//         if (verificationType === "email") {
//           setIsEmailVerified(true);
//         } else {
//           setIsMobileVerified(true);
//         }

//         setShowOtpModal(false);
//         setOtp("");
//         setVerificationId("");
//         toast.success(`${verificationType} verified successfully!`);
//       } else {
//         toast.error(data.message || "Invalid OTP");
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || error.message || "Failed to verify OTP"
//       );
//     }
//   };

//   // Predefined service categories
//   const serviceCategories = [
//     { id: "1", name: "Plumbing" },
//     { id: "2", name: "Electrical" },
//     { id: "3", name: "Carpentry" },
//     { id: "4", name: "Painting" },
//     { id: "5", name: "AC Repair" },
//     { id: "6", name: "Appliance Repair" },
//     { id: "7", name: "Computer Repair" },
//     { id: "8", name: "Mobile Repair" },
//   ];

//   useEffect(() => {
//     // Set active tab based on state
//     setActiveTab(state === "Login" ? "login" : "signup");
//     // Always reset reCAPTCHA on mount and tab switch
//     setShowRecaptcha(false);
//     setRecaptchaToken("");
//     // If coming from verification, show success message
//     if (location.state?.fromVerification) {
//       toast.success("Email verified successfully! You can now login.");
//       // Clear the state to avoid showing the message again on refresh
//       window.history.replaceState({}, document.title);
//     }
//   }, [state, location.state]);

//   // const handleFileChange = (e, fileType) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     if (fileType === "idProof") {
//   //       setIdProof(file);
//   //       setIdProofName(file.name);
//   //     } else if (fileType === "photo") {
//   //       setPhoto(file);
//   //       setPhotoName(file.name);
//   //     }
//   //   }
//   // };

//   const removeFile = (fileType) => {
//     if (fileType === "idProof") {
//       setIdProof(null);
//       setIdProofName("");
//     } else if (fileType === "photo") {
//       setPhoto(null);
//       setPhotoName("");
//     }
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();

//     // Validate all fields
//     const newErrors = {};
//     const newTouched = {};

//     // Validate form data fields
//     Object.keys(formData).forEach((key) => {
//       newTouched[key] = true;
//       newErrors[key] = validateField(key, formData[key]);
//     });

//     // Validate mobile and email
//     newTouched.mobile = true;
//     newErrors.mobile = validateField("mobile", mobile);
//     newTouched.email = true;
//     newErrors.email = validateField("email", email);

//     // Validate files
//     if (state === "Sign Up") {
//       if (!idProof) newErrors.idProof = "ID proof is required";
//       if (!photo) newErrors.photo = "Photo is required";
//     }

//     setTouched(newTouched);
//     setErrors(newErrors);

//     // Check if there are any errors
//     const hasErrors = Object.values(newErrors).some((error) => error !== "");

//     if (state === "Sign Up") {
//       if (hasErrors) {
//         toast.error("Please fix the validation errors before submitting.");
//         return;
//       }

//       if (!isMobileVerified) {
//         toast.error("Please verify your mobile number before submitting.");
//         return;
//       }
//       if (!isEmailVerified) {
//         toast.error("Please verify your email address before submitting.");
//         return;
//       }
//     }

//     setLoading(true);

//     try {
//       axios.defaults.withCredentials = true;

//       if (state === "Sign Up") {
//         // Create FormData for signup with files
//         const formDataToSend = new FormData();
//         formDataToSend.append("name", formData.name);
//         formDataToSend.append("email", email);
//         formDataToSend.append("password", formData.password);
//         formDataToSend.append("address", formData.address);
//         formDataToSend.append("serviceCategoryID", formData.serviceCategoryID);
//         formDataToSend.append("bankAccountNo", formData.bankAccountNo);
//         formDataToSend.append("ifscCode", formData.ifscCode);
//         // formDataToSend.append("email", email);
//         formDataToSend.append("mobileNumber", mobile);

//         if (idProof) formDataToSend.append("idProof", idProof);
//         if (photo) formDataToSend.append("photo", photo);

//         const { data } = await axios.post(
//           `${backendUrl}/api/auth/register`,
//           formDataToSend
//         );

//         // if (data?.success) {
//         //   setIsLoggedIn(true);
//         //   toast.success("Registration successful!");
//         //   navigate("/");
//         // } else {
//         //   toast.error(data?.message || "Registration failed");
//         // }

//         if (data?.success) {
//           // Instead of setting isLoggedIn to true and navigating to home,
//           // show success message and navigate to login page
//           toast.success("Registration successful! Please login to continue.");
//           setState("Login"); // Switch to login tab
//           setActiveTab("login"); // Set active tab to login
//           navigate("/login"); // Navigate to login page

//           // Reset form data
//           setFormData({
//             name: "",
//             password: "",
//             address: "",
//             serviceCategoryID: "",
//             bankAccountNo: "",
//             ifscCode: "",
//           });
//           setMobile("");
//           setEmail("");
//           setIsMobileVerified(false);
//           setIsEmailVerified(false);
//           setIdProof(null);
//           setIdProofName("");
//           setPhoto(null);
//           setPhotoName("");
//         } else {
//           toast.error(data?.message || "Registration failed");
//         }
//       } else {
//         // Login case
//         let loginPayload = {
//           email: email,
//           password: formData.password,
//         };
//         // Only send reCAPTCHA if shown and token is present
//         if (showRecaptcha && recaptchaToken) {
//           loginPayload.recaptchaToken = recaptchaToken;
//         }

//         const { data } = await axios.post(`${backendUrl}/api/auth/login`, loginPayload);

//         if (data?.success) {
//           setIsLoggedIn(true);
//           await getUserData();
//           toast.success("Login successful!");

//           setShowRecaptcha(false);
//           setRecaptchaToken("");

//           if (data.userType === "admin") {
//             navigate("/admin"); // Admins go to admin dashboard
//           } else if (data.userType === "technician") {
//             navigate("/technicion"); // Technicians go to home
//           } else {
//             navigate("/"); // Fallback for any other role
//           }
//         } else {
//           toast.error(data?.message || "Login failed");
//           // Show reCAPTCHA after first failed attempt
//           setShowRecaptcha(true);
//           // Reset reCAPTCHA widget
//           if (recaptchaRef.current) {
//             recaptchaRef.current.reset();
//             setRecaptchaToken("");
//           }
//         }
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || error.message || "Something went wrong"
//       );
//       // Show reCAPTCHA after any error on login
//       if (state === "Login") {
//         setShowRecaptcha(true);
//         if (recaptchaRef.current) {
//           recaptchaRef.current.reset();
//           setRecaptchaToken("");
//         }
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Google Login handler
//   const handleGoogleLogin = () => {
//     window.open(`${backendUrl}/api/auth/google`, "_self");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="fixed top-5 left-5">
//         <img
//           onClick={() => navigate("/")}
//           src={assets.navbarlogo}
//           alt="Logo"
//           className="w-28 cursor-pointer transition-transform hover:scale-105"
//         />
//       </div>

//       <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
//         {/* Left Side - Illustration */}
//         <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex-col justify-center items-center text-white">
//           <div className="mb-8 text-center">
//             <h2 className="text-3xl font-bold mb-2">
//               Join Our Technician Network
//             </h2>
//             <p className="opacity-90">
//               Connect with customers seeking your expertise
//             </p>
//           </div>
//           {/* <div className="w-full max-w-xs">
//             <img
//               src="https://cdni.iconscout.com/illustration/premium/thumb/technician-repairing-phone-6299585-5236018.png"
//               alt="Technician Illustration"
//               className="w-full h-auto"
//             />
//           </div> */}
//           <div className="mt-8 text-center">
//             <p className="text-sm opacity-80">Already have an account?</p>
//             <button
//               onClick={() => setState("Login")}
//               className="mt-2 px-6 py-2 bg-white text-indigo-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
//             >
//               Sign In
//             </button>
//           </div>
//         </div>

//         {/* Right Side - Form */}
//         <div className="w-full md:w-3/5 p-8">
//           {/* Tab Navigation - Mobile */}
//           <div className="md:hidden flex mb-6 bg-gray-100 rounded-lg p-1">
//             <button
//               onClick={() => setState("Login")}
//               className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                 activeTab === "login"
//                   ? "bg-white text-indigo-700 shadow-sm"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               Login
//             </button>
//             <button
//               onClick={() => setState("Sign Up")}
//               className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                 activeTab === "signup"
//                   ? "bg-white text-indigo-700 shadow-sm"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               Register
//             </button>
//           </div>

//           <div className="text-center mb-8">
//             <h2 className="text-2xl font-bold text-gray-900">
//               {state === "Sign Up"
//                 ? "Create Technician Account"
//                 : "Welcome Back"}
//             </h2>
//             <p className="text-gray-600 mt-2">
//               {state === "Sign Up"
//                 ? "Fill in your details to join our network"
//                 : "Sign in to your technician account"}
//             </p>
//           </div>

//           <form onSubmit={onSubmitHandler} className="space-y-6">
//             {state === "Sign Up" && (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Full Name *
//                     </label>
//                     <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         value={formData.name}
//                         name="name"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         placeholder="Enter your full name"
//                         required
//                       />
//                     </div>
//                   </div> */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Full Name *
//                     </label>
//                     <div
//                       className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                         errors.name
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         onBlur={handleBlur}
//                         value={formData.name}
//                         name="name"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         placeholder="Enter your full name (letters only)"
//                         required
//                       />
//                     </div>
//                     {errors.name && (
//                       <p className="text-red-500 text-xs mt-1">{errors.name}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Service Category *
//                     </label>
//                     <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9"
//                         />
//                       </svg>
//                       <select
//                         onChange={handleInputChange}
//                         value={formData.serviceCategoryID}
//                         name="serviceCategoryID"
//                         className="w-full bg-transparent outline-none text-sm appearance-none"
//                         required
//                       >
//                         <option value="">Select specialty</option>
//                         {serviceCategories.map((category) => (
//                           <option key={category.id} value={category.id}>
//                             {category.name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Mobile Number *
//                   </label>
//                   <div className="flex gap-2">
//                     <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-lg border border-gray-300 focus-within:ring-1 focus-within:border-indigo-500 focus-within:ring-indigo-500 transition-colors">
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                         />
//                       </svg>
//                       <input
//                         onChange={(e) =>
//                           setMobile(
//                             e.target.value.replace(/\D/g, "").slice(0, 10)
//                           )
//                         }
//                         value={mobile}
//                         className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-500"
//                         type="tel"
//                         placeholder="10-digit mobile number"
//                         required
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => sendOtp("mobile")}
//                       disabled={
//                         isMobileVerified || isSendingOtp || mobile.length !== 10
//                       }
//                       className={` px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
//                         isMobileVerified
//                           ? "bg-green-100 text-green-800 cursor-not-allowed"
//                           : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
//                       } ${
//                         isSendingOtp || mobile.length !== 10
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                     >
//                       {isMobileVerified ? (
//                         <span>Verified</span>
//                       ) : isSendingOtp ? (
//                         <span>Sending...</span>
//                       ) : (
//                         <span>Verify</span>
//                       )}
//                     </button>
//                   </div>
//                 </div> */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Mobile Number *
//                   </label>
//                   <div className="flex gap-2">
//                     <div
//                       className={`flex items-center gap-3 flex-1 px-4 py-3 rounded-lg border transition-colors ${
//                         errors.mobile
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleMobileChange}
//                         onBlur={() => setTouched({ ...touched, mobile: true })}
//                         value={mobile}
//                         className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-500"
//                         type="tel"
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         placeholder="10-digit mobile number"
//                         maxLength={10}
//                         required
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => sendOtp("mobile")}
//                       disabled={
//                         isMobileVerified ||
//                         isSendingOtp ||
//                         mobile.length !== 10 ||
//                         errors.mobile
//                       }
//                       className={`px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
//                         isMobileVerified
//                           ? "bg-green-100 text-green-800 cursor-not-allowed"
//                           : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
//                       } ${
//                         isSendingOtp || mobile.length !== 10 || errors.mobile
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                     >
//                       {isMobileVerified
//                         ? "Verified"
//                         : isSendingOtp
//                         ? "Sending..."
//                         : "Verify"}
//                     </button>
//                   </div>
//                   {errors.mobile && (
//                     <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
//                   )}
//                   {mobile.length === 10 && !errors.mobile && (
//                     <p className="text-green-600 text-xs mt-1">
//                       ✓ Valid mobile number
//                     </p>
//                   )}
//                 </div>

//                 {/* <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address *
//                   </label>
//                   <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                     <svg
//                       className="w-5 h-5 text-gray-400 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                     <input
//                       onChange={handleInputChange}
//                       value={formData.address}
//                       name="address"
//                       className="w-full bg-transparent outline-none text-sm"
//                       type="text"
//                       placeholder="Your complete address"
//                       required
//                     />
//                   </div>
//                 </div> */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address *
//                   </label>
//                   <div
//                     className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                       errors.address
//                         ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                         : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                     }`}
//                   >
//                     <svg
//                       className="w-5 h-5 text-gray-400 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                     <input
//                       onChange={handleInputChange}
//                       onBlur={handleBlur}
//                       value={formData.address}
//                       name="address"
//                       className="w-full bg-transparent outline-none text-sm"
//                       type="text"
//                       placeholder="Your complete address"
//                       required
//                     />
//                   </div>
//                   {errors.address && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors.address}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bank Account No. *
//                     </label>
//                     <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         value={formData.bankAccountNo}
//                         name="bankAccountNo"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         placeholder="Account number"
//                         required
//                       />
//                     </div>
//                   </div> */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bank Account No. *
//                     </label>
//                     <div
//                       className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                         errors.bankAccountNo
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         onBlur={handleBlur}
//                         value={formData.bankAccountNo}
//                         name="bankAccountNo"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         placeholder="Enter account number (numbers only)"
//                         maxLength={18}
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-between mt-1">
//                       {errors.bankAccountNo ? (
//                         <p className="text-red-500 text-xs">
//                           {errors.bankAccountNo}
//                         </p>
//                       ) : (
//                         formData.bankAccountNo.length > 0 && (
//                           <p className="text-gray-500 text-xs">
//                             {formData.bankAccountNo.length}/18 digits
//                           </p>
//                         )
//                       )}
//                       {formData.bankAccountNo.length > 0 &&
//                         !errors.bankAccountNo && (
//                           <p className="text-green-600 text-xs">
//                             ✓ Numbers only
//                           </p>
//                         )}
//                     </div>
//                   </div>

//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       IFSC Code *
//                     </label>
//                     <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M4 6h16M4 12h16m-7 6h7"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         value={formData.ifscCode}
//                         name="ifscCode"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         placeholder="IFSC code"
//                         required
//                       />
//                     </div>
//                   </div> */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       IFSC Code *
//                     </label>
//                     <div
//                       className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                         errors.ifscCode
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M4 6h16M4 12h16m-7 6h7"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         onBlur={handleBlur}
//                         value={formData.ifscCode}
//                         name="ifscCode"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         placeholder="e.g., ABCD0123456"
//                         pattern="[A-Z]{4}0[A-Z0-9]{6}"
//                         title="IFSC code format: ABCD0123456"
//                         required
//                       />
//                     </div>
//                     {errors.ifscCode && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.ifscCode}
//                       </p>
//                     )}
//                     {formData.ifscCode.length === 11 && !errors.ifscCode && (
//                       <p className="text-green-600 text-xs mt-1">
//                         ✓ Valid IFSC format
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       ID Proof *
//                     </label>
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer">
//                       {idProof ? (
//                         <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
//                           <span className="text-sm text-indigo-700 truncate">
//                             {idProofName}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeFile("idProof")}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : (
//                         <label htmlFor="idProof" className="cursor-pointer">
//                           <svg
//                             className="w-10 h-10 mx-auto text-gray-400 mb-2"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                             />
//                           </svg>
//                           <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
//                             Upload ID Proof
//                           </span>
//                           <p className="text-xs text-gray-500 mt-1">
//                             PDF, JPG, PNG (5MB max)
//                           </p>
//                           <input
//                             id="idProof"
//                             onChange={(e) => handleFileChange(e, "idProof")}
//                             className="hidden"
//                             type="file"
//                             accept="image/*,.pdf"
//                             required
//                           />
//                         </label>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Your Photo *
//                     </label>
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer">
//                       {photo ? (
//                         <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
//                           <span className="text-sm text-indigo-700 truncate">
//                             {photoName}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeFile("photo")}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : (
//                         <label htmlFor="photo" className="cursor-pointer">
//                           <svg
//                             className="w-10 h-10 mx-auto text-gray-400 mb-2"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
//                             />
//                           </svg>
//                           <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
//                             Upload Photo
//                           </span>
//                           <p className="text-xs text-gray-500 mt-1">
//                             JPG, PNG (5MB max)
//                           </p>
//                           <input
//                             id="photo"
//                             onChange={(e) => handleFileChange(e, "photo")}
//                             className="hidden"
//                             type="file"
//                             accept="image/*"
//                             required
//                           />
//                         </label>
//                       )}
//                     </div>
//                   </div> */}

//                   {/* ID Proof Field */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       ID Proof *
//                     </label>
//                     <div
//                       onDragOver={(e) => handleDragOver(e, "idProof")}
//                       onDragLeave={(e) => handleDragLeave(e, "idProof")}
//                       onDrop={(e) => handleDrop(e, "idProof")}
//                       className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
//                     >
//                       {idProof ? (
//                         <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
//                           <span className="text-sm text-indigo-700 truncate">
//                             {idProofName}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeFile("idProof")}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : (
//                         <label htmlFor="idProof" className="cursor-pointer">
//                           <svg
//                             className="w-10 h-10 mx-auto text-gray-400 mb-2"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                             />
//                           </svg>
//                           <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
//                             Upload ID Proof
//                           </span>
//                           <p className="text-xs text-gray-500 mt-1">
//                             PDF, JPG, PNG (5MB max)
//                           </p>
//                           <input
//                             id="idProof"
//                             onChange={(e) => handleFileChange(e, "idProof")}
//                             className="hidden"
//                             type="file"
//                             accept=".pdf,.jpg,.jpeg,.png"
//                             required
//                           />
//                         </label>
//                       )}
//                     </div>
//                     {errors.idProof && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.idProof}
//                       </p>
//                     )}
//                   </div>

//                   {/* Photo Field */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Your Photo *
//                     </label>
//                     <div
//                       onDragOver={(e) => handleDragOver(e, "photo")}
//                       onDragLeave={(e) => handleDragLeave(e, "photo")}
//                       onDrop={(e) => handleDrop(e, "photo")}
//                       className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
//                     >
//                       {photo ? (
//                         <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
//                           <span className="text-sm text-indigo-700 truncate">
//                             {photoName}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeFile("photo")}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : (
//                         <label htmlFor="photo" className="cursor-pointer">
//                           <svg
//                             className="w-10 h-10 mx-auto text-gray-400 mb-2"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
//                             />
//                           </svg>
//                           <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
//                             Upload Photo
//                           </span>
//                           <p className="text-xs text-gray-500 mt-1">
//                             JPG, PNG (5MB max)
//                           </p>
//                           <input
//                             id="photo"
//                             onChange={(e) => handleFileChange(e, "photo")}
//                             className="hidden"
//                             type="file"
//                             accept=".jpg,.jpeg,.png"
//                             required
//                           />
//                         </label>
//                       )}
//                     </div>
//                     {errors.photo && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.photo}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className={`${state === "Sign Up" ? "mt-2" : ""} space-y-5`}>
//               {/* <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address *
//                 </label>
//                 <div className="flex gap-2">
//                   <div className="flex items-center gap-3 flex-1 border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                     <svg
//                       className="w-5 h-5 text-gray-400 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                       />
//                     </svg>
//                     <input
//                       onChange={(e) => setEmail(e.target.value)} // This is already correct
//                       value={email} // This is already correct
//                       className="w-full text-sm bg-transparent outline-none text-gray-700 placeholder-gray-500"
//                       type="email"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>
//                   {state === "Sign Up" && (
//                     <button
//                       type="button"
//                       onClick={() => sendOtp("email")}
//                       disabled={
//                         isEmailVerified || isSendingOtp || !email.includes("@")
//                       }
//                       className={`px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
//                         isEmailVerified
//                           ? "bg-green-100 text-green-800 cursor-not-allowed"
//                           : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
//                       } ${
//                         isSendingOtp || !email.includes("@")
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                     >
//                       {isEmailVerified ? (
//                         <span>Verified</span>
//                       ) : isSendingOtp ? (
//                         <span>Sending...</span>
//                       ) : (
//                         <span>Verify</span>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               </div> */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address *
//                 </label>
//                 <div className="flex gap-2">
//                   <div
//                     className={`flex items-center gap-3 flex-1 border rounded-lg px-4 py-3 transition-colors ${
//                       errors.email
//                         ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                         : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                     }`}
//                   >
//                     <svg
//                       className="w-5 h-5 text-gray-400 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                       />
//                     </svg>
//                     <input
//                       onChange={handleEmailChange}
//                       onBlur={() => setTouched({ ...touched, email: true })}
//                       value={email}
//                       className="w-full text-sm bg-transparent outline-none text-gray-700 placeholder-gray-500"
//                       type="email"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>
//                   {state === "Sign Up" && (
//                     <button
//                       type="button"
//                       onClick={() => sendOtp("email")}
//                       disabled={
//                         isEmailVerified ||
//                         isSendingOtp ||
//                         !email.includes("@") ||
//                         errors.email
//                       }
//                       className={`px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
//                         isEmailVerified
//                           ? "bg-green-100 text-green-800 cursor-not-allowed"
//                           : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
//                       } ${
//                         isSendingOtp || !email.includes("@") || errors.email
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                     >
//                       {isEmailVerified
//                         ? "Verified"
//                         : isSendingOtp
//                         ? "Sending..."
//                         : "Verify"}
//                     </button>
//                   )}
//                 </div>
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//                 )}
//                 {email.includes("@") && !errors.email && (
//                   <p className="text-green-600 text-xs mt-1">
//                     ✓ Valid email format
//                   </p>
//                 )}
//               </div>

//               {/* <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password *
//                 </label>
//                 <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                   <svg
//                     className="w-5 h-5 text-gray-400 mr-2"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                     />
//                   </svg>
//                   <input
//                     onChange={handleInputChange}
//                     value={formData.password}
//                     name="password"
//                     className="w-full bg-transparent outline-none text-sm"
//                     type="password"
//                     placeholder="Enter your password"
//                     required
//                   />
//                 </div>
//               </div> */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password *
//                 </label>
//                 <div
//                   className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                     errors.password
//                       ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                       : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                   }`}
//                 >
//                   <svg
//                     className="w-5 h-5 text-gray-400 mr-2"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                     />
//                   </svg>
//                   <input
//                     onChange={handleInputChange}
//                     onBlur={handleBlur}
//                     value={formData.password}
//                     name="password"
//                     className="w-full bg-transparent outline-none text-sm"
//                     type="password"
//                     placeholder="Min 8 chars with uppercase, lowercase, number & special character"
//                     required
//                   />
//                 </div>
//                 {errors.password && (
//                   <p className="text-red-500 text-xs mt-1">{errors.password}</p>
//                 )}
//                 {formData.password.length >= 8 && !errors.password && (
//                   <p className="text-green-600 text-xs mt-1">
//                     ✓ Strong password
//                   </p>
//                 )}
//               </div>

//               {state === "Login" && (
//                 <div className="text-right">
//                   <button
//                     type="button"
//                     onClick={() => navigate("/reset-password")}
//                     className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Conditional Google reCAPTCHA for Login only */}
//             {state === "Login" && showRecaptcha && (
//               <div className="flex justify-center mb-4">
//                 <ReCAPTCHA
//                   ref={recaptchaRef}
//                   sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
//                   onChange={token => setRecaptchaToken(token)}
//                   theme="light"
//                 />
//               </div>
//             )}
//             <button
//               type="submit"
//               disabled={loading || (state === "Login" && showRecaptcha && !recaptchaToken)}
//               className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70 shadow-md hover:shadow-lg"
//             >
//               {loading ? (
//                 <>
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   {state === "Sign Up"
//                     ? "Creating Account..."
//                     : "Signing In..."}
//                 </>
//               ) : state === "Sign Up" ? (
//                 "Create Account"
//               ) : (
//                 "Sign In"
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             {state === "Sign Up" ? (
//               <p className="text-sm text-gray-600">
//                 Already have an account?{" "}
//                 <button
//                   onClick={() => setState("Login")}
//                   className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//                 >
//                   Sign In
//                 </button>
//               </p>
//             ) : (
//               <p className="text-sm text-gray-600">
//                 Don't have an account?{" "}
//                 <button
//                   onClick={() => setState("Sign Up")}
//                   className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//                 >
//                   Register as Technician
//                 </button>
//               </p>
//             )}
//           </div>

//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">
//                 Or continue with
//               </span>
//             </div>
//           </div>

//           <button
//             onClick={handleGoogleLogin}
//             className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
//           >
//             <img src={assets.google} alt="Google" className="w-5 h-5" />
//             <span>Sign in with Google</span>
//           </button>
//         </div>
//       </div>
//       {/* OTP Verification Modal */}
//       {/* OTP Verification Modal */}
// {showOtpModal && (
//   <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//     <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
//       {/* Header */}
//       <div className="text-center mb-6">
//         <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
//           <svg 
//             className="w-8 h-8 text-indigo-300" 
//             fill="none" 
//             stroke="currentColor" 
//             viewBox="0 0 24 24"
//           >
//             <path 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               strokeWidth={2} 
//               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
//             />
//           </svg>
//         </div>
//         <h3 className="text-white text-2xl font-bold mb-2">
//           Enter Verification Code
//         </h3>
//         <p className="text-indigo-200">
//           Enter the 6-digit code sent to{" "}
//           <span className="font-semibold text-white">
//             {verificationType === "email" ? email : mobile}
//           </span>
//         </p>
//       </div>

//       {/* OTP Input Fields */}
//       <div className="flex justify-between gap-3 mb-8">
//         {Array.from({ length: 6 }).map((_, index) => (
//           <input
//             key={index}
//             type="text"
//             inputMode="numeric"
//             pattern="[0-9]*"
//             maxLength={1}
//             value={otp[index] || ""}
//             onChange={(e) => handleOtpInput(e, index)}
//             onKeyDown={(e) => handleOtpKeyDown(e, index)}
//             onPaste={handleOtpPaste}
//             className="w-12 h-12 bg-slate-700 text-center text-xl font-semibold rounded-lg text-white border-2 border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
//             ref={(el) => (otpInputRefs.current[index] = el)}
//             autoFocus={index === 0}
//           />
//         ))}
//       </div>

//       {/* Action Buttons */}
//       <div className="flex gap-3">
//         <button
//           onClick={verifyOtp}
//           disabled={otp.length !== 6}
//           className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
//         >
//           Verify Code
//         </button>
//         <button
//           onClick={() => {
//             setShowOtpModal(false);
//             setOtp("");
//             setVerificationId("");
//             resetOtpInputs();
//           }}
//           className="flex-1 py-3.5 border border-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200"
//         >
//           Cancel
//         </button>
//       </div>

//       {/* Resend OTP Option */}
//       <div className="text-center mt-6">
//         <button
//           onClick={() => sendOtp(verificationType)}
//           disabled={isSendingOtp}
//           className="text-indigo-400 hover:text-indigo-300 text-sm font-medium disabled:opacity-50 transition-colors"
//         >
//           {isSendingOtp ? "Sending..." : "Resend Code"}
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };


// import React, { useState, useContext, useEffect, useRef } from "react";
// import ReCAPTCHA from "react-google-recaptcha";
// import { assets } from "../assets/assets";
// import { useNavigate, useLocation } from "react-router-dom";
// import { AppContext } from "../context/AppContext";
// import axios from "axios";
// import { toast } from "react-toastify";
// const [otpExpiryTime, setOtpExpiryTime] = useState(null);
// const [timeLeft, setTimeLeft] = useState(0);
// const [canResendOtp, setCanResendOtp] = useState(false);

// export const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { backendUrl, setIsLoggedIn, getUserData, userData } =
//     useContext(AppContext);

//   // Check if we're coming from successful verification
//   const [state, setState] = useState(
//     location.state?.fromVerification ? "Login" : "Login"
//   );

//   // Validation functions
//   const [errors, setErrors] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     password: "",
//     address: "",
//     serviceCategoryID: "",
//     bankAccountNo: "",
//     ifscCode: "",
//     idProof: "",
//     photo: "",
//   });

//   const [touched, setTouched] = useState({
//     name: false,
//     email: false,
//     mobile: false,
//     password: false,
//     address: false,
//     serviceCategoryID: false,
//     bankAccountNo: false,
//     ifscCode: false,
//   });

//   // Validation functions
//   const validateField = (name, value) => {
//     let error = "";

//     switch (name) {
//       case "name":
//         if (!value.trim()) error = "Name is required";
//         else if (value.trim().length < 2)
//           error = "Name must be at least 2 characters";
//         else if (/[0-9]/.test(value)) error = "Name should not contain numbers";
//         else if (!/^[a-zA-Z\s]*$/.test(value))
//           error = "Name should only contain letters and spaces";
//         break;

//       case "email":
//         if (!value) error = "Email is required";
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
//           error = "Invalid email format";
//         break;

//       case "mobile":
//         if (!value) error = "Mobile number is required";
//         else if (!/^\d{10}$/.test(value))
//           error = "Mobile must be exactly 10 digits";
//         break;

//       case "password":
//         if (!value) error = "Password is required";
//         else if (value.length < 8)
//           error = "Password must be at least 8 characters";
//         else if (!/(?=.*[a-z])/.test(value))
//           error = "Password must contain at least one lowercase letter";
//         else if (!/(?=.*[A-Z])/.test(value))
//           error = "Password must contain at least one uppercase letter";
//         else if (!/(?=.*\d)/.test(value))
//           error = "Password must contain at least one number";
//         else if (!/(?=.*[@$!%*?&])/.test(value))
//           error =
//             "Password must contain at least one special character (@$!%*?&)";
//         break;

//       case "address":
//         if (!value.trim()) error = "Address is required";
//         break;

//       case "serviceCategoryID":
//         if (!value) error = "Service category is required";
//         break;

//       case "bankAccountNo":
//         if (!value.trim()) error = "Bank account number is required";
//         else if (!/^\d+$/.test(value))
//           error = "Bank account should contain only numbers";
//         else if (value.length < 9)
//           error = "Bank account number should be at least 9 digits";
//         else if (value.length > 18)
//           error = "Bank account number should not exceed 18 digits";
//         break;

//       case "ifscCode":
//         if (!value.trim()) error = "IFSC code is required";
//         else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase()))
//           error = "Invalid IFSC code format (e.g., ABCD0123456)";
//         break;

//       default:
//         break;
//     }

//     return error;
//   };

//   // Handle input change with filtering
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     let filteredValue = value;

//     // Apply filters based on field type
//     switch (name) {
//       case "name":
//         filteredValue = value.replace(/[0-9]/g, ""); // Remove numbers
//         break;
//       case "mobile":
//         filteredValue = value.replace(/\D/g, "").slice(0, 10); // Only numbers, max 10
//         break;
//       case "bankAccountNo":
//         filteredValue = value.replace(/\D/g, "").slice(0, 18); // Only numbers, max 18
//         break;
//       case "ifscCode":
//         filteredValue = value.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Only uppercase letters and numbers
//         break;
//       default:
//         filteredValue = value;
//     }

//     setFormData({
//       ...formData,
//       [name]: filteredValue,
//     });

//     if (touched[name]) {
//       const error = validateField(name, filteredValue);
//       setErrors({ ...errors, [name]: error });
//     }
//   };

//   // Handle blur events
//   const handleBlur = (e) => {
//     const { name } = e.target;
//     setTouched({ ...touched, [name]: true });

//     const error = validateField(name, formData[name]);
//     setErrors({ ...errors, [name]: error });
//   };

//   // Special handlers for mobile and email
//   const handleMobileChange = (e) => {
//     const value = e.target.value.replace(/\D/g, "").slice(0, 10);
//     setMobile(value);

//     if (touched.mobile) {
//       const error = validateField("mobile", value);
//       setErrors({ ...errors, mobile: error });
//     }
//   };

//   const handleEmailChange = (e) => {
//     const value = e.target.value;
//     setEmail(value);

//     if (touched.email) {
//       const error = validateField("email", value);
//       setErrors({ ...errors, email: error });
//     }
//   };

//   // File validation
//   const handleFileChange = (e, fileType) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Check file size (5MB max)
//       if (file.size > 5 * 1024 * 1024) {
//         setErrors({ ...errors, [fileType]: "File size must be less than 5MB" });
//         return;
//       }

//       // Check file type
//       let allowedTypes = [];
//       if (fileType === "idProof") {
//         allowedTypes = [
//           "image/jpeg",
//           "image/jpg",
//           "image/png",
//           "application/pdf",
//         ];
//       } else if (fileType === "photo") {
//         allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
//       }

//       if (!allowedTypes.includes(file.type)) {
//         const allowedFormats =
//           fileType === "idProof" ? "JPG, PNG, PDF" : "JPG, PNG";
//         setErrors({
//           ...errors,
//           [fileType]: `Only ${allowedFormats} files are allowed`,
//         });
//         return;
//       }

//       // File is valid
//       setErrors({ ...errors, [fileType]: "" });

//       if (fileType === "idProof") {
//         setIdProof(file);
//         setIdProofName(file.name);
//       } else if (fileType === "photo") {
//         setPhoto(file);
//         setPhotoName(file.name);
//       }
//     }
//   };

//   // Add to your component state
//   const [dragActive, setDragActive] = useState({
//     idProof: false,
//     photo: false,
//   });

//   // Drag event handlers
//   const handleDragOver = (e, fileType) => {
//     e.preventDefault();
//     setDragActive((prev) => ({ ...prev, [fileType]: true }));
//   };

//   const handleDragLeave = (e, fileType) => {
//     e.preventDefault();
//     setDragActive((prev) => ({ ...prev, [fileType]: false }));
//   };

//   const handleDrop = (e, fileType) => {
//     e.preventDefault();
//     setDragActive((prev) => ({ ...prev, [fileType]: false }));
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileChange({ target: { files: e.dataTransfer.files } }, fileType);
//     }
//   };

//   const [formData, setFormData] = useState({
//     name: "",
//     password: "",
//     address: "",
//     serviceCategoryID: "",
//     bankAccountNo: "",
//     ifscCode: "",
//   });

//   const [idProof, setIdProof] = useState(null);
//   const [photo, setPhoto] = useState(null);
//   const [idProofName, setIdProofName] = useState("");
//   const [photoName, setPhotoName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("login");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [isMobileVerified, setIsMobileVerified] = useState(false);
//   const [isEmailVerified, setIsEmailVerified] = useState(false);
//   const [isSendingOtp, setIsSendingOtp] = useState(false);
//   const [recaptchaToken, setRecaptchaToken] = useState("");
//   const [showRecaptcha, setShowRecaptcha] = useState(false);
//   const recaptchaRef = React.useRef();

//   // Verification states
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [verificationType, setVerificationType] = useState(""); // 'email' or 'mobile'
//   const [verificationId, setVerificationId] = useState(""); // For Firebase verification

//   // Add this ref for OTP inputs
//   const otpInputRefs = useRef([]);

//   // OTP input handlers
//   const handleOtpInput = (e, index) => {
//     const value = e.target.value.replace(/\D/g, ''); // Only numbers
//     if (value) {
//       const newOtp = otp.split('');
//       newOtp[index] = value;
//       const joinedOtp = newOtp.join('');
//       setOtp(joinedOtp);
      
//       // Auto-focus next input
//       if (index < 5 && value) {
//         otpInputRefs.current[index + 1]?.focus();
//       }
//     }
//   };

//   const handleOtpKeyDown = (e, index) => {
//     if (e.key === 'Backspace') {
//       if (!otp[index] && index > 0) {
//         // Move to previous input on backspace
//         otpInputRefs.current[index - 1]?.focus();
//       }
      
//       const newOtp = otp.split('');
//       newOtp[index] = '';
//       setOtp(newOtp.join(''));
//     }
//   };

//   const handleOtpPaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
//     if (pastedData.length === 6) {
//       setOtp(pastedData);
//       // Focus the last input after paste
//       setTimeout(() => {
//         otpInputRefs.current[5]?.focus();
//       }, 0);
//     }
//   };

//   const resetOtpInputs = () => {
//     setOtp('');
//     otpInputRefs.current.forEach(input => {
//       if (input) input.value = '';
//     });
//     otpInputRefs.current[0]?.focus();
//   };

//   // Send OTP function
//   // const sendOtp = async (type) => {
//   //   setIsSendingOtp(true);
//   //   setVerificationType(type);

//   //   // Reset OTP inputs when sending new OTP
//   //   resetOtpInputs();

//   //   try {
//   //     let endpoint = "";
//   //     let payload = {};

//   //     if (type === "email") {
//   //       if (!email) {
//   //         toast.error("Please enter email first");
//   //         setIsSendingOtp(false);
//   //         return;
//   //       }
//   //       endpoint = "/api/auth/send-email-otp";
//   //       payload = { email };
//   //     } else if (type === "mobile") {
//   //       if (!mobile) {
//   //         toast.error("Please enter mobile number first");
//   //         setIsSendingOtp(false);
//   //         return;
//   //       }
//   //       endpoint = "/api/auth/send-mobile-otp";
//   //       payload = { mobile };
//   //     }

//   //     const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

//   //     if (data.success) {
//   //       setShowOtpModal(true);
//   //       toast.success(`OTP sent to your ${type}`);

//   //       // Store verification ID for mobile OTP (Firebase)
//   //       if (type === "mobile" && data.verificationId) {
//   //         setVerificationId(data.verificationId);
//   //       }

//   //       // For development - auto-fill OTP
//   //       if (process.env.NODE_ENV === "development" && data.otp) {
//   //         setOtp(data.otp);
//   //       }
//   //     } else {
//   //       toast.error(data.message || `Failed to send ${type} OTP`);
//   //     }
//   //   } catch (error) {
//   //     toast.error(
//   //       error.response?.data?.message ||
//   //         error.message ||
//   //         `Failed to send ${type} OTP`
//   //     );
//   //   } finally {
//   //     setIsSendingOtp(false);
//   //   }
//   // };
// const sendOtp = async (type) => {
//   setIsSendingOtp(true);
//   setVerificationType(type);
//   setCanResendOtp(false); // Reset resend ability

//   // Reset OTP inputs when sending new OTP
//   resetOtpInputs();

//   try {
//     let endpoint = "";
//     let payload = {};

//     if (type === "email") {
//       if (!email) {
//         toast.error("Please enter email first");
//         setIsSendingOtp(false);
//         return;
//       }
//       endpoint = "/api/auth/send-email-otp";
//       payload = { email };
//     } else if (type === "mobile") {
//       if (!mobile) {
//         toast.error("Please enter mobile number first");
//         setIsSendingOtp(false);
//         return;
//       }
//       endpoint = "/api/auth/send-mobile-otp";
//       payload = { mobile };
//     }

//     const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

//     if (data.success) {
//       setShowOtpModal(true);
      
//       // Set OTP expiry time (15 minutes from now)
//       const expiryTime = new Date();
//       expiryTime.setMinutes(expiryTime.getMinutes() + 15);
//       setOtpExpiryTime(expiryTime);
//       setTimeLeft(15 * 60); // 15 minutes in seconds
//       setCanResendOtp(false);
      
//       toast.success(`OTP sent to your ${type}`);

//       // Store verification ID for mobile OTP (Firebase)
//       if (type === "mobile" && data.verificationId) {
//         setVerificationId(data.verificationId);
//       }

//       // For development - auto-fill OTP
//       if (process.env.NODE_ENV === "development" && data.otp) {
//         setOtp(data.otp);
//       }
//     } else {
//       toast.error(data.message || `Failed to send ${type} OTP`);
//     }
//   } catch (error) {
//     toast.error(
//       error.response?.data?.message ||
//         error.message ||
//         `Failed to send ${type} OTP`
//     );
//   } finally {
//     setIsSendingOtp(false);
//   }
// }; 

// // Countdown timer effect
// useEffect(() => {
//   let timer;
  
//   if (timeLeft > 0) {
//     timer = setInterval(() => {
//       setTimeLeft((prevTime) => {
//         if (prevTime <= 1) {
//           clearInterval(timer);
//           setCanResendOtp(true);
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);
//   }

//   return () => {
//     if (timer) clearInterval(timer);
//   };
// }, [timeLeft]);

// // Format time for display (MM:SS)
// const formatTime = (seconds) => {
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;
//   return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
// };
//   // Verify OTP function
//  const verifyOtp = async () => {
//   if (!otp || otp.length !== 6) {
//     toast.error("Please enter a valid 6-digit OTP");
//     return;
//   }

//   if (timeLeft === 0) {
//     toast.error("OTP has expired. Please request a new one.");
//     return;
//   }

//   try {
//     let endpoint = "";
//     let payload = {};

//     if (verificationType === "email") {
//       endpoint = "/api/auth/verify-email-otp";
//       payload = { email, otp };
//     } else if (verificationType === "mobile") {
//       endpoint = "/api/auth/verify-mobile-otp";
//       payload = { mobile, otp, verificationId };
//     }

//     const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

//     if (data.success) {
//       if (verificationType === "email") {
//         setIsEmailVerified(true);
//       } else {
//         setIsMobileVerified(true);
//       }

//       setShowOtpModal(false);
//       setOtp("");
//       setVerificationId("");
//       setTimeLeft(0); // Reset timer
//       setCanResendOtp(false);
//       resetOtpInputs(); // Reset OTP inputs on success
//       toast.success(`${verificationType} verified successfully!`);
//     } else {
//       toast.error(data.message || "Invalid OTP");
//     }
//   } catch (error) {
//     toast.error(
//       error.response?.data?.message || error.message || "Failed to verify OTP"
//     );
//   }
// };

//   // Predefined service categories
//   const serviceCategories = [
//     { id: "1", name: "Plumbing" },
//     { id: "2", name: "Electrical" },
//     { id: "3", name: "Carpentry" },
//     { id: "4", name: "Painting" },
//     { id: "5", name: "AC Repair" },
//     { id: "6", name: "Appliance Repair" },
//     { id: "7", name: "Computer Repair" },
//     { id: "8", name: "Mobile Repair" },
//   ];

//   useEffect(() => {
//     // Set active tab based on state
//     setActiveTab(state === "Login" ? "login" : "signup");
//     // Always reset reCAPTCHA on mount and tab switch
//     setShowRecaptcha(false);
//     setRecaptchaToken("");
//     // If coming from verification, show success message
//     if (location.state?.fromVerification) {
//       toast.success("Email verified successfully! You can now login.");
//       // Clear the state to avoid showing the message again on refresh
//       window.history.replaceState({}, document.title);
//     }
//   }, [state, location.state]);

//   const removeFile = (fileType) => {
//     if (fileType === "idProof") {
//       setIdProof(null);
//       setIdProofName("");
//     } else if (fileType === "photo") {
//       setPhoto(null);
//       setPhotoName("");
//     }
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();

//     // Validate all fields
//     const newErrors = {};
//     const newTouched = {};

//     // Validate form data fields
//     Object.keys(formData).forEach((key) => {
//       newTouched[key] = true;
//       newErrors[key] = validateField(key, formData[key]);
//     });

//     // Validate mobile and email
//     newTouched.mobile = true;
//     newErrors.mobile = validateField("mobile", mobile);
//     newTouched.email = true;
//     newErrors.email = validateField("email", email);

//     // Validate files
//     if (state === "Sign Up") {
//       if (!idProof) newErrors.idProof = "ID proof is required";
//       if (!photo) newErrors.photo = "Photo is required";
//     }

//     setTouched(newTouched);
//     setErrors(newErrors);

//     // Check if there are any errors
//     const hasErrors = Object.values(newErrors).some((error) => error !== "");

//     if (state === "Sign Up") {
//       if (hasErrors) {
//         toast.error("Please fix the validation errors before submitting.");
//         return;
//       }

//       if (!isMobileVerified) {
//         toast.error("Please verify your mobile number before submitting.");
//         return;
//       }
//       if (!isEmailVerified) {
//         toast.error("Please verify your email address before submitting.");
//         return;
//       }
//     }

//     setLoading(true);

//     try {
//       axios.defaults.withCredentials = true;

//       if (state === "Sign Up") {
//         // Create FormData for signup with files
//         const formDataToSend = new FormData();
//         formDataToSend.append("name", formData.name);
//         formDataToSend.append("email", email);
//         formDataToSend.append("password", formData.password);
//         formDataToSend.append("address", formData.address);
//         formDataToSend.append("serviceCategoryID", formData.serviceCategoryID);
//         formDataToSend.append("bankAccountNo", formData.bankAccountNo);
//         formDataToSend.append("ifscCode", formData.ifscCode);
//         formDataToSend.append("mobileNumber", mobile);

//         if (idProof) formDataToSend.append("idProof", idProof);
//         if (photo) formDataToSend.append("photo", photo);

//         const { data } = await axios.post(
//           `${backendUrl}/api/auth/register`,
//           formDataToSend
//         );

//         if (data?.success) {
//           // Instead of setting isLoggedIn to true and navigating to home,
//           // show success message and navigate to login page
//           toast.success("Registration successful! Please login to continue.");
//           setState("Login"); // Switch to login tab
//           setActiveTab("login"); // Set active tab to login
//           navigate("/login"); // Navigate to login page

//           // Reset form data
//           setFormData({
//             name: "",
//             password: "",
//             address: "",
//             serviceCategoryID: "",
//             bankAccountNo: "",
//             ifscCode: "",
//           });
//           setMobile("");
//           setEmail("");
//           setIsMobileVerified(false);
//           setIsEmailVerified(false);
//           setIdProof(null);
//           setIdProofName("");
//           setPhoto(null);
//           setPhotoName("");
//         } else {
//           toast.error(data?.message || "Registration failed");
//         }
//       } else {
//         // Login case
//         let loginPayload = {
//           email: email,
//           password: formData.password,
//         };
//         // Only send reCAPTCHA if shown and token is present
//         if (showRecaptcha && recaptchaToken) {
//           loginPayload.recaptchaToken = recaptchaToken;
//         }

//         const { data } = await axios.post(`${backendUrl}/api/auth/login`, loginPayload);

//         if (data?.success) {
//           setIsLoggedIn(true);
//           await getUserData();
//           toast.success("Login successful!");

//           setShowRecaptcha(false);
//           setRecaptchaToken("");

//           if (data.userType === "admin") {
//             navigate("/admin"); // Admins go to admin dashboard
//           } else if (data.userType === "technician") {
//             navigate("/technicion"); // Technicians go to home
//           } else {
//             navigate("/"); // Fallback for any other role
//           }
//         } else {
//           toast.error(data?.message || "Login failed");
//           // Show reCAPTCHA after first failed attempt
//           setShowRecaptcha(true);
//           // Reset reCAPTCHA widget
//           if (recaptchaRef.current) {
//             recaptchaRef.current.reset();
//             setRecaptchaToken("");
//           }
//         }
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || error.message || "Something went wrong"
//       );
//       // Show reCAPTCHA after any error on login
//       if (state === "Login") {
//         setShowRecaptcha(true);
//         if (recaptchaRef.current) {
//           recaptchaRef.current.reset();
//           setRecaptchaToken("");
//         }
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Google Login handler
//   const handleGoogleLogin = () => {
//     window.open(`${backendUrl}/api/auth/google`, "_self");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="fixed top-5 left-5">
//         <img
//           onClick={() => navigate("/")}
//           src={assets.navbarlogo}
//           alt="Logo"
//           className="w-28 cursor-pointer transition-transform hover:scale-105"
//         />
//       </div>

//       <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
//         {/* Left Side - Illustration */}
//         <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex-col justify-center items-center text-white">
//           <div className="mb-8 text-center">
//             <h2 className="text-3xl font-bold mb-2">
//               Join Our Technician Network
//             </h2>
//             <p className="opacity-90">
//               Connect with customers seeking your expertise
//             </p>
//           </div>
//           <div className="mt-8 text-center">
//             <p className="text-sm opacity-80">Already have an account?</p>
//             <button
//               onClick={() => setState("Login")}
//               className="mt-2 px-6 py-2 bg-white text-indigo-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
//             >
//               Sign In
//             </button>
//           </div>
//         </div>

//         {/* Right Side - Form */}
//         <div className="w-full md:w-3/5 p-8">
//           {/* Tab Navigation - Mobile */}
//           <div className="md:hidden flex mb-6 bg-gray-100 rounded-lg p-1">
//             <button
//               onClick={() => setState("Login")}
//               className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                 activeTab === "login"
//                   ? "bg-white text-indigo-700 shadow-sm"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               Login
//             </button>
//             <button
//               onClick={() => setState("Sign Up")}
//               className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                 activeTab === "signup"
//                   ? "bg-white text-indigo-700 shadow-sm"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               Register
//             </button>
//           </div>

//           <div className="text-center mb-8">
//             <h2 className="text-2xl font-bold text-gray-900">
//               {state === "Sign Up"
//                 ? "Create Technician Account"
//                 : "Welcome Back"}
//             </h2>
//             <p className="text-gray-600 mt-2">
//               {state === "Sign Up"
//                 ? "Fill in your details to join our network"
//                 : "Sign in to your technician account"}
//             </p>
//           </div>

//           <form onSubmit={onSubmitHandler} className="space-y-6">
//             {state === "Sign Up" && (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Full Name *
//                     </label>
//                     <div
//                       className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                         errors.name
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         onBlur={handleBlur}
//                         value={formData.name}
//                         name="name"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         placeholder="Enter your full name (letters only)"
//                         required
//                       />
//                     </div>
//                     {errors.name && (
//                       <p className="text-red-500 text-xs mt-1">{errors.name}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Service Category *
//                     </label>
//                     <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9"
//                         />
//                       </svg>
//                       <select
//                         onChange={handleInputChange}
//                         value={formData.serviceCategoryID}
//                         name="serviceCategoryID"
//                         className="w-full bg-transparent outline-none text-sm appearance-none"
//                         required
//                       >
//                         <option value="">Select specialty</option>
//                         {serviceCategories.map((category) => (
//                           <option key={category.id} value={category.id}>
//                             {category.name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Mobile Number *
//                   </label>
//                   <div className="flex gap-2">
//                     <div
//                       className={`flex items-center gap-3 flex-1 px-4 py-3 rounded-lg border transition-colors ${
//                         errors.mobile
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleMobileChange}
//                         onBlur={() => setTouched({ ...touched, mobile: true })}
//                         value={mobile}
//                         className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-500"
//                         type="tel"
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         placeholder="10-digit mobile number"
//                         maxLength={10}
//                         required
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => sendOtp("mobile")}
//                       disabled={
//                         isMobileVerified ||
//                         isSendingOtp ||
//                         mobile.length !== 10 ||
//                         errors.mobile
//                       }
//                       className={`px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
//                         isMobileVerified
//                           ? "bg-green-100 text-green-800 cursor-not-allowed"
//                           : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
//                       } ${
//                         isSendingOtp || mobile.length !== 10 || errors.mobile
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                     >
//                       {isMobileVerified
//                         ? "Verified"
//                         : isSendingOtp
//                         ? "Sending..."
//                         : "Verify"}
//                     </button>
//                   </div>
//                   {errors.mobile && (
//                     <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
//                   )}
//                   {mobile.length === 10 && !errors.mobile && (
//                     <p className="text-green-600 text-xs mt-1">
//                       ✓ Valid mobile number
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address *
//                   </label>
//                   <div
//                     className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                       errors.address
//                         ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                         : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                     }`}
//                   >
//                     <svg
//                       className="w-5 h-5 text-gray-400 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                     <input
//                       onChange={handleInputChange}
//                       onBlur={handleBlur}
//                       value={formData.address}
//                       name="address"
//                       className="w-full bg-transparent outline-none text-sm"
//                       type="text"
//                       placeholder="Your complete address"
//                       required
//                     />
//                   </div>
//                   {errors.address && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {errors.address}
//                     </p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bank Account No. *
//                     </label>
//                     <div
//                       className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                         errors.bankAccountNo
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         onBlur={handleBlur}
//                         value={formData.bankAccountNo}
//                         name="bankAccountNo"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         placeholder="Enter account number (numbers only)"
//                         maxLength={18}
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-between mt-1">
//                       {errors.bankAccountNo ? (
//                         <p className="text-red-500 text-xs">
//                           {errors.bankAccountNo}
//                         </p>
//                       ) : (
//                         formData.bankAccountNo.length > 0 && (
//                           <p className="text-gray-500 text-xs">
//                             {formData.bankAccountNo.length}/18 digits
//                           </p>
//                         )
//                       )}
//                       {formData.bankAccountNo.length > 0 &&
//                         !errors.bankAccountNo && (
//                           <p className="text-green-600 text-xs">
//                             ✓ Numbers only
//                           </p>
//                         )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       IFSC Code *
//                     </label>
//                     <div
//                       className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                         errors.ifscCode
//                           ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                           : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                       }`}
//                     >
//                       <svg
//                         className="w-5 h-5 text-gray-400 mr-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M4 6h16M4 12h16m-7 6h7"
//                         />
//                       </svg>
//                       <input
//                         onChange={handleInputChange}
//                         onBlur={handleBlur}
//                         value={formData.ifscCode}
//                         name="ifscCode"
//                         className="w-full bg-transparent outline-none text-sm"
//                         type="text"
//                         placeholder="e.g., ABCD0123456"
//                         pattern="[A-Z]{4}0[A-Z0-9]{6}"
//                         title="IFSC code format: ABCD0123456"
//                         required
//                       />
//                     </div>
//                     {errors.ifscCode && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.ifscCode}
//                       </p>
//                     )}
//                     {formData.ifscCode.length === 11 && !errors.ifscCode && (
//                       <p className="text-green-600 text-xs mt-1">
//                         ✓ Valid IFSC format
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* ID Proof Field */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       ID Proof *
//                     </label>
//                     <div
//                       onDragOver={(e) => handleDragOver(e, "idProof")}
//                       onDragLeave={(e) => handleDragLeave(e, "idProof")}
//                       onDrop={(e) => handleDrop(e, "idProof")}
//                       className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
//                     >
//                       {idProof ? (
//                         <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
//                           <span className="text-sm text-indigo-700 truncate">
//                             {idProofName}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeFile("idProof")}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : (
//                         <label htmlFor="idProof" className="cursor-pointer">
//                           <svg
//                             className="w-10 h-10 mx-auto text-gray-400 mb-2"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                             />
//                           </svg>
//                           <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
//                             Upload ID Proof
//                           </span>
//                           <p className="text-xs text-gray-500 mt-1">
//                             PDF, JPG, PNG (5MB max)
//                           </p>
//                           <input
//                             id="idProof"
//                             onChange={(e) => handleFileChange(e, "idProof")}
//                             className="hidden"
//                             type="file"
//                             accept=".pdf,.jpg,.jpeg,.png"
//                             required
//                           />
//                         </label>
//                       )}
//                     </div>
//                     {errors.idProof && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.idProof}
//                       </p>
//                     )}
//                   </div>

//                   {/* Photo Field */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Your Photo *
//                     </label>
//                     <div
//                       onDragOver={(e) => handleDragOver(e, "photo")}
//                       onDragLeave={(e) => handleDragLeave(e, "photo")}
//                       onDrop={(e) => handleDrop(e, "photo")}
//                       className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
//                     >
//                       {photo ? (
//                         <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
//                           <span className="text-sm text-indigo-700 truncate">
//                             {photoName}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => removeFile("photo")}
//                             className="text-red-500 hover:text-red-700 ml-2"
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ) : (
//                         <label htmlFor="photo" className="cursor-pointer">
//                           <svg
//                             className="w-10 h-10 mx-auto text-gray-400 mb-2"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
//                             />
//                           </svg>
//                           <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
//                             Upload Photo
//                           </span>
//                           <p className="text-xs text-gray-500 mt-1">
//                             JPG, PNG (5MB max)
//                           </p>
//                           <input
//                             id="photo"
//                             onChange={(e) => handleFileChange(e, "photo")}
//                             className="hidden"
//                             type="file"
//                             accept=".jpg,.jpeg,.png"
//                             required
//                           />
//                         </label>
//                       )}
//                     </div>
//                     {errors.photo && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.photo}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className={`${state === "Sign Up" ? "mt-2" : ""} space-y-5`}>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address *
//                 </label>
//                 <div className="flex gap-2">
//                   <div
//                     className={`flex items-center gap-3 flex-1 border rounded-lg px-4 py-3 transition-colors ${
//                       errors.email
//                         ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                         : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                     }`}
//                   >
//                     <svg
//                       className="w-5 h-5 text-gray-400 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                       />
//                     </svg>
//                     <input
//                       onChange={handleEmailChange}
//                       onBlur={() => setTouched({ ...touched, email: true })}
//                       value={email}
//                       className="w-full text-sm bg-transparent outline-none text-gray-700 placeholder-gray-500"
//                       type="email"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>
//                   {state === "Sign Up" && (
//                     <button
//                       type="button"
//                       onClick={() => sendOtp("email")}
//                       disabled={
//                         isEmailVerified ||
//                         isSendingOtp ||
//                         !email.includes("@") ||
//                         errors.email
//                       }
//                       className={`px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
//                         isEmailVerified
//                           ? "bg-green-100 text-green-800 cursor-not-allowed"
//                           : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
//                       } ${
//                         isSendingOtp || !email.includes("@") || errors.email
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                     >
//                       {isEmailVerified
//                         ? "Verified"
//                         : isSendingOtp
//                         ? "Sending..."
//                         : "Verify"}
//                     </button>
//                   )}
//                 </div>
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">{errors.email}</p>
//                 )}
//                 {email.includes("@") && !errors.email && (
//                   <p className="text-green-600 text-xs mt-1">
//                     ✓ Valid email format
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password *
//                 </label>
//                 <div
//                   className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
//                     errors.password
//                       ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
//                       : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
//                   }`}
//                 >
//                   <svg
//                     className="w-5 h-5 text-gray-400 mr-2"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                     />
//                   </svg>
//                   <input
//                     onChange={handleInputChange}
//                     onBlur={handleBlur}
//                     value={formData.password}
//                     name="password"
//                     className="w-full bg-transparent outline-none text-sm"
//                     type="password"
//                     placeholder="Min 8 chars with uppercase, lowercase, number & special character"
//                     required
//                   />
//                 </div>
//                 {errors.password && (
//                   <p className="text-red-500 text-xs mt-1">{errors.password}</p>
//                 )}
//                 {formData.password.length >= 8 && !errors.password && (
//                   <p className="text-green-600 text-xs mt-1">
//                     ✓ Strong password
//                   </p>
//                 )}
//               </div>

//               {state === "Login" && (
//                 <div className="text-right">
//                   <button
//                     type="button"
//                     onClick={() => navigate("/reset-password")}
//                     className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Conditional Google reCAPTCHA for Login only */}
//             {state === "Login" && showRecaptcha && (
//               <div className="flex justify-center mb-4">
//                 <ReCAPTCHA
//                   ref={recaptchaRef}
//                   sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
//                   onChange={token => setRecaptchaToken(token)}
//                   theme="light"
//                 />
//               </div>
//             )}
//             <button
//               type="submit"
//               disabled={loading || (state === "Login" && showRecaptcha && !recaptchaToken)}
//               className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70 shadow-md hover:shadow-lg"
//             >
//               {loading ? (
//                 <>
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   {state === "Sign Up"
//                     ? "Creating Account..."
//                     : "Signing In..."}
//                 </>
//               ) : state === "Sign Up" ? (
//                 "Create Account"
//               ) : (
//                 "Sign In"
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             {state === "Sign Up" ? (
//               <p className="text-sm text-gray-600">
//                 Already have an account?{" "}
//                 <button
//                   onClick={() => setState("Login")}
//                   className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//                 >
//                   Sign In
//                 </button>
//               </p>
//             ) : (
//               <p className="text-sm text-gray-600">
//                 Don't have an account?{" "}
//                 <button
//                   onClick={() => setState("Sign Up")}
//                   className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//                 >
//                   Register as Technician
//                 </button>
//               </p>
//             )}
//           </div>

//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">
//                 Or continue with
//               </span>
//             </div>
//           </div>

//           <button
//             onClick={handleGoogleLogin}
//             className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
//           >
//             <img src={assets.google} alt="Google" className="w-5 h-5" />
//             <span>Sign in with Google</span>
//           </button>
//         </div>
//       </div>

//       {/* OTP Verification Modal */}
//       {showOtpModal && (
//   <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//     <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
//       {/* Header */}
//       <div className="text-center mb-6">
//         <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
//           <svg 
//             className="w-8 h-8 text-indigo-300" 
//             fill="none" 
//             stroke="currentColor" 
//             viewBox="0 0 24 24"
//           >
//             <path 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               strokeWidth={2} 
//               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
//             />
//           </svg>
//         </div>
//         <h3 className="text-white text-2xl font-bold mb-2">
//           Enter Verification Code
//         </h3>
//         <p className="text-indigo-200 mb-1">
//           Enter the 6-digit code sent to{" "}
//           <span className="font-semibold text-white">
//             {verificationType === "email" ? email : mobile}
//           </span>
//         </p>
        
//         {/* Countdown Timer */}
//         {timeLeft > 0 ? (
//           <div className="flex items-center justify-center space-x-2 mt-2">
//             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
//             <p className="text-red-400 text-sm font-medium">
//               Expires in: <span className="font-bold">{formatTime(timeLeft)}</span>
//             </p>
//           </div>
//         ) : (
//           <div className="mt-2">
//             <p className="text-red-400 text-sm font-medium">
//               OTP has expired
//             </p>
//           </div>
//         )}
//       </div>

//       {/* OTP Input Fields */}
//       <div className="flex justify-between gap-3 mb-6">
//         {Array.from({ length: 6 }).map((_, index) => (
//           <input
//             key={index}
//             type="text"
//             inputMode="numeric"
//             pattern="[0-9]*"
//             maxLength={1}
//             value={otp[index] || ""}
//             onChange={(e) => handleOtpInput(e, index)}
//             onKeyDown={(e) => handleOtpKeyDown(e, index)}
//             onPaste={handleOtpPaste}
//             className="w-12 h-12 bg-slate-700 text-center text-xl font-semibold rounded-lg text-white border-2 border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
//             ref={(el) => (otpInputRefs.current[index] = el)}
//             autoFocus={index === 0}
//             disabled={timeLeft === 0} // Disable inputs when OTP expires
//           />
//         ))}
//       </div>

//       {/* Action Buttons */}
//       <div className="flex gap-3">
//         <button
//           onClick={verifyOtp}
//           disabled={otp.length !== 6 || timeLeft === 0}
//           className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
//         >
//           {timeLeft === 0 ? "OTP Expired" : "Verify Code"}
//         </button>
//         <button
//           onClick={() => {
//             setShowOtpModal(false);
//             setOtp("");
//             setVerificationId("");
//             setTimeLeft(0);
//             setCanResendOtp(false);
//             resetOtpInputs();
//           }}
//           className="flex-1 py-3.5 border border-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200"
//         >
//           Cancel
//         </button>
//       </div>

//       {/* Resend OTP Option */}
//       <div className="text-center mt-6">
//         {canResendOtp || timeLeft === 0 ? (
//           <button
//             onClick={() => sendOtp(verificationType)}
//             disabled={isSendingOtp}
//             className="text-indigo-400 hover:text-indigo-300 text-sm font-medium disabled:opacity-50 transition-colors underline"
//           >
//             {isSendingOtp ? "Sending..." : "Resend OTP"}
//           </button>
//         ) : (
//           <p className="text-slate-500 text-sm">
//             Resend OTP in <span className="font-medium">{formatTime(timeLeft)}</span>
//           </p>
//         )}
//       </div>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

import React, { useState, useContext, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { assets } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, setIsLoggedIn, getUserData, userData } =
    useContext(AppContext);

  // Check if we're coming from successful verification
  const [state, setState] = useState(
    location.state?.fromVerification ? "Login" : "Login"
  );

  // Validation functions
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
    serviceCategoryID: "",
    bankAccountNo: "",
    ifscCode: "",
    idProof: "",
    photo: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    mobile: false,
    password: false,
    address: false,
    serviceCategoryID: false,
    bankAccountNo: false,
    ifscCode: false,
  });

  // OTP Countdown states
  const [otpExpiryTime, setOtpExpiryTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    address: "",
    serviceCategoryID: "",
    bankAccountNo: "",
    ifscCode: "",
  });

  const [idProof, setIdProof] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [idProofName, setIdProofName] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const recaptchaRef = React.useRef();

  // Verification states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationType, setVerificationType] = useState(""); // 'email' or 'mobile'
  const [verificationId, setVerificationId] = useState(""); // For Firebase verification

  // Add this ref for OTP inputs
  const otpInputRefs = useRef([]);

  // Validation functions
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2)
          error = "Name must be at least 2 characters";
        else if (/[0-9]/.test(value)) error = "Name should not contain numbers";
        else if (!/^[a-zA-Z\s]*$/.test(value))
          error = "Name should only contain letters and spaces";
        break;

      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;

      case "mobile":
        if (!value) error = "Mobile number is required";
        else if (!/^\d{10}$/.test(value))
          error = "Mobile must be exactly 10 digits";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8)
          error = "Password must be at least 8 characters";
        else if (!/(?=.*[a-z])/.test(value))
          error = "Password must contain at least one lowercase letter";
        else if (!/(?=.*[A-Z])/.test(value))
          error = "Password must contain at least one uppercase letter";
        else if (!/(?=.*\d)/.test(value))
          error = "Password must contain at least one number";
        else if (!/(?=.*[@$!%*?&])/.test(value))
          error =
            "Password must contain at least one special character (@$!%*?&)";
        break;

      case "address":
        if (!value.trim()) error = "Address is required";
        break;

      case "serviceCategoryID":
        if (!value) error = "Service category is required";
        break;

      case "bankAccountNo":
        if (!value.trim()) error = "Bank account number is required";
        else if (!/^\d+$/.test(value))
          error = "Bank account should contain only numbers";
        else if (value.length < 9)
          error = "Bank account number should be at least 9 digits";
        else if (value.length > 18)
          error = "Bank account number should not exceed 18 digits";
        break;

      case "ifscCode":
        if (!value.trim()) error = "IFSC code is required";
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase()))
          error = "Invalid IFSC code format (e.g., ABCD0123456)";
        break;

      default:
        break;
    }

    return error;
  };

  // Handle input change with filtering
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let filteredValue = value;

    // Apply filters based on field type
    switch (name) {
      case "name":
        filteredValue = value.replace(/[0-9]/g, ""); // Remove numbers
        break;
      case "mobile":
        filteredValue = value.replace(/\D/g, "").slice(0, 10); // Only numbers, max 10
        break;
      case "bankAccountNo":
        filteredValue = value.replace(/\D/g, "").slice(0, 18); // Only numbers, max 18
        break;
      case "ifscCode":
        filteredValue = value.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Only uppercase letters and numbers
        break;
      default:
        filteredValue = value;
    }

    setFormData({
      ...formData,
      [name]: filteredValue,
    });

    if (touched[name]) {
      const error = validateField(name, filteredValue);
      setErrors({ ...errors, [name]: error });
    }
  };

  // Handle blur events
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });

    const error = validateField(name, formData[name]);
    setErrors({ ...errors, [name]: error });
  };

  // Special handlers for mobile and email
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(value);

    if (touched.mobile) {
      const error = validateField("mobile", value);
      setErrors({ ...errors, mobile: error });
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (touched.email) {
      const error = validateField("email", value);
      setErrors({ ...errors, email: error });
    }
  };

  // File validation
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, [fileType]: "File size must be less than 5MB" });
        return;
      }

      // Check file type
      let allowedTypes = [];
      if (fileType === "idProof") {
        allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "application/pdf",
        ];
      } else if (fileType === "photo") {
        allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      }

      if (!allowedTypes.includes(file.type)) {
        const allowedFormats =
          fileType === "idProof" ? "JPG, PNG, PDF" : "JPG, PNG";
        setErrors({
          ...errors,
          [fileType]: `Only ${allowedFormats} files are allowed`,
        });
        return;
      }

      // File is valid
      setErrors({ ...errors, [fileType]: "" });

      if (fileType === "idProof") {
        setIdProof(file);
        setIdProofName(file.name);
      } else if (fileType === "photo") {
        setPhoto(file);
        setPhotoName(file.name);
      }
    }
  };

  // Drag event handlers
  const handleDragOver = (e, fileType) => {
    e.preventDefault();
  };

  const handleDragLeave = (e, fileType) => {
    e.preventDefault();
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } }, fileType);
    }
  };

  // OTP input handlers
  const handleOtpInput = (e, index) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value) {
      const newOtp = otp.split('');
      newOtp[index] = value;
      const joinedOtp = newOtp.join('');
      setOtp(joinedOtp);
      
      // Auto-focus next input
      if (index < 5 && value) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace
        otpInputRefs.current[index - 1]?.focus();
      }
      
      const newOtp = otp.split('');
      newOtp[index] = '';
      setOtp(newOtp.join(''));
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData);
      // Focus the last input after paste
      setTimeout(() => {
        otpInputRefs.current[5]?.focus();
      }, 0);
    }
  };

  const resetOtpInputs = () => {
    setOtp('');
    otpInputRefs.current.forEach(input => {
      if (input) input.value = '';
    });
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer effect
  useEffect(() => {
    let timer;
    
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setCanResendOtp(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  // Send OTP function
  const sendOtp = async (type) => {
    setIsSendingOtp(true);
    setVerificationType(type);
    setCanResendOtp(false); // Reset resend ability

    // Reset OTP inputs when sending new OTP
    resetOtpInputs();

    try {
      let endpoint = "";
      let payload = {};

      if (type === "email") {
        if (!email) {
          toast.error("Please enter email first");
          setIsSendingOtp(false);
          return;
        }
        endpoint = "/api/auth/send-email-otp";
        payload = { email };
      } else if (type === "mobile") {
        if (!mobile) {
          toast.error("Please enter mobile number first");
          setIsSendingOtp(false);
          return;
        }
        endpoint = "/api/auth/send-mobile-otp";
        payload = { mobile };
      }

      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (data.success) {
        setShowOtpModal(true);
        
        // Set OTP expiry time (15 minutes from now)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15);
        setOtpExpiryTime(expiryTime);
        setTimeLeft(2 * 60); // 15 minutes in seconds
        setCanResendOtp(false);
        
        toast.success(`OTP sent to your ${type}`);

        // Store verification ID for mobile OTP (Firebase)
        if (type === "mobile" && data.verificationId) {
          setVerificationId(data.verificationId);
        }

        // For development - auto-fill OTP
        if (process.env.NODE_ENV === "development" && data.otp) {
          setOtp(data.otp);
        }
      } else {
        toast.error(data.message || `Failed to send ${type} OTP`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to send ${type} OTP`
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP function
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (timeLeft === 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }

    try {
      let endpoint = "";
      let payload = {};

      if (verificationType === "email") {
        endpoint = "/api/auth/verify-email-otp";
        payload = { email, otp };
      } else if (verificationType === "mobile") {
        endpoint = "/api/auth/verify-mobile-otp";
        payload = { mobile, otp, verificationId };
      }

      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (data.success) {
        if (verificationType === "email") {
          setIsEmailVerified(true);
        } else {
          setIsMobileVerified(true);
        }

        setShowOtpModal(false);
        setOtp("");
        setVerificationId("");
        setTimeLeft(0); // Reset timer
        setCanResendOtp(false);
        resetOtpInputs(); // Reset OTP inputs on success
        toast.success(`${verificationType} verified successfully!`);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to verify OTP"
      );
    }
  };

  // Predefined service categories
  const serviceCategories = [
    { id: "1", name: "Plumbing" },
    { id: "2", name: "Electrical" },
    { id: "3", name: "Carpentry" },
    { id: "4", name: "Painting" },
    { id: "5", name: "AC Repair" },
    { id: "6", name: "Appliance Repair" },
    { id: "7", name: "Computer Repair" },
    { id: "8", name: "Mobile Repair" },
  ];

  useEffect(() => {
    // Set active tab based on state
    setActiveTab(state === "Login" ? "login" : "signup");
    // Always reset reCAPTCHA on mount and tab switch
    setShowRecaptcha(false);
    setRecaptchaToken("");
    // If coming from verification, show success message
    if (location.state?.fromVerification) {
      toast.success("Email verified successfully! You can now login.");
      // Clear the state to avoid showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state, location.state]);

  const removeFile = (fileType) => {
    if (fileType === "idProof") {
      setIdProof(null);
      setIdProofName("");
    } else if (fileType === "photo") {
      setPhoto(null);
      setPhotoName("");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    const newTouched = {};

    // Validate form data fields
    Object.keys(formData).forEach((key) => {
      newTouched[key] = true;
      newErrors[key] = validateField(key, formData[key]);
    });

    // Validate mobile and email
    newTouched.mobile = true;
    newErrors.mobile = validateField("mobile", mobile);
    newTouched.email = true;
    newErrors.email = validateField("email", email);

    // Validate files
    if (state === "Sign Up") {
      if (!idProof) newErrors.idProof = "ID proof is required";
      if (!photo) newErrors.photo = "Photo is required";
    }

    setTouched(newTouched);
    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    if (state === "Sign Up") {
      if (hasErrors) {
        toast.error("Please fix the validation errors before submitting.");
        return;
      }

      if (!isMobileVerified) {
        toast.error("Please verify your mobile number before submitting.");
        return;
      }
      if (!isEmailVerified) {
        toast.error("Please verify your email address before submitting.");
        return;
      }
    }

    setLoading(true);

    try {
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        // Create FormData for signup with files
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("serviceCategoryID", formData.serviceCategoryID);
        formDataToSend.append("bankAccountNo", formData.bankAccountNo);
        formDataToSend.append("ifscCode", formData.ifscCode);
        formDataToSend.append("mobileNumber", mobile);

        if (idProof) formDataToSend.append("idProof", idProof);
        if (photo) formDataToSend.append("photo", photo);

        const { data } = await axios.post(
          `${backendUrl}/api/auth/register`,
          formDataToSend
        );

        if (data?.success) {
          // Instead of setting isLoggedIn to true and navigating to home,
          // show success message and navigate to login page
          toast.success("Registration successful! Please login to continue.");
          setState("Login"); // Switch to login tab
          setActiveTab("login"); // Set active tab to login
          navigate("/login"); // Navigate to login page

          // Reset form data
          setFormData({
            name: "",
            password: "",
            address: "",
            serviceCategoryID: "",
            bankAccountNo: "",
            ifscCode: "",
          });
          setMobile("");
          setEmail("");
          setIsMobileVerified(false);
          setIsEmailVerified(false);
          setIdProof(null);
          setIdProofName("");
          setPhoto(null);
          setPhotoName("");
        } else {
          toast.error(data?.message || "Registration failed");
        }
      } else {
        // Login case
        let loginPayload = {
          email: email,
          password: formData.password,
        };
        // Only send reCAPTCHA if shown and token is present
        if (showRecaptcha && recaptchaToken) {
          loginPayload.recaptchaToken = recaptchaToken;
        }

        const { data } = await axios.post(`${backendUrl}/api/auth/login`, loginPayload);

        if (data?.success) {
          setIsLoggedIn(true);
          await getUserData();
          toast.success("Login successful!");

          setShowRecaptcha(false);
          setRecaptchaToken("");

          if (data.userType === "admin") {
            navigate("/admin"); // Admins go to admin dashboard
          } else if (data.userType === "technician") {
            navigate("/technicion"); // Technicians go to home
          } else {
            navigate("/"); // Fallback for any other role
          }
        } else {
          toast.error(data?.message || "Login failed");
          // Show reCAPTCHA after first failed attempt
          setShowRecaptcha(true);
          // Reset reCAPTCHA widget
          if (recaptchaRef.current) {
            recaptchaRef.current.reset();
            setRecaptchaToken("");
          }
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
      // Show reCAPTCHA after any error on login
      if (state === "Login") {
        setShowRecaptcha(true);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setRecaptchaToken("");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Login handler
  const handleGoogleLogin = () => {
    window.open(`${backendUrl}/api/auth/google`, "_self");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="fixed top-5 left-5">
        <img
          onClick={() => navigate("/")}
          src={assets.navbarlogo}
          alt="Logo"
          className="w-28 cursor-pointer transition-transform hover:scale-105"
        />
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Illustration */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex-col justify-center items-center text-white">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">
              Join Our Technician Network
            </h2>
            <p className="opacity-90">
              Connect with customers seeking your expertise
            </p>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm opacity-80">Already have an account?</p>
            <button
              onClick={() => setState("Login")}
              className="mt-2 px-6 py-2 bg-white text-indigo-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-3/5 p-8">
          {/* Tab Navigation - Mobile */}
          <div className="md:hidden flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setState("Login")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setState("Sign Up")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "signup"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {state === "Sign Up"
                ? "Create Technician Account"
                : "Welcome Back"}
            </h2>
            <p className="text-gray-600 mt-2">
              {state === "Sign Up"
                ? "Fill in your details to join our network"
                : "Sign in to your technician account"}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            {state === "Sign Up" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div
                      className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
                        errors.name
                          ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                          : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <input
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        value={formData.name}
                        name="name"
                        className="w-full bg-transparent outline-none text-sm"
                        type="text"
                        placeholder="Enter your full name (letters only)"
                        required
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Category *
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9"
                        />
                      </svg>
                      <select
                        onChange={handleInputChange}
                        value={formData.serviceCategoryID}
                        name="serviceCategoryID"
                        className="w-full bg-transparent outline-none text-sm appearance-none"
                        required
                      >
                        <option value="">Select specialty</option>
                        {serviceCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <div
                      className={`flex items-center gap-3 flex-1 px-4 py-3 rounded-lg border transition-colors ${
                        errors.mobile
                          ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                          : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <input
                        onChange={handleMobileChange}
                        onBlur={() => setTouched({ ...touched, mobile: true })}
                        value={mobile}
                        className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-500"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => sendOtp("mobile")}
                      disabled={
                        isMobileVerified ||
                        isSendingOtp ||
                        mobile.length !== 10 ||
                        errors.mobile
                      }
                      className={`px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isMobileVerified
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      } ${
                        isSendingOtp || mobile.length !== 10 || errors.mobile
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isMobileVerified
                        ? "Verified"
                        : isSendingOtp
                        ? "Sending..."
                        : "Verify"}
                    </button>
                  </div>
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                  )}
                  {mobile.length === 10 && !errors.mobile && (
                    <p className="text-green-600 text-xs mt-1">
                      ✓ Valid mobile number
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div
                    className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
                      errors.address
                        ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                        : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <input
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      value={formData.address}
                      name="address"
                      className="w-full bg-transparent outline-none text-sm"
                      type="text"
                      placeholder="Your complete address"
                      required
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account No. *
                    </label>
                    <div
                      className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
                        errors.bankAccountNo
                          ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                          : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <input
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        value={formData.bankAccountNo}
                        name="bankAccountNo"
                        className="w-full bg-transparent outline-none text-sm"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter account number (numbers only)"
                        maxLength={18}
                        required
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      {errors.bankAccountNo ? (
                        <p className="text-red-500 text-xs">
                          {errors.bankAccountNo}
                        </p>
                      ) : (
                        formData.bankAccountNo.length > 0 && (
                          <p className="text-gray-500 text-xs">
                            {formData.bankAccountNo.length}/18 digits
                          </p>
                        )
                      )}
                      {formData.bankAccountNo.length > 0 &&
                        !errors.bankAccountNo && (
                          <p className="text-green-600 text-xs">
                            ✓ Numbers only
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code *
                    </label>
                    <div
                      className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
                        errors.ifscCode
                          ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                          : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16m-7 6h7"
                        />
                      </svg>
                      <input
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        value={formData.ifscCode}
                        name="ifscCode"
                        className="w-full bg-transparent outline-none text-sm"
                        type="text"
                        placeholder="e.g., ABCD0123456"
                        pattern="[A-Z]{4}0[A-Z0-9]{6}"
                        title="IFSC code format: ABCD0123456"
                        required
                      />
                    </div>
                    {errors.ifscCode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.ifscCode}
                      </p>
                    )}
                    {formData.ifscCode.length === 11 && !errors.ifscCode && (
                      <p className="text-green-600 text-xs mt-1">
                        ✓ Valid IFSC format
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID Proof Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Proof *
                    </label>
                    <div
                      onDragOver={(e) => handleDragOver(e, "idProof")}
                      onDragLeave={(e) => handleDragLeave(e, "idProof")}
                      onDrop={(e) => handleDrop(e, "idProof")}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                      {idProof ? (
                        <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
                          <span className="text-sm text-indigo-700 truncate">
                            {idProofName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile("idProof")}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="idProof" className="cursor-pointer">
                          <svg
                            className="w-10 h-10 mx-auto text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            Upload ID Proof
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG (5MB max)
                          </p>
                          <input
                            id="idProof"
                            onChange={(e) => handleFileChange(e, "idProof")}
                            className="hidden"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            required
                          />
                        </label>
                      )}
                    </div>
                    {errors.idProof && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.idProof}
                      </p>
                    )}
                  </div>

                  {/* Photo Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Photo *
                    </label>
                    <div
                      onDragOver={(e) => handleDragOver(e, "photo")}
                      onDragLeave={(e) => handleDragLeave(e, "photo")}
                      onDrop={(e) => handleDrop(e, "photo")}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                      {photo ? (
                        <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded">
                          <span className="text-sm text-indigo-700 truncate">
                            {photoName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile("photo")}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="photo" className="cursor-pointer">
                          <svg
                            className="w-10 h-10 mx-auto text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span className="block text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            Upload Photo
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG (5MB max)
                          </p>
                          <input
                            id="photo"
                            onChange={(e) => handleFileChange(e, "photo")}
                            className="hidden"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            required
                          />
                        </label>
                      )}
                    </div>
                    {errors.photo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.photo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={`${state === "Sign Up" ? "mt-2" : ""} space-y-5`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="flex gap-2">
                  <div
                    className={`flex items-center gap-3 flex-1 border rounded-lg px-4 py-3 transition-colors ${
                      errors.email
                        ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                        : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      onChange={handleEmailChange}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      value={email}
                      className="w-full text-sm bg-transparent outline-none text-gray-700 placeholder-gray-500"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {state === "Sign Up" && (
                    <button
                      type="button"
                      onClick={() => sendOtp("email")}
                      disabled={
                        isEmailVerified ||
                        isSendingOtp ||
                        !email.includes("@") ||
                        errors.email
                      }
                      className={`px-6 py-3.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        isEmailVerified
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      } ${
                        isSendingOtp || !email.includes("@") || errors.email
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isEmailVerified
                        ? "Verified"
                        : isSendingOtp
                        ? "Sending..."
                        : "Verify"}
                    </button>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
                {email.includes("@") && !errors.email && (
                  <p className="text-green-600 text-xs mt-1">
                    ✓ Valid email format
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div
                  className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
                    errors.password
                      ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                      : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    value={formData.password}
                    name="password"
                    className="w-full bg-transparent outline-none text-sm"
                    type="password"
                    placeholder="Min 8 chars with uppercase, lowercase, number & special character"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
                {formData.password.length >= 8 && !errors.password && (
                  <p className="text-green-600 text-xs mt-1">
                    ✓ Strong password
                  </p>
                )}
              </div>

              {state === "Login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {/* Conditional Google reCAPTCHA for Login only */}
            {state === "Login" && showRecaptcha && (
              <div className="flex justify-center mb-4">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={token => setRecaptchaToken(token)}
                  theme="light"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading || (state === "Login" && showRecaptcha && !recaptchaToken)}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {state === "Sign Up"
                    ? "Creating Account..."
                    : "Signing In..."}
                </>
              ) : state === "Sign Up" ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {state === "Sign Up" ? (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setState("Login")}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setState("Sign Up")}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Register as Technician
                </button>
              </p>
            )}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <img src={assets.google} alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-indigo-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">
                Enter Verification Code
              </h3>
              <p className="text-indigo-200 mb-1">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-white">
                  {verificationType === "email" ? email : mobile}
                </span>
              </p>
              
              {/* Countdown Timer */}
              {timeLeft > 0 ? (
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-400 text-sm font-medium">
                    Expires in: <span className="font-bold">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-red-400 text-sm font-medium">
                    OTP has expired
                  </p>
                </div>
              )}
            </div>

            {/* OTP Input Fields */}
            <div className="flex justify-between gap-3 mb-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => handleOtpInput(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-12 bg-slate-700 text-center text-xl font-semibold rounded-lg text-white border-2 border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  autoFocus={index === 0}
                  disabled={timeLeft === 0} // Disable inputs when OTP expires
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={verifyOtp}
                disabled={otp.length !== 6 || timeLeft === 0}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
              >
                {timeLeft === 0 ? "OTP Expired" : "Verify Code"}
              </button>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setVerificationId("");
                  setTimeLeft(0);
                  setCanResendOtp(false);
                  resetOtpInputs();
                }}
                className="flex-1 py-3.5 border border-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
            </div>

            {/* Resend OTP Option */}
            <div className="text-center mt-6">
              {canResendOtp || timeLeft === 0 ? (
                <button
                  onClick={() => sendOtp(verificationType)}
                  disabled={isSendingOtp}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium disabled:opacity-50 transition-colors underline"
                >
                  {isSendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              ) : (
                <p className="text-slate-500 text-sm">
                  Resend OTP in <span className="font-medium">{formatTime(timeLeft)}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};