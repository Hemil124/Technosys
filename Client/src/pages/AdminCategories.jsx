import React, { useState, useEffect, useContext } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { AppContext } from "../context/AppContext"; // Adjust path as needed
import axios from "axios";

export const AdminCategories = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(`${backendUrl}/api/service-categories`, {
        withCredentials: true
      });
      
      console.log("Categories API Response:", response.data); // Debug log
      
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        err.response?.data?.message || 
        "Error fetching categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search and status filter
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return category.isActive;
    if (statusFilter === 'inactive') return !category.isActive;
    return true;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Open modal for creating new category
  const handleCreateNew = () => {
    setEditingCategory(null);
    setFormData({ name: "", isActive: true });
    setIsModalOpen(true);
    setError("");
  };

  // Open modal for editing category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      isActive: category.isActive 
    });
    // set preview if image exists
    if (category.image) {
      // category.image is stored as '/uploads/categories/filename'
      setImagePreview(`${backendUrl}${category.image}`);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
    setError("");
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", isActive: true });
    setError("");
    setImageFile(null);
    setImagePreview(null);
  };

  // Submit category form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    // Image is mandatory for new categories, optional for updates
    if (!editingCategory && !imageFile && !imagePreview) {
      setError("Category image is required for new categories");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const url = editingCategory 
        ? `${backendUrl}/api/service-categories/${editingCategory._id}`
        : `${backendUrl}/api/service-categories`;
      const method = editingCategory ? "put" : "post";

      // Use FormData to send image file when present
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('isActive', formData.isActive);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const response = await axios[method](url, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess(editingCategory ? "Category updated successfully!" : "Category created successfully!");
        handleCloseModal();
        fetchCategories();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error saving category:", err);
      setError(
        err.response?.data?.message || 
        "Error saving category. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle category deletion (soft delete)
  const handleDelete = async (categoryId) => {
    // Deprecated: deletion replaced by toggle switch. Keep for compatibility.
    if (!window.confirm("Are you sure you want to deactivate this category?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/service-categories/${categoryId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess("Category deactivated successfully!");
        fetchCategories();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(
        err.response?.data?.message || 
        "Error deleting category. Please try again."
      );
    }
  };

  const handleToggleActive = async (category) => {
    const newStatus = !category.isActive;
    setTogglingId(category._id);

    // Optimistic UI update
    setCategories(prev => prev.map(c => c._id === category._id ? { ...c, isActive: newStatus } : c));

    try {
      // update endpoint requires name, so send name + isActive
      const payload = { name: category.name, isActive: newStatus };
      const response = await axios.put(
        `${backendUrl}/api/service-categories/${category._id}`,
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(newStatus ? "Category activated" : "Category deactivated");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle category error:', err);
      setError(err.response?.data?.message || err.message || 'Error updating category status');
      // revert optimistic change
      setCategories(prev => prev.map(c => c._id === category._id ? { ...c, isActive: category.isActive } : c));
    } finally {
      setTogglingId(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB");
      return;
    }

    setImageError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;

    // reuse same validation
    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB");
      return;
    }

    setImageError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Debug information (remove in production)
  console.log("Current categories state:", categories);
  console.log("Filtered categories:", filteredCategories);
  console.log("Loading state:", loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading categories...</span>
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
            Manage Categories
          </h1>
          <p className="text-gray-600">
            Add, edit, or deactivate service categories for your platform
          </p>
        </div>

        {/* Stats (clickable filters) */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`bg-white p-4 rounded-lg border ${statusFilter === 'all' ? 'border-blue-400 shadow-sm' : 'border-gray-200'} text-left`}
          >
            <div className="text-2xl font-bold text-gray-900">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`bg-white p-4 rounded-lg border ${statusFilter === 'active' ? 'border-blue-400 shadow-sm' : 'border-gray-200'} text-left`}
          >
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(c => c.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Categories</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`bg-white p-4 rounded-lg border ${statusFilter === 'inactive' ? 'border-blue-400 shadow-sm' : 'border-gray-200'} text-left`}
          >
            <div className="text-2xl font-bold text-red-600">
              {categories.filter(c => !c.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Inactive Categories</div>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
            <button 
              onClick={clearMessages}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={clearMessages}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Create New Button */}
            <button
              onClick={handleCreateNew}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredCategories.length === 0 && categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first category
              </p>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Category</span>
              </button>
            </div>
          ) : filteredCategories.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No matching categories found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {category.image && (
                              <img
                                src={`${backendUrl}${category.image}`}
                                alt={category.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Edit category"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {/* Toggle switch to activate/deactivate category (replaces delete) */}
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(category)}
                              disabled={togglingId === category._id}
                              aria-pressed={category.isActive}
                              title={category.isActive ? 'Deactivate category' : 'Activate category'}
                              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
                                category.isActive ? 'bg-green-500' : 'bg-gray-300'
                              } ${togglingId === category._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                                  category.isActive ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-700">
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter category name"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Image *
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                        dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {imageFile ? (
                        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                          <span className="text-sm text-blue-700 font-medium truncate">
                            {imageFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="text-red-500 hover:text-red-700 ml-2 font-bold text-lg"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="category-image-input" className="cursor-pointer block">
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
                          <span className="block text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Upload Category Image
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG (2MB max) {!editingCategory && <span className="text-red-600 font-medium">- Required</span>}
                          </p>
                          <input
                            id="category-image-input"
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={submitting}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {imageError && (
                      <p className="text-red-500 text-xs mt-2">
                        {imageError}
                      </p>
                    )}

                    {imagePreview && (
                      <div className="mt-3 flex justify-center">
                        <img src={imagePreview} alt="preview" className="h-24 w-24 object-cover rounded" />
                      </div>
                    )}
                  </div>
                  
                  {/* Category active state is managed via the table toggle; modal does not allow changing active state. New categories default to active. */}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
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
                        ? (editingCategory ? "Updating..." : "Creating...")
                        : (editingCategory ? "Update Category" : "Create Category")
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
  );
};