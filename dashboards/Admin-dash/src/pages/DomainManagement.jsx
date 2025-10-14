import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { domainAPI, reviewsAPI } from "../services/api";
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  AlertCircle,
  Bell,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

const DomainManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exceptionalReviewsCount, setExceptionalReviewsCount] = useState(0);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("category"); // "category" or "subcategory"
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", categoryId: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories and their subcategories on load
  useEffect(() => {
    fetchCategories();
    fetchExceptionalReviewsCount();
  }, []);

  const fetchExceptionalReviewsCount = async () => {
    try {
      const reviews = await reviewsAPI.getExceptionalReviews();
      setExceptionalReviewsCount(reviews.length);
    } catch (err) {
      console.warn("Failed to fetch exceptional reviews count:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await domainAPI.getCategories();
      
      // Fetch subcategories for each category
      const categoriesWithSubs = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const subcategories = await domainAPI.getSubCategoriesByCategory(category.id);
            return {
              ...category,
              subcategories: subcategories || [],
              expanded: false,
            };
          } catch (err) {
            console.warn(`Failed to fetch subcategories for category ${category.id}:`, err);
            return {
              ...category,
              subcategories: [],
              expanded: false,
            };
          }
        })
      );
      
      setCategories(categoriesWithSubs);
      setFilteredCategories(categoriesWithSubs);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(
        categories.filter((cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, categories]);

  const toggleExpand = (id) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
    setFilteredCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  // Category handlers
  const handleOpenAddCategory = () => {
    setFormData({ name: "", categoryId: null });
    setModalType("category");
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEditCategory = (category) => {
    setFormData({ name: category.name, categoryId: null });
    setSelectedCategory(category);
    setModalType("category");
    setIsEditing(true);
    setShowModal(true);
  };

  // Subcategory handlers
  const handleOpenAddSubcategory = (category) => {
    setFormData({ name: "", categoryId: category.id });
    setSelectedCategory(category);
    setModalType("subcategory");
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEditSubcategory = (category, subcategory) => {
    setFormData({ name: subcategory.name, categoryId: category.id });
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setModalType("subcategory");
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setError(null);
      
      if (modalType === "category") {
        if (isEditing) {
          await domainAPI.updateCategory(selectedCategory.id, {
            name: formData.name,
          });
          setSuccess("Category updated successfully!");
        } else {
          await domainAPI.createCategory({ name: formData.name });
          setSuccess("Category created successfully!");
        }
      } else if (modalType === "subcategory") {
        if (isEditing) {
          await domainAPI.updateSubCategory(selectedSubcategory.id, {
            name: formData.name,
            categoryId: formData.categoryId,
          });
          setSuccess("Subcategory updated successfully!");
        } else {
          await domainAPI.createSubCategory({
            name: formData.name,
            categoryId: formData.categoryId,
          });
          setSuccess("Subcategory created successfully!");
        }
      }

      await fetchCategories();
      setShowModal(false);
      setFormData({ name: "", categoryId: null });
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } catch (err) {
      console.error("Error saving:", err);
      setError(`Failed to save ${modalType}`);
    }
  };

  const handleDelete = async () => {
    try {
      if (modalType === "category") {
        await domainAPI.deleteCategory(selectedCategory.id);
        setSuccess("Category deleted successfully!");
      } else if (modalType === "subcategory") {
        await domainAPI.deleteSubCategory(selectedSubcategory.id);
        setSuccess("Subcategory deleted successfully!");
      }

      await fetchCategories();
      setShowDeleteModal(false);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } catch (err) {
      console.error("Error deleting:", err);
      setError(`Failed to delete ${modalType}`);
    }
  };

  const openDeleteModal = (type, category, subcategory = null) => {
    setModalType(type);
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setShowDeleteModal(true);
  };

  return (
    <div className="flex-1">
      <Navbar
        title="Category Management"
        subtitle="Manage categories and their subcategories"
        icon={FolderTree}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Domain Management</h2>
            <p className="text-gray-600 mt-1">
              Manage categories and their subcategories for your platform.
            </p>
          </div>
          <button
            onClick={handleOpenAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Exceptional Reviews Notification */}
        {exceptionalReviewsCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                  <Bell size={16} className="text-amber-600" />
                </div>
                <div>
                  <h4 className="text-amber-800 font-medium">
                    New Exceptional Categories Pending
                  </h4>
                  <p className="text-amber-700 text-sm">
                    {exceptionalReviewsCount} review{exceptionalReviewsCount > 1 ? 's' : ''} contain{exceptionalReviewsCount === 1 ? 's' : ''} user-created categories that need admin review
                  </p>
                </div>
              </div>
              <Link
                to="/exceptional-reviews"
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <span>Review Now</span>
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200 mb-6 flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 text-center text-gray-600">
            Loading categories...
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200 mb-6 flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-red-600">{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category / Subcategory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCategories.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center text-gray-500 py-8 text-sm"
                    >
                      No categories found. 
                      <button 
                        onClick={handleOpenAddCategory}
                        className="text-blue-600 hover:text-blue-800 ml-1 underline"
                      >
                        Create your first category
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <React.Fragment key={category.id}>
                      {/* Category Row */}
                      <tr className="hover:bg-gray-50 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleExpand(category.id)}
                              className="mr-2 p-1 hover:bg-gray-200 rounded"
                            >
                              {category.expanded ? (
                                <ChevronDown size={16} className="text-gray-500" />
                              ) : (
                                <ChevronRight size={16} className="text-gray-500" />
                              )}
                            </button>
                            <FolderTree className="text-blue-500 mr-3" size={18} />
                            <div>
                              <span className="text-sm font-semibold text-gray-900">
                                {category.name}
                              </span>
                              <div className="text-xs text-gray-500">Category</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {category.subcategories?.length || 0} subcategories
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenAddSubcategory(category)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Add Subcategory"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit Category"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal("category", category)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Subcategories */}
                      {category.expanded && category.subcategories?.map((subcategory) => (
                        <tr key={`${category.id}-${subcategory.id}`} className="bg-gray-50 hover:bg-gray-100">
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center pl-8">
                              <Layers className="text-gray-400 mr-3" size={16} />
                              <div>
                                <span className="text-sm text-gray-800">
                                  {subcategory.name}
                                </span>
                                <div className="text-xs text-gray-500">Subcategory</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            -
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleOpenEditSubcategory(category, subcategory)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Edit Subcategory"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => openDeleteModal("subcategory", category, subcategory)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete Subcategory"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* No subcategories message */}
                      {category.expanded && (!category.subcategories || category.subcategories.length === 0) && (
                        <tr className="bg-gray-50">
                          <td colSpan="3" className="px-6 py-4 text-center">
                            <div className="text-sm text-gray-500 mb-2">
                              No subcategories in this category.
                            </div>
                            <button
                              onClick={() => handleOpenAddSubcategory(category)}
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Add the first subcategory
                            </button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={
            modalType === "category"
              ? isEditing
                ? "Edit Category"
                : "Add New Category"
              : isEditing
              ? "Edit Subcategory"
              : "Add New Subcategory"
          }
          onClose={() => {
            setShowModal(false);
            setFormData({ name: "", categoryId: null });
            setError(null);
          }}
        >
          <div className="space-y-4">
            {modalType === "subcategory" && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Parent Category
                </label>
                <div className="p-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                  {selectedCategory?.name}
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {modalType === "category" ? "Category" : "Subcategory"} Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={`Enter ${modalType} name`}
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: "", categoryId: null });
                  setError(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>
                  {isEditing ? "Update" : "Create"} {modalType === "category" ? "Category" : "Subcategory"}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <Modal 
          title={`Delete ${modalType === "category" ? "Category" : "Subcategory"}`} 
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <AlertCircle size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {modalType === "category" ? selectedCategory?.name : selectedSubcategory?.name}
                  </span>?
                </p>
                {modalType === "category" && selectedCategory?.subcategories?.length > 0 && (
                  <p className="text-sm text-red-600">
                    Warning: This category has {selectedCategory.subcategories.length} subcategories that will also be deleted.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete {modalType === "category" ? "Category" : "Subcategory"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// 🧱 Reusable modal component
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

export default DomainManagement;
