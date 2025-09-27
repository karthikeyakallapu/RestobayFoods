import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useModalStore from "../../store/use-modal";
import useMenuStore from "../../store/use-menu";
import { useState } from "react";
import restoApiInstance from "../../service/api/api";
import {
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  PlusCircle,
  Filter
} from "lucide-react";

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc"
  });
  const { openModal } = useModalStore();

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["restoMenu"],
    queryFn: restoApiInstance.getMenu
  });

  const menuMutation = useMutation({
    mutationFn: async ({ action, payload }) => {
      const response = await restoApiInstance.updateMenu({
        action,
        payload
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restoMenu"] });
    },
    onError: (error) => {
      console.error("Failed to update menu:", error);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center justify-center h-64">
        <AlertCircle className="mr-2" />
        Error loading menu items. Please try again later.
      </div>
    );
  }

  if (!data || !data.menu || data.menu.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-4 flex items-center justify-center h-64">
        No menu items found.
      </div>
    );
  }

  const { menu, categories } = data;

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter menu items based on search term and category
  const filteredMenuItems = menu.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedMenuItems = [...filteredMenuItems].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // eslint-disable-next-line react/prop-types
  const AvailabilityBadge = ({ available }) => {
    return available ? (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Available
      </span>
    ) : (
      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Unavailable
      </span>
    );
  };

  // Truncate description
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Update menu function now uses the mutation
  const updateMenu = (action, payload) => {
    menuMutation.mutate({ action, payload });
  };

  const editItem = (item, action) => {
    useMenuStore.setState({ selectedItem: item });
    openModal("edititem");
    menuMutation.mutate({ action, payload: { item_id: item.id } });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with title, search and add button */}
      <div className="p-5 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Menu Management</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search menu..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="bg-[#ef5644] text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => openModal("additem")}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex overflow-x-auto">
        <div className="flex items-center mr-3">
          <Filter size={16} className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-600">Filter:</span>
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-full ${
              selectedCategory === "All"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categories &&
            categories.map((category, index) => (
              <button
                key={index}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center">
                  Item {renderSortIcon("name")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("category")}
              >
                <div className="flex items-center">
                  Category {renderSortIcon("category")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("price")}
              >
                <div className="flex items-center">
                  Price {renderSortIcon("price")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("available")}
              >
                <div className="flex items-center">
                  Status {renderSortIcon("available")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMenuItems.length > 0 ? (
              sortedMenuItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={
                              import.meta.env.VITE_BLOB_IMAGES_URL +
                              item.image_url
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {truncateText(item.description, 60)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AvailabilityBadge available={item.available} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {menuMutation.isPending &&
                      menuMutation.variables?.payload.item_id === item.id ? (
                        <span className="text-gray-400 px-2 py-1">
                          Updating...
                        </span>
                      ) : (
                        <>
                          {!item.available ? (
                            <button
                              className="text-green-400 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                              onClick={() =>
                                updateMenu("ENABLE", { item_id: item.id })
                              }
                              disabled={menuMutation.isPending}
                            >
                              Enable
                            </button>
                          ) : (
                            <button
                              className="text-red-400 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                              onClick={() =>
                                updateMenu("DISABLE", { item_id: item.id })
                              }
                              disabled={menuMutation.isPending}
                            >
                              Disable
                            </button>
                          )}

                          <button
                            className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                            disabled={menuMutation.isPending}
                            onClick={() => editItem(item, "EDIT_ITEM")}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                            disabled={menuMutation.isPending}
                            onClick={() =>
                              updateMenu("DELETE", { item_id: item.id })
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                >
                  No menu items found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{sortedMenuItems.length}</span>{" "}
          of <span className="font-medium">{menu.length}</span> menu items
        </div>
      </div>
    </div>
  );
};

export default Menu;
