import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Eye, EyeOff, Lock, Upload, Loader2, Save, X, Phone, Mail } from "lucide-react";

const TechnicianProfile = () => {
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({
    Name: "",
    MobileNumber: "",
    Email: "",
    Address: "",
    BankAccountNo: "",
    IFSCCode: "",
    services: "",
  });

  // Profile State
  const [profile, setProfile] = useState({
    Name: "",
    MobileNumber: "",
    Email: "",
    Address: "",
    Photo: "",
    IDProof: "",
  });

  // Bank Details State
  const [bankDetails, setBankDetails] = useState({
    BankAccountNo: "",
    IFSCCode: "",
  });

  // Services State
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // File Upload State
  const [photoFile, setPhotoFile] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);

  // Password Change Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Mobile Verification Modal
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [mobileOTPSent, setMobileOTPSent] = useState(false);
  const [mobileOTP, setMobileOTP] = useState("");
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [sendingMobileOTP, setSendingMobileOTP] = useState(false);
  const [newMobileNumber, setNewMobileNumber] = useState("");

  // Email Verification Modal
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [emailOTP, setEmailOTP] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [sendingEmailOTP, setSendingEmailOTP] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Fetch profile and services on mount
  useEffect(() => {
    fetchProfileData();
    fetchServices();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/technician/profile`, {
        withCredentials: true,
      });

      if (res.data.success) {
        const { technician, bankDetails: bd, services } = res.data.data;

        setProfile({
          Name: technician.Name || "",
          MobileNumber: technician.MobileNumber || "",
          Email: technician.Email || "",
          Address: technician.Address || "",
          Photo: technician.Photo || "",
          IDProof: technician.IDProof || "",
        });

        setBankDetails({
          BankAccountNo: bd?.BankAccountNo || "",
          IFSCCode: bd?.IFSCCode || "",
        });

        // Keep service objects with populated ServiceCategory and SubServices
        setSelectedServices(
          services.map((s) => {
            // ensure ServiceCategoryID is the populated object when possible
            const populated = s.ServiceCategoryID && s.ServiceCategoryID._id ? s.ServiceCategoryID : s.ServiceCategoryID;
            return {
              ...s,
              ServiceCategoryID: populated,
            };
          })
        );
      } else {
        toast.error(res.data.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error("Error fetching profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/service-categories`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setAllServices(res.data.data || []);
      }
    } catch (error) {
      console.error("Fetch services error:", error);
      toast.error("Error fetching services");
    }
  };

  const handleToggleService = (serviceId, serviceName) => {
    const exists = selectedServices.find(
      (s) => String(s.ServiceCategoryID) === String(serviceId)
    );

    if (exists) {
      setSelectedServices(
        selectedServices.filter(
          (s) => String(s.ServiceCategoryID) !== String(serviceId)
        )
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          ServiceCategoryID: serviceId,
          ServiceName: serviceName,
          Price: 0,
          CoinsRequired: 0,
        },
      ]);
    }
  };

  const handleServiceFieldChange = (serviceId, field, value) => {
    setSelectedServices(
      selectedServices.map((s) =>
        String(s.ServiceCategoryID) === String(serviceId)
          ? { ...s, [field]: isNaN(value) ? value : Number(value) }
          : s
      )
    );
  };

  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  // Input Filtering Functions
  const filterNameInput = (value) => {
    // Remove all numbers and special characters, keep only letters and spaces
    return value.replace(/[^a-zA-Z\s]/g, "");
  };

  const filterMobileInput = (value) => {
    // Remove all non-digit characters, keep only numbers, max 10 digits
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const filterBankAccountInput = (value) => {
    // Remove all non-digit characters, keep only numbers, max 18 digits
    return value.replace(/\D/g, "").slice(0, 18);
  };

  // Validation Helper Functions
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    if (!profile.Name || profile.Name.trim().length === 0) {
      newErrors.Name = "Name is required";
      isValid = false;
    } else if (profile.Name.trim().length < 2) {
      newErrors.Name = "Name must be at least 2 characters";
      isValid = false;
    } else if (profile.Name.length > 50) {
      newErrors.Name = "Name must not exceed 50 characters";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(profile.Name)) {
      newErrors.Name = "Name can only contain letters and spaces";
      isValid = false;
    }

    // Mobile validation
    if (profile.MobileNumber && !/^\d{10}$/.test(profile.MobileNumber.replace(/\D/g, ""))) {
      newErrors.MobileNumber = "Mobile must be 10 digits";
      isValid = false;
    }

    // Email validation
    if (profile.Email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.Email)) {
        newErrors.Email = "Please enter a valid email address";
        isValid = false;
      }
    }

    // Address validation
    if (!profile.Address || profile.Address.trim().length === 0) {
      newErrors.Address = "Address is required";
      isValid = false;
    } else if (profile.Address.trim().length < 5) {
      newErrors.Address = "Address must be at least 5 characters";
      isValid = false;
    } else if (profile.Address.length > 200) {
      newErrors.Address = "Address must not exceed 200 characters";
      isValid = false;
    }

    // Bank details validation (if provided)
    if (bankDetails.BankAccountNo && bankDetails.BankAccountNo.trim().length > 0) {
      if (!/^\d{9,18}$/.test(bankDetails.BankAccountNo.replace(/\s/g, ""))) {
        newErrors.BankAccountNo = "Bank account number must be 9-18 digits";
        isValid = false;
      }
    }

    if (bankDetails.IFSCCode && bankDetails.IFSCCode.trim().length > 0) {
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.IFSCCode.toUpperCase())) {
        newErrors.IFSCCode = "IFSC code must be in format: ABCD0123456";
        isValid = false;
      }
    }

    // Services validation - Not required since technician cannot edit services
    // Services are managed by admin only

    setErrors(newErrors);
    return isValid;
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "Name":
        if (!value || value.trim().length === 0) {
          newErrors.Name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.Name = "Name must be at least 2 characters";
        } else if (value.length > 50) {
          newErrors.Name = "Name must not exceed 50 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          newErrors.Name = "Name can only contain letters and spaces";
        } else {
          newErrors.Name = "";
        }
        break;

      case "MobileNumber":
        if (value && !/^\d{10}$/.test(value.replace(/\D/g, ""))) {
          newErrors.MobileNumber = "Mobile must be 10 digits";
        } else {
          newErrors.MobileNumber = "";
        }
        break;

      case "Email":
        if (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors.Email = "Please enter a valid email";
          } else {
            newErrors.Email = "";
          }
        }
        break;

      case "Address":
        if (!value || value.trim().length === 0) {
          newErrors.Address = "Address is required";
        } else if (value.trim().length < 5) {
          newErrors.Address = "Address must be at least 5 characters";
        } else if (value.length > 200) {
          newErrors.Address = "Address must not exceed 200 characters";
        } else {
          newErrors.Address = "";
        }
        break;

      case "BankAccountNo":
        if (value && !/^\d{9,18}$/.test(value.replace(/\s/g, ""))) {
          newErrors.BankAccountNo = "Bank account must be 9-18 digits";
        } else {
          newErrors.BankAccountNo = "";
        }
        break;

      case "IFSCCode":
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) {
          newErrors.IFSCCode = "Invalid IFSC format";
        } else {
          newErrors.IFSCCode = "";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleBankDetailsChange = (field, value) => {
    setBankDetails({ ...bankDetails, [field]: value });
  };

  const handleFileSelect = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === "photo") {
        setPhotoFile(file);
      } else if (fileType === "idProof") {
        setIdProofFile(file);
      }
    }
  };

  const handleSaveProfile = async () => {
    // Validate form before saving
    if (!validateForm()) {
      toast.error("Please fix all errors before saving");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      // Add basic profile fields
      formData.append("Name", profile.Name);
      formData.append("Address", profile.Address);
      
      // Fetch current technician data to compare
      const currentRes = await axios.get(`${backendUrl}/api/technician/profile`, {
        withCredentials: true,
      });

      const currentData = currentRes.data.data.technician;

      // Only send mobile if it changed
      if (profile.MobileNumber !== currentData.MobileNumber) {
        formData.append("MobileNumber", profile.MobileNumber);
      }

      // Only send email if it changed
      if (profile.Email !== currentData.Email) {
        formData.append("Email", profile.Email);
      }

      // Add files if selected
      if (photoFile) formData.append("photo", photoFile);
      if (idProofFile) formData.append("idProof", idProofFile);

      // Add bank details
      formData.append("bankDetails", JSON.stringify(bankDetails));

      // Note: Services are NOT sent because technicians cannot edit services
      // Services are managed by admin only

      const res = await axios.patch(
        `${backendUrl}/api/technician/profile`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Profile updated successfully");
        setPhotoFile(null);
        setIdProofFile(null);
        // Refresh profile data
        fetchProfileData();
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      toast.error(error.response?.data?.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setChangingPassword(true);
      const res = await axios.post(
        `${backendUrl}/api/technician/profile/change-password`,
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Password changed successfully");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordModal(false);
      } else {
        toast.error(res.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Error changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Mobile Verification Functions
  const handleSendMobileOTP = async () => {
    if (!newMobileNumber) {
      toast.error("Please enter mobile number");
      return;
    }

    try {
      setSendingMobileOTP(true);
      const res = await axios.post(
        `${backendUrl}/api/technician/profile/send-mobile-otp`,
        { newMobileNumber },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("OTP sent to your mobile number");
        setMobileOTPSent(true);

        // In development mode, auto-fill OTP
        if (res.data.otp) {
          setMobileOTP(res.data.otp);
        }
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send mobile OTP error:", error);
      toast.error(error.response?.data?.message || "Error sending OTP");
    } finally {
      setSendingMobileOTP(false);
    }
  };

  const handleVerifyMobileOTP = async () => {
    if (!mobileOTP) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setVerifyingMobile(true);
      const res = await axios.post(
        `${backendUrl}/api/technician/profile/verify-mobile-otp`,
        { newMobileNumber, otp: mobileOTP },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Mobile number verified successfully");
        // Update profile with new mobile number and enable the field
        setProfile({ ...profile, MobileNumber: newMobileNumber });
        setShowMobileVerification(false);
        setMobileOTPSent(false);
        setMobileOTP("");
        setNewMobileNumber("");
        // Clear mobile validation errors
        setErrors({ ...errors, MobileNumber: "" });
      } else {
        toast.error(res.data.message || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("Verify mobile OTP error:", error);
      toast.error(error.response?.data?.message || "Error verifying OTP");
    } finally {
      setVerifyingMobile(false);
    }
  };

  // Email Verification Functions
  const handleSendEmailOTP = async () => {
    if (!newEmail) {
      toast.error("Please enter email address");
      return;
    }

    try {
      setSendingEmailOTP(true);
      const res = await axios.post(
        `${backendUrl}/api/technician/profile/send-email-otp`,
        { newEmail },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("OTP sent to your email");
        setEmailOTPSent(true);

        // In development mode, auto-fill OTP
        if (res.data.otp) {
          setEmailOTP(res.data.otp);
        }
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send email OTP error:", error);
      toast.error(error.response?.data?.message || "Error sending OTP");
    } finally {
      setSendingEmailOTP(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOTP) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setVerifyingEmail(true);
      const res = await axios.post(
        `${backendUrl}/api/technician/profile/verify-email-otp`,
        { newEmail, otp: emailOTP },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Email verified successfully");
        // Update profile with new email and enable the field
        setProfile({ ...profile, Email: newEmail });
        setShowEmailVerification(false);
        setEmailOTPSent(false);
        setEmailOTP("");
        setNewEmail("");
        // Clear email validation errors
        setErrors({ ...errors, Email: "" });
      } else {
        toast.error(res.data.message || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("Verify email OTP error:", error);
      toast.error(error.response?.data?.message || "Error verifying OTP");
    } finally {
      setVerifyingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your profile information and services</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Bank Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.Name}
                    onChange={(e) => {
                      const filteredValue = filterNameInput(e.target.value);
                      handleProfileChange("Name", filteredValue);
                      validateField("Name", filteredValue);
                    }}
                    onBlur={(e) => validateField("Name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.Name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your name"
                  />
                  {errors.Name && (
                    <p className="text-red-500 text-sm mt-1">{errors.Name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={profile.MobileNumber}
                        onChange={(e) => {
                          const filteredValue = filterMobileInput(e.target.value);
                          handleProfileChange("MobileNumber", filteredValue);
                          validateField("MobileNumber", filteredValue);
                        }}
                        onBlur={(e) => validateField("MobileNumber", e.target.value)}
                        disabled
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.MobileNumber ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter 10-digit mobile number"
                      />
                      {errors.MobileNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.MobileNumber}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowMobileVerification(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition whitespace-nowrap"
                    >
                      <Phone className="w-4 h-4" />
                      Verify
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={profile.Email}
                        onChange={(e) => {
                          handleProfileChange("Email", e.target.value);
                          validateField("Email", e.target.value);
                        }}
                        onBlur={(e) => validateField("Email", e.target.value)}
                        disabled
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.Email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter valid email address"
                      />
                      {errors.Email && (
                        <p className="text-red-500 text-sm mt-1">{errors.Email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowEmailVerification(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition whitespace-nowrap"
                    >
                      <Mail className="w-4 h-4" />
                      Verify
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={profile.Address}
                    onChange={(e) => {
                      handleProfileChange("Address", e.target.value);
                      validateField("Address", e.target.value);
                    }}
                    onBlur={(e) => validateField("Address", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.Address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your complete address (min 5, max 200 characters)"
                  />
                  {errors.Address && (
                    <p className="text-red-500 text-sm mt-1">{errors.Address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.BankAccountNo}
                    onChange={(e) => {
                      const filteredValue = filterBankAccountInput(e.target.value);
                      handleBankDetailsChange("BankAccountNo", filteredValue);
                      validateField("BankAccountNo", filteredValue);
                    }}
                    onBlur={(e) => validateField("BankAccountNo", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.BankAccountNo ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="9-18 digits only"
                  />
                  {errors.BankAccountNo && (
                    <p className="text-red-500 text-sm mt-1">{errors.BankAccountNo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={bankDetails.IFSCCode}
                    onChange={(e) => {
                      handleBankDetailsChange("IFSCCode", e.target.value.toUpperCase());
                      validateField("IFSCCode", e.target.value);
                    }}
                    onBlur={(e) => validateField("IFSCCode", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.IFSCCode ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Format: ABCD0123456"
                    maxLength="11"
                  />
                  {errors.IFSCCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.IFSCCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving || Object.values(errors).some((err) => err !== "")}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
                title={Object.values(errors).some((err) => err !== "") ? "Please fix errors before saving" : "Save Changes"}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Services View Section (Read-Only) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Services</h2>
              <p className="text-gray-600 text-sm mb-4">Services are managed by admin. Contact admin to update your services.</p>

              <div className="space-y-3">
                {selectedServices && selectedServices.length > 0 ? (
                  selectedServices.map((service) => (
                    <div key={service._id || (service.ServiceCategoryID && service.ServiceCategoryID._id) || service.ServiceCategoryID} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      {/* Main Service Header */}
                      <div className="bg-blue-50 border-b border-gray-200 p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-gray-900 text-lg">{(service.ServiceCategoryID && (service.ServiceCategoryID.name || service.ServiceCategoryID.ServiceName)) || service.ServiceName || "Unknown Service"}</h3>
                          <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                      
                      {/* Sub-services List */}
                      <div className="p-4">
                        {service.SubServices && service.SubServices.length > 0 ? (
                          <div className="space-y-3">
                            {service.SubServices.map((subService, index) => (
                              <div key={subService._id || index} className="border border-gray-100 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{subService.name || subService.Name}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                  <div className="bg-white p-2 rounded border border-gray-200">
                                    <p className="text-gray-600 text-xs">Price</p>
                                    <p className="font-semibold text-gray-900">₹{subService.price || subService.Price || 0}</p>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-gray-200">
                                    <p className="text-gray-600 text-xs">Coins Required</p>
                                    <p className="font-semibold text-gray-900">{subService.coinsRequired || subService.CoinsRequired || 0}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-3">No sub-services available</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No services assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - File Uploads & Security */}
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Photo
              </h2>

              <div className="mb-4">
                {profile.Photo ? (
                  <img
                    src={`${backendUrl}${profile.Photo}`}
                    alt="Profile"
                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.src = profile.Photo;
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">No photo uploaded</span>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {photoFile ? photoFile.name : "Choose Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "photo")}
                  className="hidden"
                />
              </label>
            </div>

            {/* ID Proof Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ID Proof
              </h2>

              <div className="mb-4">
                {profile.IDProof ? (
                  <img
                    src={`${backendUrl}${profile.IDProof}`}
                    alt="ID Proof"
                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.src = profile.IDProof;
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">No ID proof uploaded</span>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {idProofFile ? idProofFile.name : "Choose ID Proof"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "idProof")}
                  className="hidden"
                />
              </label>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Security
              </h2>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium transition"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Verification Modal */}
      {showMobileVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Mobile Number
              </h2>
              <button
                onClick={() => {
                  setShowMobileVerification(false);
                  setMobileOTPSent(false);
                  setMobileOTP("");
                  setNewMobileNumber("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {!mobileOTPSent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={newMobileNumber}
                    onChange={(e) => setNewMobileNumber(filterMobileInput(e.target.value))}
                    disabled={sendingMobileOTP}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={mobileOTP}
                    onChange={(e) => setMobileOTP(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={verifyingMobile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter OTP"
                    maxLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">OTP sent to {newMobileNumber}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMobileVerification(false);
                  setMobileOTPSent(false);
                  setMobileOTP("");
                  setNewMobileNumber("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={mobileOTPSent ? handleVerifyMobileOTP : handleSendMobileOTP}
                disabled={mobileOTPSent ? verifyingMobile : sendingMobileOTP}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
              >
                {mobileOTPSent ? (
                  <>
                    {verifyingMobile && <Loader2 className="w-4 h-4 animate-spin" />}
                    {verifyingMobile ? "Verifying..." : "Verify OTP"}
                  </>
                ) : (
                  <>
                    {sendingMobileOTP && <Loader2 className="w-4 h-4 animate-spin" />}
                    {sendingMobileOTP ? "Sending..." : "Send OTP"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Email Address
              </h2>
              <button
                onClick={() => {
                  setShowEmailVerification(false);
                  setEmailOTPSent(false);
                  setEmailOTP("");
                  setNewEmail("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {!emailOTPSent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={sendingEmailOTP}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter new email address"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={emailOTP}
                    onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={verifyingEmail}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter OTP"
                    maxLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">OTP sent to {newEmail}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmailVerification(false);
                  setEmailOTPSent(false);
                  setEmailOTP("");
                  setNewEmail("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={emailOTPSent ? handleVerifyEmailOTP : handleSendEmailOTP}
                disabled={emailOTPSent ? verifyingEmail : sendingEmailOTP}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
              >
                {emailOTPSent ? (
                  <>
                    {verifyingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                    {verifyingEmail ? "Verifying..." : "Verify OTP"}
                  </>
                ) : (
                  <>
                    {sendingEmailOTP && <Loader2 className="w-4 h-4 animate-spin" />}
                    {sendingEmailOTP ? "Sending..." : "Send OTP"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Change Password
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianProfile;
