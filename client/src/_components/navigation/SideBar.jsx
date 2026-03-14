import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Utensils,
  Table,
  Clock,
  Pizza,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";
import useAuthStore from "../../store/use-auth";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { isAuthenticated, removeAccessToken } = useAuthStore();

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/table", icon: Table, label: "Book Table" },
    { path: "/menu", icon: Utensils, label: "Menu" },
    { path: "/bookings/table", icon: Clock, label: "Table Bookings" },
    { path: "/orders", icon: Pizza, label: "Order History" },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button - visible only on mobile when sidebar is collapsed */}
      {!isExpanded && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 md:hidden bg-[#ef5644] text-white p-3 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
        >
          <MenuIcon size={20} />
        </button>
      )}

      <aside
        className={`h-full bg-gradient-to-b from-[#ef5644] to-[#d04a3b] fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out shadow-2xl 
          ${isExpanded ? "w-64" : "w-20"}
          ${!isExpanded && "md:w-20"} // Always show on desktop, toggle on mobile
        `}
      >
        {/* Toggle Button - hidden on mobile when collapsed */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all z-10 hidden md:block"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft size={16} className="text-[#ef5644]" />
          ) : (
            <ChevronRight size={16} className="text-[#ef5644]" />
          )}
        </button>

        <div className="flex flex-col justify-between h-full">
          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-hidden scrollbar-thin scrollbar-thumb-white/20">
            {navItems.map((item, index) => {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center text-white w-full px-3 py-3 rounded-xl transition-all duration-200 relative group
                    ${
                      isActive ? "bg-white/20 shadow-lg" : "hover:bg-white/10"
                    }`}
                  title={!isExpanded ? item.label : ""}
                >
                  <div className={`relative ${isActive ? "scale-110" : ""}`}>
                    <item.icon size={22} className="min-w-[22px]" />
                    {isActive && (
                      <span className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full"></span>
                    )}
                  </div>

                  <span
                    className={`ml-4 whitespace-nowrap font-medium ${
                      isExpanded ? "opacity-100" : "opacity-0 w-0"
                    } transition-all duration-300 overflow-hidden`}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {isAuthenticated && (
            <div className="px-3 py-4 border-t border-white/20">
              {/* Logout Button */}

              <button
                className="flex items-center text-white/60 hover:text-white w-full px-3 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 mt-2"
                title={!isExpanded ? "Logout" : ""}
                onClick={removeAccessToken}
              >
                <LogOut size={20} className="min-w-[20px]" />

                <span
                  className={`ml-4 whitespace-nowrap text-sm ${
                    isExpanded ? "opacity-100" : "opacity-0 w-0"
                  } transition-all duration-300 overflow-hidden`}
                >
                  Logout
                </span>

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                    Logout
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default SideBar;
