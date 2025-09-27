import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import restoApiInstance from "../../service/api/api";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import PropTypes from "prop-types";
import MainLoader from "../Loaders/MainLoader";

const TableBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "booking_date",
    direction: "desc"
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["resto-admin-table-bookings"],
    queryFn: restoApiInstance.getAllTableBookings
  });

  if (isLoading) {
    return <MainLoader />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center justify-center h-64">
        <AlertCircle className="mr-2" />
        Error loading table bookings. Please try again later.
      </div>
    );
  }

  if (!data || !data.bookings || data.bookings.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-4 flex items-center justify-center h-64">
        No table bookings found.
      </div>
    );
  }

  const { bookings } = data;

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone_number?.includes(searchTerm) ||
      booking.table_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort bookings based on current sort configuration
  const sortedBookings = [...filteredBookings].sort((a, b) => {
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

  // Format date to a friendly format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  // Format time for display
  const formatTime = (timeString) => {
    // Convert 24-hour time format to 12-hour with AM/PM
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      CONFIRMED: {
        icon: <CheckCircle size={16} className="mr-1" />,
        className: "bg-green-100 text-green-800"
      },
      PENDING: {
        icon: <Clock size={16} className="mr-1" />,
        className: "bg-yellow-100 text-yellow-800"
      },
      CANCELLED: {
        icon: <AlertCircle size={16} className="mr-1" />,
        className: "bg-red-100 text-red-800"
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  StatusBadge.propTypes = {
    status: PropTypes.string.isRequired
  };

  // Check if a booking is in the past
  const isPastBooking = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    return bookingDate < today;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with title and search */}
      <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          Table Reservations
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search reservations..."
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
                onClick={() => requestSort("table_number")}
              >
                <div className="flex items-center">
                  Table {renderSortIcon("table_number")}
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
                onClick={() => requestSort("booking_date")}
              >
                <div className="flex items-center">
                  Date {renderSortIcon("booking_date")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("start_time")}
              >
                <div className="flex items-center">
                  Time {renderSortIcon("start_time")}
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
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBookings.length > 0 ? (
              sortedBookings.map((booking, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    isPastBooking(booking.booking_date) ? "bg-gray-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.table_number}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.user_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.phone_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      {formatDate(booking.booking_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock size={16} className="mr-2 text-gray-500" />
                      {formatTime(booking.start_time)} -{" "}
                      {formatTime(booking.end_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                >
                  No bookings found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{sortedBookings.length}</span>{" "}
          of <span className="font-medium">{bookings.length}</span> bookings
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

export default TableBookings;
