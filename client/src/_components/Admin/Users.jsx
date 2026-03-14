import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import restoApiInstance from "../../service/api/api";
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  AlertCircle,
  User,
  Filter,
  ArrowUpDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import MainLoader from "../Loaders/MainLoader";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "resto-admin-users",
      currentPage,
      pageSize,
      roleFilter,
      debouncedSearch,
      sortConfig.key,
      sortConfig.direction,
    ],
    queryFn: () =>
      restoApiInstance.getAllUsers(
        currentPage,
        pageSize,
        roleFilter !== "ALL" ? roleFilter : "",
        debouncedSearch,
        sortConfig.key,
        sortConfig.direction,
      ),
    keepPreviousData: true,
    staleTime: 30000,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, debouncedSearch, sortConfig.key, sortConfig.direction]);

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
    setRoleFilter("ALL");
    setSortConfig({ key: "name", direction: "asc" });
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

  const exportUsers = () => {
    if (!users) return;
    const csvContent = [
      ["Name", "Email", "Phone", "Role", "Verified"],
      ...users.map((user) => [
        user.name,
        user.email,
        user.phone,
        user.role || "customer",
        user.verified ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
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
        <h3 className="text-lg font-semibold mb-2">Failed to load users</h3>
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

  const users = data?.users || [];
  const pagination = data?.pagination || {};
  const totalUsers = pagination?.total || users.length;
  const totalPages = pagination?.totalPages || 1;
  const from = users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, totalUsers);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };

  const roleOptions = [
    { value: "ALL", label: "All Users", icon: Filter },
    { value: "customer", label: "Customers", icon: User },
    { value: "admin", label: "Admins", icon: User },
  ];

  const columnWidths = {
    user: "w-[300px]",
    email: "w-[300px]",
    phone: "w-[200px]",
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
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and view registered users
            </p>
          </div>

          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs text-blue-600 font-medium">Total</span>
              <span className="ml-2 text-sm font-bold text-blue-700">
                {totalUsers}
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
              placeholder="Search by name, email or phone..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[150px]"
            >
              {roleOptions.map((option) => (
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
              onClick={exportUsers}
              disabled={users.length === 0}
              className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Export to CSV"
            >
              <Download size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {(searchTerm ||
          roleFilter !== "ALL" ||
          sortConfig.key !== "name" ||
          sortConfig.direction !== "asc") && (
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
            {roleFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                Role: {roleOptions.find((r) => r.value === roleFilter)?.label}
                <button
                  onClick={() => setRoleFilter("ALL")}
                  className="hover:text-blue-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {(sortConfig.key !== "name" || sortConfig.direction !== "asc") && (
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
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.user}`}
                >
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    User
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "name" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
                    />
                  </button>
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.email}`}
                >
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    Email
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "email" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
                    />
                  </button>
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columnWidths.phone}`}
                >
                  <button
                    onClick={() => handleSort("phone")}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors group w-full"
                  >
                    Phone
                    <ArrowUpDown
                      size={14}
                      className={`transition-opacity ${sortConfig.key === "phone" ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}
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
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <motion.tr
                      key={user.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${columnWidths.user}`}
                      >
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                            style={{
                              backgroundColor: getAvatarColor(user.name),
                            }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            {user.role === "admin" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${columnWidths.email}`}
                      >
                        <div className="flex items-center text-sm text-gray-900 truncate">
                          <Mail
                            size={16}
                            className="mr-2 text-gray-500 flex-shrink-0"
                          />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${columnWidths.phone}`}
                      >
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone
                            size={16}
                            className="mr-2 text-gray-500 flex-shrink-0"
                          />
                          {user.phone}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-right ${columnWidths.actions}`}
                      >
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center text-gray-400"
                      >
                        <Search size={48} className="mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium text-lg">
                          No users found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or filter
                        </p>
                        {(searchTerm || roleFilter !== "ALL") && (
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
              {users.length > 0 ? from : 0}
            </span>{" "}
            to <span className="font-medium text-gray-900">{to}</span> of{" "}
            <span className="font-medium text-gray-900">{totalUsers}</span>{" "}
            users
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
                disabled={currentPage === 1 || isFetching || users.length === 0}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || isFetching || users.length === 0}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToNextPage}
                disabled={
                  currentPage === totalPages || isFetching || users.length === 0
                }
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={goToLastPage}
                disabled={
                  currentPage === totalPages || isFetching || users.length === 0
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

export default Users;
