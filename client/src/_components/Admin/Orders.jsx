import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import restoApiInstance from "../../service/api/api";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  RefreshCw,
  XCircle,
  Slash
} from "lucide-react";
import PropTypes from "prop-types";
import { formatDate } from "../../utils/ClientUtils";
import { useQueryClient } from "@tanstack/react-query";
import MainLoader from "../Loaders/MainLoader";

const Orders = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc"
  });
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["resto-admin-orders"],
    queryFn: restoApiInstance.getAllFoodOrders
  });

  const toggleDropdown = (orderId) => {
    setActiveDropdown(activeDropdown === orderId ? null : orderId);
  };

  const handleActionClick = async (orderId, newStatus) => {
    setActiveDropdown(null);

    try {
      await restoApiInstance.updateOrderStatus({
        orderId,
        newStatus,
        component: "order"
      });

      queryClient.invalidateQueries(["resto-admin-orders"]);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".actions-dropdown")) {
      setActiveDropdown(null);
    }
  };

  // Add event listener for closing dropdown when clicking outside
  if (typeof window !== "undefined") {
    window.addEventListener("click", handleClickOutside);
  }

  if (isLoading) {
    return <MainLoader />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center justify-center h-64">
        <AlertCircle className="mr-2" />
        Error loading orders. Please try again later.
      </div>
    );
  }

  if (!data || !data.orders || data.orders.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-4 flex items-center justify-center h-64">
        No orders found.
      </div>
    );
  }

  const { orders } = data;

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone_number?.includes(searchTerm) ||
      order.id.toString().includes(searchTerm)
  );

  // Sort orders based on current sort configuration
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      PENDING: {
        icon: <Clock size={16} className="mr-1" />,
        className: "bg-yellow-100 text-yellow-800"
      },
      PAYMENT_PENDING: {
        icon: <DollarSign size={16} className="mr-1" />,
        className: "bg-blue-100 text-blue-800"
      },
      PAYMENT_FAILED: {
        icon: <XCircle size={16} className="mr-1" />,
        className: "bg-red-100 text-red-800"
      },
      PROCESSING: {
        icon: <Clock size={16} className="mr-1" />,
        className: "bg-blue-100 text-blue-800"
      },
      COMPLETED: {
        icon: <CheckCircle size={16} className="mr-1" />,
        className: "bg-green-100 text-green-800"
      },
      CANCELLED: {
        icon: <AlertCircle size={16} className="mr-1" />,
        className: "bg-red-100 text-red-800"
      },
      REFUNDED: {
        icon: <RefreshCw size={16} className="mr-1" />,
        className: "bg-purple-100 text-purple-800"
      },
      PARTIALLY_REFUNDED: {
        icon: <Slash size={16} className="mr-1" />,
        className: "bg-purple-100 text-purple-800"
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.icon}
        {status.replace("_", " ")}
      </span>
    );
  };

  StatusBadge.propTypes = {
    status: PropTypes.oneOf([
      "PENDING",
      "PAYMENT_PENDING",
      "PAYMENT_FAILED",
      "PROCESSING",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
      "PARTIALLY_REFUNDED"
    ]).isRequired
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with title and search */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Customer Orders</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                onClick={() => requestSort("id")}
              >
                <div className="flex items-center">
                  Order ID {renderSortIcon("id")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("user_name")}
              >
                <div className="flex items-center">
                  Customer {renderSortIcon("user_name")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("total_amount")}
              >
                <div className="flex items-center">
                  Amount {renderSortIcon("total_amount")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center">
                  Status {renderSortIcon("status")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("created_at")}
              >
                <div className="flex items-center">
                  Date {renderSortIcon("created_at")}
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
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.phone_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{order.total_amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <div className="actions-dropdown">
                      <button
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(order.id);
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeDropdown === order.id && (
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            {order.status !== "PENDING" && (
                              <button
                                onClick={() =>
                                  handleActionClick(order.id, "PENDING")
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Clock
                                  size={16}
                                  className="mr-2 text-yellow-500"
                                />
                                Mark as Pending
                              </button>
                            )}

                            {order.status !== "PAYMENT_PENDING" && (
                              <button
                                onClick={() =>
                                  handleActionClick(order.id, "PAYMENT_PENDING")
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <DollarSign
                                  size={16}
                                  className="mr-2 text-blue-500"
                                />
                                Mark as Payment Pending
                              </button>
                            )}

                            {order.status !== "PAYMENT_FAILED" && (
                              <button
                                onClick={() =>
                                  handleActionClick(order.id, "PAYMENT_FAILED")
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <XCircle
                                  size={16}
                                  className="mr-2 text-red-500"
                                />
                                Mark as Payment Failed
                              </button>
                            )}

                            {order.status !== "PROCESSING" && (
                              <button
                                onClick={() =>
                                  handleActionClick(order.id, "PROCESSING")
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Clock
                                  size={16}
                                  className="mr-2 text-blue-500"
                                />
                                Mark as Processing
                              </button>
                            )}

                            {order.status !== "COMPLETED" && (
                              <button
                                onClick={() =>
                                  handleActionClick(order.id, "COMPLETED")
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <CheckCircle
                                  size={16}
                                  className="mr-2 text-green-500"
                                />
                                Mark as Completed
                              </button>
                            )}

                            {order.status !== "CANCELLED" && (
                              <button
                                onClick={() =>
                                  handleActionClick(order.id, "CANCELLED")
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <AlertCircle
                                  size={16}
                                  className="mr-2 text-red-500"
                                />
                                Cancel Order
                              </button>
                            )}

                            {order.status !== "REFUNDED" && (
                              <button
                                onClick={() =>
                                  handleActionClick(order.id, "REFUNDED")
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <RefreshCw
                                  size={16}
                                  className="mr-2 text-purple-500"
                                />
                                Mark as Refunded
                              </button>
                            )}

                            {order.status !== "PARTIALLY_REFUNDED" && (
                              <button
                                onClick={() =>
                                  handleActionClick(
                                    order.id,
                                    "PARTIALLY_REFUNDED"
                                  )
                                }
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Slash
                                  size={16}
                                  className="mr-2 text-purple-500"
                                />
                                Mark as Partially Refunded
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                >
                  No orders found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{sortedOrders.length}</span> of{" "}
          <span className="font-medium">{orders.length}</span> orders
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
