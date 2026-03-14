import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/use-auth";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import useCartStore from "@/store/use-cart";
import useModalStore from "../../store/use-modal";
import Cookies from "js-cookie";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
  const { isAuthenticated, removeAccessToken, username } = useAuthStore();
  const { cart } = useCartStore();
  const { openModal } = useModalStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = Cookies.get("role") === "admin";
  const totalItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 z-40 pl-4 w-full bg-[#fff0df] py-3"
      >
        <div className="flex justify-between items-center ml-16 px-6">
          {/* Logo with animation */}
          <Link to="/" className="group relative">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="logo-var-1 text-4xl font-bold relative"
            >
              <span className="relative z-10">RESTOBAY</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ef5644] group-hover:w-full transition-all duration-300"></span>
            </motion.h1>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Admin Dashboard */}
            {isAdmin && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/admin/dashboard">
                  <button className="relative overflow-hidden group bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white px-5 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    <span className="relative z-10 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                      Admin
                    </span>
                    <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Cart with food icon */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <button
                onClick={() => openModal("cart")}
                className="bg-white flex items-center px-4 py-2.5 rounded-xl cursor-pointer hover:shadow-xl transition-all relative group"
              >
                <div className="relative">
                  <FastfoodIcon sx={{ color: "#ef5644", fontSize: 24 }} />
                  {totalItems > 0 && (
                    <>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-[#ef5644] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                      >
                        {totalItems > 9 ? "9+" : totalItems}
                      </motion.span>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ef5644]/30"
                      />
                    </>
                  )}
                </div>
                <span className="ml-2 font-bold text-gray-700">Cart</span>
              </button>
            </motion.div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl hover:shadow-xl transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#ef5644] to-[#ff8a7a] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="font-medium text-gray-700 hidden md:block">
                    {username?.split(" ")[0] || "User"}
                  </span>
                  <motion.svg
                    animate={{ rotate: showProfileMenu ? 180 : 0 }}
                    className="w-4 h-4 text-gray-500 hidden md:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </motion.svg>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                    >
                      {/* Decorative header */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a]"></div>

                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {username || "User"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Account Settings
                        </p>
                      </div>

                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Orders
                      </Link>

                      <Link
                        to="/bookings/table"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Table Bookings
                      </Link>

                      <hr className="my-1 border-gray-100" />

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          removeAccessToken();
                          navigate("/");
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/login">
                  <button className="relative overflow-hidden group bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    <span className="relative z-10 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        ></path>
                      </svg>
                      Login
                    </span>
                    <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default NavBar;
