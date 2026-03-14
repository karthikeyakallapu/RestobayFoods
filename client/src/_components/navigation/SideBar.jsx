import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Utensils,
  Table,
  Clock,
  Pizza,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <aside
      className={`h-full bg-[#ef5644] fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out
        ${isExpanded ? "w-60" : "w-16"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-10"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft size={18} className="text-[#ef5644]" />
        ) : (
          <ChevronRight size={18} className="text-[#ef5644]" />
        )}
      </button>

      <div className="flex flex-col items-center h-full pt-12">
        <nav className="flex flex-col items-start w-full space-y-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center text-white w-full px-4 py-3 hover:bg-red-600 transition-colors relative group"
              title={!isExpanded ? item.label : ""}
            >
              <item.icon size={24} className="min-w-6" />
              <span
                className={`ml-4 whitespace-nowrap ${
                  isExpanded ? "opacity-100" : "opacity-0 w-0"
                } transition-all duration-300 overflow-hidden`}
              >
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Optional: Add logo or brand at bottom */}
        <div className={`mt-auto mb-6 ${isExpanded ? "block" : "hidden"}`}>
          <p className="text-white/60 text-xs text-center">© 2026 RestoBay</p>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
