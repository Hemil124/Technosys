import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const CustomerProfile = () => {
  const { backendUrl, userData } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    Name: "",
    Mobile: "",
    Email: "",
    Address: "",
  });

  const loadProfile = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/customer-profile/${userData.id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setFormData({
          Name: res.data.data.Name || "",
          Mobile: res.data.data.Mobile || "",
          Email: res.data.data.Email || "",
          Address: res.data.data.Address || "",
        });
      }

      setLoading(false);
    } catch (err) {
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.id) loadProfile();
  }, [userData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put(
        `${backendUrl}/api/customer-profile/${userData.id}`,
        formData,
        { withCredentials: true }
      );

      toast.success("Profile updated");
      setFormData(res.data.data);
      setEditMode(false);
    } catch (err) {
      toast.error("Update failed");
    }

    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl p-6 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white text-indigo-700 font-bold text-3xl rounded-full flex items-center justify-center shadow-md">
            {formData.Name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{formData.Name}</h2>
            <p className="opacity-90">{formData.Email || "No Email Available"}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white shadow-xl rounded-b-xl p-6">
        {!editMode ? (
          <>
            <div className="grid grid-cols-1 gap-4 text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">Full Name</p>
                <p className="text-gray-600">{formData.Name}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">Mobile Number</p>
                <p className="text-gray-600">{formData.Mobile}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">Email Address</p>
                <p className="text-gray-600">{formData.Email || "Not Provided"}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <p className="text-gray-600">{formData.Address || "Not Provided"}</p>
              </div>
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all shadow-md"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Input Field */}
            <div className="space-y-1">
              <label className="font-semibold">Full Name</label>
              <input
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Mobile Number</label>
              <input
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.Mobile}
                onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Email</label>
              <input
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Address</label>
              <textarea
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows="3"
                value={formData.Address}
                onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all shadow-md"
                disabled={saving}
              >
                {saving ? <Loader2 className="animate-spin mx-auto" /> : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-500 transition-all shadow-md"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
