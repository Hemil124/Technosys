import React, { useState, useEffect, useContext, useRef } from "react";
import { 
  Plus, 
  Edit, 
  Search, 
  Loader2,
  Package,
  CreditCard,
  Filter,
  ChevronUp,
  ChevronDown,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminSubscriptions() {
  const { backendUrl, userData } = useContext(AppContext);
  
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  
  // Form state
  const [packageForm, setPackageForm] = useState({ 
    name: "", 
    coins: "", 
    price: "", 
    description: "",
    isActive: true 
  });

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/subscription-packages`, {
        withCredentials: true
      });
      if (response.data.success) {
        setPackages(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load subscription packages");
    } finally {
      setLoading(false);
    }
  };

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return pkg.isActive;
    if (statusFilter === 'inactive') return !pkg.isActive;
    return true;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPackages = filteredPackages.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, packages]);

  // Stats calculations
  const stats = {
    total: packages.length,
    active: packages.filter(p => p.isActive).length,
    inactive: packages.filter(p => !p.isActive).length
  };

  // Modal handlers
  const handleCreatePackage = () => {
    setEditingPackage(null);
    setPackageForm({ 
      name: "", 
      coins: "", 
      price: "", 
      description: "",
      isActive: true 
    });
    setIsModalOpen(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({ 
      name: pkg.name, 
      coins: pkg.coins, 
      price: pkg.price, 
      description: pkg.description || "",
      isActive: pkg.isActive 
    });
    setIsModalOpen(true);
  };

  const handleSubmitPackage = async (e) => {
    e.preventDefault();
    
    if (!packageForm.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (!packageForm.coins || packageForm.coins < 1) {
      toast.error("Valid coins count is required");
      return;
    }

    if (!packageForm.price || packageForm.price < 0) {
      toast.error("Valid price is required");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingPackage 
        ? `${backendUrl}/api/subscription-packages/${editingPackage._id}`
        : `${backendUrl}/api/subscription-packages`;
      const method = editingPackage ? "put" : "post";

      const payload = {
        name: packageForm.name,
        coins: parseInt(packageForm.coins),
        price: parseFloat(packageForm.price),
        description: packageForm.description,
        isActive: packageForm.isActive
      };

      const response = await axios[method](url, payload, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(editingPackage ? "Package updated successfully!" : "Package created successfully!");
        setIsModalOpen(false);
        fetchPackages();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    setTogglingId(pkg._id);

    try {
      const response = await axios.patch(
        `${backendUrl}/api/subscription-packages/${pkg._id}/toggle-status`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchPackages();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating package status");
    } finally {
      setTogglingId(null);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading subscription packages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription Packages
          </h1>
          <p className="text-gray-600">
            Manage subscription packages and their pricing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Total Packages</div>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-600">Active Packages</div>
              </div>
              <ToggleRight className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.inactive}
                </div>
                <div className="text-sm text-gray-600">Inactive Packages</div>
              </div>
              <ToggleLeft className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto items-center">
              {/* <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
                Status:
              </label> */}
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={handleCreatePackage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Package</span>
              </button>
            </div>
          </div>
        </div>

        {/* Packages List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No packages found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? "Try adjusting your search terms or filters" 
                  : "Get started by creating your first subscription package"
                }
              </p>
              <button
                onClick={handleCreatePackage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Package</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedPackages.map((pkg) => (
                <div key={pkg._id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900">
                            {pkg.name}
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pkg.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {pkg.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {pkg.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <span className="text-lg font-bold text-green-500">₹</span>
                            <span>{pkg.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors"
                        title="Edit package"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(pkg)}
                        disabled={togglingId === pkg._id}
                        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
                          pkg.isActive ? 'bg-green-500' : 'bg-gray-300'
                        } ${togglingId === pkg._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={pkg.isActive ? "Deactivate" : "Activate"}
                      >
                        <span
                          className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                            pkg.isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {filteredPackages.length > 0 && (
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredPackages.length)}</span>{' '}
                of <span className="font-medium">{filteredPackages.length}</span> packages
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Package Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-[1px] flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </h2>
                
                <form onSubmit={handleSubmitPackage}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Package Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter package name"
                        disabled={submitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="coins" className="block text-sm font-medium text-gray-700 mb-1">
                          Coins *
                        </label>
                        <input
                          type="number"
                          id="coins"
                          value={packageForm.coins}
                          onChange={(e) => setPackageForm({...packageForm, coins: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          min="1"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          id="price"
                          value={packageForm.price}
                          onChange={(e) => setPackageForm({...packageForm, price: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={packageForm.description}
                        onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter package description (optional)"
                        rows="3"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>
                        {submitting 
                          ? (editingPackage ? "Updating..." : "Creating...")
                          : (editingPackage ? "Update Package" : "Create Package")
                        }
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}