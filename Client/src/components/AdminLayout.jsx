import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet /> {/* loads child pages here */}
      </div>
    </div>
  );
};

export default AdminLayout;
