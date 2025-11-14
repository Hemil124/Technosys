import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Plus,
  Edit,
  Search,
  Loader2,
  Folder,
  Package,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Filter,
  ChevronUp,
  Grid3X3,
  List,
  ToggleRight,
  ToggleLeft
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminCategories = () => {
  const { backendUrl, userData } = useContext(AppContext);

  // State for both categories and sub-categories
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state - 'service' or 'sub-service'
  const [currentView, setCurrentView] = useState('service');

  // Service Categories State
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  // Pagination for service categories
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  // Sub-Service Categories State
  const [subServiceSearchTerm, setSubServiceSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [subServiceStatusFilter, setSubServiceStatusFilter] = useState('all');
  const [showSubServiceFilters, setShowSubServiceFilters] = useState(false);
  // Pagination for sub-service categories
  const [currentSubPage, setCurrentSubPage] = useState(1);
  const [subItemsPerPage, setSubItemsPerPage] = useState(7);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", isActive: true });
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    serviceCategoryId: "",
    price: "",
    coinsRequired: "",
    description: "",
    isActive: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const categoryDropdownRef = useRef(null);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (showCategoryDropdown && categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showCategoryDropdown]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchSubCategories()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load categories data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/service-categories`, {
        withCredentials: true
      });
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error(err.response?.data?.message || "Error fetching categories");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/sub-service-categories?includeInactive=true`, {
        withCredentials: true
      });
      if (response.data.success) {
        setSubCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching sub-categories:", err);
      toast.error(err.response?.data?.message || "Error fetching sub-categories");
    }
  };

  // Service Categories Functions
  const getSubCategoriesCount = (categoryId) => {
    return subCategories.filter(sub => sub.serviceCategoryId === categoryId).length;
  };

  const getActiveSubCategoriesCount = (categoryId) => {
    return subCategories.filter(sub =>
      sub.serviceCategoryId === categoryId && sub.isActive
    ).length;
  };

  const filteredServiceCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(serviceSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (serviceStatusFilter === 'all') return true;
    if (serviceStatusFilter === 'active') return category.isActive;
    if (serviceStatusFilter === 'inactive') return !category.isActive;
    return true;
  });

  // Pagination calculations for service categories
  const totalPages = Math.max(1, Math.ceil(filteredServiceCategories.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServiceCategories = filteredServiceCategories.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search/filter/category list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [serviceSearchTerm, serviceStatusFilter, categories]);

  // Ensure current page is within bounds when filtered list or items per page changes
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(filteredServiceCategories.length / itemsPerPage));
    if (currentPage > newTotal) setCurrentPage(newTotal);
  }, [filteredServiceCategories.length, itemsPerPage, currentPage]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Sub-Service Categories Functions
  const filteredSubCategories = subCategories.filter(subCategory => {
    const matchesSearch = subCategory.name.toLowerCase().includes(subServiceSearchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (categoryFilter && subCategory.serviceCategoryId !== categoryFilter) {
      return false;
    }

    if (subServiceStatusFilter === 'active') return subCategory.isActive;
    if (subServiceStatusFilter === 'inactive') return !subCategory.isActive;

    return true;
  });

  // Pagination calculations for sub-service categories
  const totalSubPages = Math.max(1, Math.ceil(filteredSubCategories.length / subItemsPerPage));
  const subStartIndex = (currentSubPage - 1) * subItemsPerPage;
  const paginatedSubCategories = filteredSubCategories.slice(subStartIndex, subStartIndex + subItemsPerPage);

  // Reset to first page when sub-service filters/search/list changes
  useEffect(() => {
    setCurrentSubPage(1);
  }, [subServiceSearchTerm, categoryFilter, subServiceStatusFilter, subCategories]);

  // Ensure current sub page is within bounds when filtered list or items per page changes
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(filteredSubCategories.length / subItemsPerPage));
    if (currentSubPage > newTotal) setCurrentSubPage(newTotal);
  }, [filteredSubCategories.length, subItemsPerPage, currentSubPage]);

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Stats calculations
  const serviceStats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
    totalSubs: subCategories.length
  };

  const subServiceStats = {
    total: subCategories.length,
    active: subCategories.filter(s => s.isActive).length,
    inactive: subCategories.filter(s => !s.isActive).length
  };

  // Modal Handlers - Service Categories
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", isActive: true });
    setImageFile(null);
    setImagePreview(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      isActive: category.isActive
    });
    if (category.image) {
      setImagePreview(`${backendUrl}${category.image}`);
    } else {
      setImagePreview(null);
    }
    setIsCategoryModalOpen(true);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!editingCategory && !imageFile) {
      toast.error("Category image is required for new categories");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingCategory
        ? `${backendUrl}/api/service-categories/${editingCategory._id}`
        : `${backendUrl}/api/service-categories`;
      const method = editingCategory ? "put" : "post";

      const payload = new FormData();
      payload.append('name', categoryForm.name);
      payload.append('isActive', categoryForm.isActive);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const response = await axios[method](url, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(editingCategory ? "Category updated successfully!" : "Category created successfully!");
        setIsCategoryModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving category");
    } finally {
      setSubmitting(false);
    }
  };

  // Modal Handlers - Sub Service Categories
  const handleCreateSubCategory = () => {
    setEditingSubCategory(null);
    setSubCategoryForm({
      name: "",
      serviceCategoryId: "",
      price: "",
      coinsRequired: "",
      isActive: true
    });
    setImageFile(null);
    setImagePreview(null);
    setIsSubCategoryModalOpen(true);
  };

  const handleEditSubCategory = (subCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({
      name: subCategory.name,
      serviceCategoryId: subCategory.serviceCategoryId,
      price: subCategory.price,
      coinsRequired: subCategory.coinsRequired,
      description: subCategory.description || "",
      isActive: subCategory.isActive
    });
    if (subCategory.image) {
      setImagePreview(`${backendUrl}${subCategory.image}`);
    } else {
      setImagePreview(null);
    }
    setIsSubCategoryModalOpen(true);
  };

  const handleSubmitSubCategory = async (e) => {
    e.preventDefault();

    if (!subCategoryForm.name.trim()) {
      toast.error("Sub-category name is required");
      return;
    }

    if (!subCategoryForm.serviceCategoryId) {
      toast.error("Please select a parent category");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingSubCategory
        ? `${backendUrl}/api/sub-service-categories/${editingSubCategory._id}`
        : `${backendUrl}/api/sub-service-categories`;
      const method = editingSubCategory ? "put" : "post";

      const payload = new FormData();
      payload.append('name', subCategoryForm.name);
      payload.append('serviceCategoryId', subCategoryForm.serviceCategoryId);
      payload.append('price', subCategoryForm.price);
      payload.append('description', subCategoryForm.description || "");
      payload.append('coinsRequired', subCategoryForm.coinsRequired);
      payload.append('isActive', subCategoryForm.isActive);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const response = await axios[method](url, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(editingSubCategory ? "Sub-category updated!" : "Sub-category created!");
        setIsSubCategoryModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving sub-category");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (item, type) => {
    const newStatus = !item.isActive;
    setTogglingId(item._id);

    try {
      if (type === 'category') {
        const payload = { name: item.name, isActive: newStatus };
        await axios.put(
          `${backendUrl}/api/service-categories/${item._id}`,
          payload,
          { withCredentials: true }
        );

        // Refresh all data to get updated sub-categories
        await fetchAllData();

      } else {
        const payload = {
          name: item.name,
          price: item.price,
          coinsRequired: item.coinsRequired,
          isActive: newStatus
        };
        await axios.put(
          `${backendUrl}/api/sub-service-categories/${item._id}`,
          payload,
          { withCredentials: true }
        );
        setSubCategories(prev => prev.map(s => s._id === item._id ? { ...s, isActive: newStatus } : s));
      }
      toast.success(newStatus ? "Item activated!" : "Item deactivated!");
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setTogglingId(null);
    }
  };

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

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


 // 🔥 PREMIUM Pagination (Black Active Button)
const Pagination = ({ page, totalPages, onPageChange }) => {
  const getPages = () => {
    let pages = [];

    // Always show page 1
    pages.push(1);

    if (page > 3) pages.push("left-gap");

    // Middle pages
    for (let p = page - 1; p <= page + 1; p++) {
      if (p > 1 && p < totalPages) pages.push(p);
    }

    if (page < totalPages - 2) pages.push("right-gap");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4 select-none">
      
      {/* PREV */}
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={`px-4 py-2 rounded-xl border text-sm transition-all duration-200
          ${page === 1 
            ? "opacity-40 cursor-not-allowed" 
            : "hover:bg-gray-100 shadow-sm"}`}
      >
        Prev
      </button>

      {/* PAGE BUTTONS */}
      {getPages().map((p, i) =>
        p === "left-gap" || p === "right-gap" ? (
          <span key={i} className="px-3 py-2 text-gray-500">…</span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm border transition-all
              ${p === page 
                ? "bg-gray-900 text-white shadow-md scale-110 border-gray-900" 
                : "hover:bg-gray-100 text-gray-700 border-gray-300"}`}
          >
            {p}
          </button>
        )
      )}

      {/* NEXT */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={`px-4 py-2 rounded-xl border text-sm transition-all duration-200
          ${page === totalPages 
            ? "opacity-40 cursor-not-allowed" 
            : "hover:bg-gray-100 shadow-sm"}`}
      >
        Next
      </button>

    </div>
  );
};



  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service & Sub-Service Categories
          </h1>
          <p className="text-gray-600">
            Manage all service categories and their sub-categories in one place
          </p>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
            <button
              onClick={() => setCurrentView('service')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${currentView === 'service'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Folder className="h-4 w-4" />
              <span>Service Categories</span>
            </button>
            <button
              onClick={() => setCurrentView('sub-service')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${currentView === 'sub-service'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Sub Service Categories</span>
            </button>
          </div>
        </div>

        {/* SERVICE CATEGORIES VIEW */}
        {currentView === 'service' && (
          <>
            {/* Service Categories Stats */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {serviceStats.total}
                    </div>
                    <div className="text-sm text-gray-600">Total Categories</div>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {serviceStats.active}
                    </div>
                    <div className="text-sm text-gray-600">Active Categories</div>
                  </div>
                  <ToggleRight className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {serviceStats.inactive}
                    </div>
                    <div className="text-sm text-gray-600">Inactive Categories</div>
                  </div>
                  <ToggleLeft className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Service Categories Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search service categories..."
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto items-center">
                  <select
                    value={serviceStatusFilter}
                    onChange={(e) => setServiceStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>

                  <button
                    onClick={handleCreateCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Service Category</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Service Categories List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {filteredServiceCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No categories found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {serviceSearchTerm ? "Try adjusting your search terms" : "Get started by creating your first category"}
                  </p>
                  <button
                    onClick={handleCreateCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Service Category</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {paginatedServiceCategories.map((category) => {
                    const isExpanded = expandedCategories.has(category._id);
                    const subCount = getSubCategoriesCount(category._id);
                    const activeSubCount = getActiveSubCategoriesCount(category._id);

                    return (
                      <div key={category._id} className="hover:bg-gray-50">
                        {/* Category Row */}
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {category.image ? (
                              <img
                                src={`${backendUrl}${category.image}`}
                                alt={category.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Folder className="h-6 w-6 text-gray-500" />
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </div>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                                >
                                  {category.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors"
                              title="Edit category"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleToggleActive(category, 'category')}
                              disabled={togglingId === category._id}
                              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${category.isActive ? 'bg-green-500' : 'bg-gray-300'
                                } ${togglingId === category._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${category.isActive ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Pagination Footer */}
              {filteredServiceCategories.length > 0 && (
                <div className="py-6 bg-white flex justify-center">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                  />
                </div>
              )}


            </div>
          </>
        )}

        {/* SUB SERVICE CATEGORIES VIEW */}
        {currentView === 'sub-service' && (
          <>
            {/* Sub Service Categories Stats */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {subServiceStats.total}
                    </div>
                    <div className="text-sm text-gray-600">Total Sub Categories</div>
                  </div>
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {subServiceStats.active}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <ToggleRight className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {subServiceStats.inactive}
                    </div>
                    <div className="text-sm text-gray-600">Inactive</div>
                  </div>
                  <ToggleLeft className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Sub Service Categories Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col gap-4">
                {/* Top Row - Search and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search sub-categories..."
                      value={subServiceSearchTerm}
                      onChange={(e) => setSubServiceSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowSubServiceFilters(!showSubServiceFilters)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                      {showSubServiceFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleCreateSubCategory}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Sub Category</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                {showSubServiceFilters && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                    {/* Category Filter Dropdown - Searchable */}
                    <div className="flex-1 relative">
                      <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Category
                      </label>
                      <div className="relative" ref={categoryDropdownRef}>
                        <input
                          type="text"
                          placeholder="Search or select category..."
                          value={categorySearchTerm}
                          onChange={(e) => {
                            setCategorySearchTerm(e.target.value);
                            setShowCategoryDropdown(true);
                          }}
                          onFocus={() => setShowCategoryDropdown(true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />

                        {/* Dropdown Menu */}
                        {showCategoryDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            <div
                              onClick={() => {
                                setCategoryFilter("");
                                setCategorySearchTerm("");
                                setShowCategoryDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                            >
                              All Categories
                            </div>
                            {categories
                              .filter(c => c.isActive && c.name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                              .map(category => (
                                <div
                                  key={category._id}
                                  onClick={() => {
                                    setCategoryFilter(category._id);
                                    setCategorySearchTerm(category.name);
                                    setShowCategoryDropdown(false);
                                  }}
                                  className={`px-3 py-2 hover:bg-blue-50 cursor-pointer ${categoryFilter === category._id ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700'
                                    }`}
                                >
                                  {category.name}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1">
                      <label htmlFor="subServiceStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Status
                      </label>
                      <select
                        id="subServiceStatusFilter"
                        value={subServiceStatusFilter}
                        onChange={(e) => setSubServiceStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sub Service Categories List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {filteredSubCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No sub-categories found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {subServiceSearchTerm || categoryFilter || subServiceStatusFilter !== 'all'
                      ? "Try adjusting your filters"
                      : "Get started by creating your first sub-category"
                    }
                  </p>
                  <button
                    onClick={handleCreateSubCategory}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Sub Category</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {paginatedSubCategories.map((subCategory) => (
                    <div key={subCategory._id} className="hover:bg-gray-50">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {subCategory.image ? (
                            <img
                              src={`${backendUrl}${subCategory.image}`}
                              alt={subCategory.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Grid3X3 className="h-6 w-6 text-gray-500" />
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="text-sm font-medium text-gray-900">
                                {subCategory.name}
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subCategory.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {subCategory.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Parent: {getCategoryName(subCategory.serviceCategoryId)} •
                              ₹{subCategory.price} • {subCategory.coinsRequired} coins
                            </div>
                            {subCategory.description && (
                              <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {subCategory.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSubCategory(subCategory)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors"
                            title="Edit sub-category"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(subCategory, 'subCategory')}
                            disabled={togglingId === subCategory._id}
                            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${subCategory.isActive ? 'bg-green-500' : 'bg-gray-300'
                              } ${togglingId === subCategory._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${subCategory.isActive ? 'translate-x-5' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination Footer for Sub-Categories */}
              {filteredSubCategories.length > 0 && (
                <div className="py-6 bg-white flex justify-center  ">
                  <Pagination
                    page={currentSubPage}
                    totalPages={totalSubPages}
                    onPageChange={(p) => setCurrentSubPage(p)}
                  />
                </div>
              )}


            </div>
          </>
        )}

        {/* Service Category Modal */}
        {isCategoryModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsCategoryModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>

                <form onSubmit={handleSubmitCategory}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter category name"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image {!editingCategory && "*"}
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer border-gray-300 hover:border-blue-400`}
                      >
                        {imagePreview ? (
                          <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                            <span className="text-sm text-blue-700 font-medium truncate">
                              Image selected
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
                              Drop image here or click to upload — JPG, PNG (2MB max) {!editingCategory && <span className="text-red-600 font-medium">- Required</span>}
                            </p>
                            <input
                              id="category-image-input"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={submitting}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {imagePreview && (
                        <div className="mt-3 flex justify-center">
                          <img src={imagePreview} alt="preview" className="h-24 w-24 object-cover rounded" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
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

        {/* Sub Category Modal */}
        {isSubCategoryModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsSubCategoryModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingSubCategory ? "Edit Sub-Category" : "Create New Sub-Category"}
                </h2>

                <form onSubmit={handleSubmitSubCategory}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Category *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search or select category..."
                          value={subCategoryForm.serviceCategoryId ? categories.find(c => c._id === subCategoryForm.serviceCategoryId)?.name || "" : ""}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                          disabled={submitting}
                        />
                        <select
                          value={subCategoryForm.serviceCategoryId}
                          onChange={(e) => setSubCategoryForm({ ...subCategoryForm, serviceCategoryId: e.target.value })}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                          disabled={submitting}
                        >
                          <option value="">Select a category</option>
                          {categories.filter(c => c.isActive).map(category => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-Category Name *
                      </label>
                      <input
                        type="text"
                        id="subCategoryName"
                        value={subCategoryForm.name}
                        onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter sub-category name"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="subCategoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="subCategoryDescription"
                        value={subCategoryForm.description}
                        onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Short description about this sub-category (optional)"
                        rows={3}
                        disabled={submitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          id="price"
                          value={subCategoryForm.price}
                          onChange={(e) => setSubCategoryForm({ ...subCategoryForm, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="coinsRequired" className="block text-sm font-medium text-gray-700 mb-1">
                          Coins Required
                        </label>
                        <input
                          type="number"
                          id="coinsRequired"
                          value={subCategoryForm.coinsRequired}
                          onChange={(e) => setSubCategoryForm({ ...subCategoryForm, coinsRequired: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          min="0"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub-Category Image
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer border-gray-300 hover:border-blue-400`}
                      >
                        {imagePreview ? (
                          <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                            <span className="text-sm text-blue-700 font-medium truncate">
                              Image selected
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
                          <label htmlFor="subcategory-image-input" className="cursor-pointer block">
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
                              Upload Sub-Category Image
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Drop image here or click to upload — JPG, PNG (2MB max)
                            </p>
                            <input
                              id="subcategory-image-input"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={submitting}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {imagePreview && (
                        <div className="mt-3 flex justify-center">
                          <img src={imagePreview} alt="preview" className="h-24 w-24 object-cover rounded" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsSubCategoryModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>
                        {submitting
                          ? (editingSubCategory ? "Updating..." : "Creating...")
                          : (editingSubCategory ? "Update Sub-Category" : "Create Sub-Category")
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
};