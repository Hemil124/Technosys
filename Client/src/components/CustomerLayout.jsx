// src/components/CustomerLayout.jsx
import React from "react";
import CustomerNavbar from "./CustomerNavbar";
import { Outlet } from "react-router-dom";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <CustomerNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet /> {/* Page content renders here */}
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
