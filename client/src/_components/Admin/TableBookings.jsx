import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import restoApiInstance from "../../service/api/api";
import {
  Search,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Filter,
  ArrowUpDown,
  Loader2,
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import PropTypes from "prop-types";
import MainLoader from "../Loaders/MainLoader";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";

const TableBookings = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "booking_date",
    direction: "desc",
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const dropdownRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "resto-admin-table-bookings",
      currentPage,
      pageSize,
      statusFilter,
      debouncedSearch,
      sortConfig.key,
      sortConfig.direction,
    ],
    queryFn: () =>
      restoApiInstance.getAllTableBookings(
        currentPage,
        pageSize,
        statusFilter !== "ALL" ? statusFilter : "",
        debouncedSearch,
        sortConfig.key,
        sortConfig.direction,
      ),
    keepPreviousData: true,
    staleTime: 30000,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch, sortConfig.key, sortConfig.direction]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (bookingId, e) => {
    e?.stopPropagation();
    setActiveDropdown(activeDropdown === bookingId ? null : bookingId);
  };

  const handleActionClick = async (bookingId, newStatus) => {
    console.log(bookingId);

    setActiveDropdown(null);
    setUpdatingBookingId(bookingId);

    try {
      await restoApiInstance.updateOrderStatus({
        orderId: bookingId,
        newStatus,
        component: "table_booking",
      });
      await queryClient.invalidateQueries(["resto-admin-table-bookings"]);
    } catch (error) {
      console.error("Failed to update booking status:", error);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(() =>
        Math.max(1, Math.min(page, data?.pagination?.totalPages || 1)),
      );
    },
    [data?.pagination?.totalPages],
  );

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(data?.pagination?.totalPages || 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setSortConfig({ key: "booking_date", direction: "desc" });
  };

  const exportBookings = () => {
    if (!bookings) return;
    const csvContent = [
      [
        "Table",
        "Customer",
        "Phone",
        "Date",
        "Start Time",
        "End Time",
        "Status",
        "Guests",
      ],
      ...bookings.map((booking) => [
        booking.table_number,
        booking.user_name,
        booking.phone_number,
        formatDate(booking.booking_date),
        formatTime(booking.start_time),
        formatTime(booking.end_time),
        booking.status,
        booking.guest_count || 1,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `table_bookings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && !data) return <MainLoader />;

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-8 flex flex-col items-center justify-center h-64"
      >
        <AlertCircle size={48} className="mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Failed to load bookings</h3>
        <p className="text-red-600 mb-4">Please try again later</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  const bookings = data?.bookings || [];
  const pagination = data?.pagination || {};
  const totalBookings = pagination?.total || bookings.length;
  const totalPages = pagination?.totalPages || 1;
  const from = bookings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, totalBookings);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isPastBooking = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    return bookingDate < today;
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      CONFIRMED: {
        icon: <CheckCircle size={14} />,
        label: "Confirmed",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        gradient: "from-emerald-50 to-emerald-100/50",
      },
      PENDING: {
        icon: <Clock size={14} />,
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        gradient: "from-amber-50 to-amber-100/50",
      },
      CANCELLED: {
        icon: <Ban size={14} />,
        label: "Cancelled",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        gradient: "from-rose-50 to-rose-100/50",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${config.gradient} ${config.className}`}
      >
        <span className="mr-1.5">{config.icon}</span>
        {config.label}
      </motion.span>
    );
  };

  StatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
  };

  const statusOptions = [
    { value: "ALL", label: "All Bookings", icon: Filter },
    {
      value: "PENDING",
      label: "Pending",
      icon: Clock,
      color: "text-amber-600",
    },
    {
      value: "CONFIRMED",
      label: "Confirmed",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      icon: Ban,
      color: "text-rose-600",
    },
  ];

  const getAvailableActions = (currentStatus) => {
    const actions = [];
    if (currentStatus !== "CONFIRMED") {
      actions.push({
        value: "CONFIRMED",
        label: "Confirm Booking",
        icon: CheckCircle,
        color: "text-emerald-500",
      });
    }
    if (currentStatus !== "CANCELLED") {
      actions.push({
        value: "CANCELLED",
        label: "Cancel Booking",
        icon: Ban,
        color: "text-rose-500",
      });
    }
    if (currentStatus !== "PENDING") {
      actions.push({
        value: "PENDING",
        label: "Mark as Pending",
        icon: Clock,
        color: "text-amber-500",
      });
    }
    return actions;
  };

  const columnWidths = {
    table: "w-[100px]",
    customer: "w-[200px]",
    date: "w-[120px]",
    time: "w-[150px]",
    status: "w-[120px]",
    actions: "w-[100px]",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[800px]"
    >
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Table Reservations
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track table bookings
            </p>
          </div>

          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-xs text-amber-600 font-medium">
                Pending
              </span>
              <span className="ml-2 text-sm font-bold text-amber-700">
                {pagination?.statusCounts?.PENDING || 0}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-xs text-emerald-600 font-medium">
                Confirmed
              </span>
              <span className="ml-2 text-sm font-bold text-emerald-700">
                {pagination?.statusCounts?.CONFIRMED || 0}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
              <span className="text-xs text-rose-600 font-medium">
                Cancelled
              </span>
              <span className="ml-2 text-sm font-bold text-rose-700">
                {pagination?.statusCounts?.CANCELLED || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, phone or table..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
            {isFetching && !searchTerm && (
              <Loader2
                size={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin"
              />
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[150px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={`text-gray-600 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={exportBookings}
              disabled={bookings.length === 0}
              className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Export to CSV"
            >
              <Download size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {(searchTerm ||
          statusFilter !== "ALL" ||
          sortConfig.key !== "booking_date" ||
          sortConfig.direction !== "desc") && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {statusFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                Status:{" "}
                {statusOptions.find((s) => s.value === statusFilter)?.label}
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className="hover:text-blue-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {(sortConfig.key !== "booking_date" ||
              sortConfig.direction !== "desc") && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                Sorted by: {sortConfig.key} ({sortConfig.direction})
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-shrink-0 border-b border-gray-200">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50/80">
              <tr>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.table}`}
                >
                  <button
                    onClick={() => handleSort("table_number")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    Table
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "table_number" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
                    />
                  </button>
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.customer}`}
                >
                  <button
                    onClick={() => handleSort("user_name")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    Customer
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "user_name" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
                    />
                  </button>
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.date}`}
                >
                  <button
                    onClick={() => handleSort("booking_date")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    Date
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "booking_date" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
                    />
                  </button>
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.time}`}
                >
                  <button
                    onClick={() => handleSort("start_time")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    Time
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "start_time" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
                    />
                  </button>
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.status}`}
                >
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    Status
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "status" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
                    />
                  </button>
                </th>
                <th
                  className={`px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.actions}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          <table className="w-full table-fixed">
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50/50 transition-colors group ${
                        isPastBooking(booking.booking_date) ? "opacity-60" : ""
                      }`}
                    >
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${columnWidths.table}`}
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {booking.table_number}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${columnWidths.customer}`}>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {booking.user_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {booking.phone_number}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${columnWidths.date}`}
                      >
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar size={14} className="mr-2 text-gray-500" />
                          {formatDate(booking.booking_date)}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${columnWidths.time}`}
                      >
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock size={14} className="mr-2 text-gray-500" />
                          {formatTime(booking.start_time)} -{" "}
                          {formatTime(booking.end_time)}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${columnWidths.status}`}
                      >
                        <StatusBadge status={booking.status} />
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-right relative ${columnWidths.actions}`}
                      >
                        <div ref={dropdownRef} className="inline-block">
                          <button
                            onClick={(e) =>
                              toggleDropdown(booking.id || index, e)
                            }
                            disabled={
                              updatingBookingId === (booking.id || index)
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                          >
                            {updatingBookingId === (booking.id || index) ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <MoreVertical size={18} />
                            )}
                          </button>

                          <AnimatePresence>
                            {activeDropdown === (booking.id || index) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50"
                              >
                                <div className="py-1">
                                  {getAvailableActions(booking.status).map(
                                    (action) => (
                                      <button
                                        key={action.value}
                                        onClick={() =>
                                          handleActionClick(
                                            booking.id || index,
                                            action.value,
                                          )
                                        }
                                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                      >
                                        <action.icon
                                          size={16}
                                          className={`mr-3 ${action.color}`}
                                        />
                                        {action.label}
                                      </button>
                                    ),
                                  )}
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Eye
                                      size={16}
                                      className="mr-3 text-blue-500"
                                    />
                                    View Details
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center text-gray-400"
                      >
                        <Search size={48} className="mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium text-lg">
                          No bookings found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or filter
                        </p>
                        {(searchTerm || statusFilter !== "ALL") && (
                          <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Clear Filters
                          </button>
                        )}
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {bookings.length > 0 ? from : 0}
            </span>{" "}
            to <span className="font-medium text-gray-900">{to}</span> of{" "}
            <span className="font-medium text-gray-900">{totalBookings}</span>{" "}
            bookings
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <span className="text-sm text-gray-600 mx-2">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={goToFirstPage}
                disabled={
                  currentPage === 1 || isFetching || bookings.length === 0
                }
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={
                  currentPage === 1 || isFetching || bookings.length === 0
                }
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToNextPage}
                disabled={
                  currentPage === totalPages ||
                  isFetching ||
                  bookings.length === 0
                }
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={goToLastPage}
                disabled={
                  currentPage === totalPages ||
                  isFetching ||
                  bookings.length === 0
                }
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TableBookings;
