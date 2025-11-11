import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const backendUrl = "http://localhost:4000";
  const navigate = useNavigate();

  // Fetch main categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/service-categories`);
        setCategories(data.categories || data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories
  const fetchSubCategories = async (categoryId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/sub-service-categories?serviceCategoryId=${categoryId}`
      );
      setSubCategories(data.subCategories || data.data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  // Combined search suggestions (categories + subcategories)
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);

    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    try {
      // Filter categories and subcategories locally (fast)
      const categoryMatches = categories.filter((cat) =>
        cat.name.toLowerCase().includes(query.toLowerCase())
      );

      // Fetch all subcategories once and cache (optional optimization)
      const { data } = await axios.get(`${backendUrl}/api/sub-service-categories`);
      const subMatches = data.subCategories?.filter((sub) =>
        sub.name.toLowerCase().includes(query.toLowerCase())
      );

      // Combine both types
      const combined = [
        ...categoryMatches.map((c) => ({ type: "category", name: c.name, id: c._id })),
        ...(subMatches || []).map((s) => ({
          type: "subcategory",
          name: s.name,
          id: s._id,
          price: s.price,
        })),
      ];

      setSuggestions(combined.slice(0, 8)); // Limit to top 8 suggestions
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Filter categories for display grid
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white py-6 shadow-md relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 md:mb-0">
            Home Services at Your Doorstep
          </h1>

          {/* Search Bar */}
          <div className="relative w-full md:w-1/2">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="text-gray-500 mr-2" size={18} />
              <input
                type="text"
                placeholder="Search for 'Salon', 'Cleaning', 'AC Repair'..."
                className="bg-transparent w-full outline-none text-gray-700"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-full z-50 max-h-60 overflow-y-auto animate-fade-in">
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery(item.name);
                      if (item.type === "category") {
                        const selected = categories.find((c) => c._id === item.id);
                        setSelectedCategory(selected);
                        fetchSubCategories(item.id);
                      } else {
                        navigate(`/customer/service/${item.id}`);
                      }
                    }}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-gray-800">{item.name}</span>
                    <span className="text-xs text-gray-500">
                      {item.type === "category" ? "Category" : "Service"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex justify-center items-center gap-2 mt-4 text-gray-700 text-sm">
        <MapPin size={16} className="text-blue-600" />
        <span>Surat, Gujarat</span>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {selectedCategory ? (
          <>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSubCategories([]);
              }}
              className="flex items-center text-gray-600 mb-4 hover:text-gray-900"
            >
              <ArrowLeft className="mr-1" size={16} /> Back to Categories
            </button>

            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
              {selectedCategory.name} Services
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {subCategories.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 cursor-pointer text-center"
                  onClick={() => navigate(`/customer/service/${sub._id}`)}
                >
                  <img
                    src={`${backendUrl}${sub.image}`}
                    alt={sub.name}
                    className="w-16 h-16 mx-auto mb-3 object-cover rounded-full"
                  />
                  <p className="font-medium text-gray-800">{sub.name}</p>
                  <p className="text-sm text-gray-500 mt-1">₹{sub.price}</p>
                </div>
              ))}
              {subCategories.length === 0 && (
                <p className="text-center text-gray-500 col-span-full">
                  No sub-services available in this category.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
              What are you looking for?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredCategories.map((cat) => (
                <div
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    fetchSubCategories(cat._id);
                  }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 cursor-pointer text-center group"
                >
                  <img
                    src={`${backendUrl}${cat.image}`}
                    alt={cat.name}
                    className="w-16 h-16 mx-auto mb-3 object-cover rounded-full group-hover:scale-110 transition-transform"
                  />
                  <p className="font-medium text-gray-800">{cat.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-10">
        <p className="text-sm">
          © {new Date().getFullYear()} Technosys | Designed with ❤️ by Team 12
        </p>
      </footer>
    </div>
  );
};

export default CustomerDashboard;
