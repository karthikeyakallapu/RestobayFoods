import { useState } from "react";
import { Save, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useFormData from "@/hooks/useFormData.js";
import restoApiInstance from "../../service/api/api";
import useModalStore from "../../store/use-modal";
import Toast from "../Toasts/Toast";
import { motion } from "framer-motion";

const AddNewItem = () => {
  const {
    handleChange,
    data: formData,
    resetData,
  } = useFormData(
    {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
    },
    restoApiInstance.updateMenu,
  );

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeModal } = useModalStore();
  const queryClient = useQueryClient();

  const categories = [
    "North Indian Curries",
    "South Indian",
    "Rice & Biryani",
    "Street Food",
    "Indian Breads",
    "Desserts",
    "Beverages",
    "Other",
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size should be less than 5MB",
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload a valid image file",
      }));
      return;
    }

    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!imageFile && !imagePreview) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", imageFile);
      const imageUploadResponse =
        await restoApiInstance.uploadImage(formDataToSend);
      const image = imageUploadResponse.imageUrl;

      const updatedFormData = {
        payload: {
          ...formData,
          imageUrl: image,
        },
        action: "ADD_ITEM",
      };

      const response = await restoApiInstance.updateMenu(updatedFormData);

      if (response?.type !== "success") {
        Toast({
          type: "error",
          message: response?.message || "Failed to add item",
        });
        return;
      }

      Toast({ type: "success", message: "Item added successfully" });
      queryClient.invalidateQueries({ queryKey: ["restoMenu"] });
      resetData();
      setImageFile(null);
      setImagePreview("");
      setErrors({});
      closeModal();
    } catch (error) {
      console.error("Error uploading menu item:", error);
      Toast({ type: "error", message: "Failed to add item" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
        <h2 className="text-xl font-semibold text-white">Add New Menu Item</h2>
        <p className="text-sm text-green-100 mt-1">
          Create a new item for your menu
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleUpload} className="p-6 space-y-5">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              handleChange(e);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: "" }));
              }
            }}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-0 ${
              errors.name ? "border-red-500 bg-red-50" : "border-gray-200"
            }`}
            placeholder="Enter item name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => {
              handleChange(e);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            rows="4"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-0 ${
              errors.description
                ? "border-red-500 bg-red-50"
                : "border-gray-200"
            }`}
            placeholder="Enter item description"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Price and Category Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={(e) => {
                handleChange(e);
                if (errors.price) {
                  setErrors((prev) => ({ ...prev, price: "" }));
                }
              }}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-0 ${
                errors.price ? "border-red-500 bg-red-50" : "border-gray-200"
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => {
                handleChange(e);
                if (errors.category) {
                  setErrors((prev) => ({ ...prev, category: "" }));
                }
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-0 ${
                errors.category ? "border-red-500 bg-red-50" : "border-gray-200"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image <span className="text-red-500">*</span>
          </label>

          {imagePreview ? (
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Click the X to remove and upload a different image
              </p>
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 flex justify-center items-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          )}
          {errors.image && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.image}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              resetData();
              setImageFile(null);
              setImagePreview("");
              setErrors({});
              closeModal();
            }}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Adding...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Add Item
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddNewItem;
