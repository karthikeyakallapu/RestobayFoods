import { useState, useEffect, useRef } from "react";
import useMenuStore from "../../store/use-menu";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { X } from "lucide-react";

const MenuBar = () => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    setSearch,
    search,
  } = useMenuStore();

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const categoriesRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Sync local search input with store search
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Check scrollable categories
  useEffect(() => {
    const checkScrollable = () => {
      if (categoriesRef.current) {
        const container = categoriesRef.current;
        const isOverflowing = container.scrollWidth > container.clientWidth;
        setShowRightArrow(isOverflowing);
        setShowLeftArrow(container.scrollLeft > 0);
      }
    };
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [categories]);

  const handleScroll = () => {
    if (categoriesRef.current) {
      const container = categoriesRef.current;
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
    }
  };

  useEffect(() => {
    const container = categoriesRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollLeft = () => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
      if (selectedCategory !== "All" && value) {
        // Only reset category if searching
        setSelectedCategory("All");
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  return (
    <div className="sticky top-12 z-30 bg-[#fff0df]  p-6  ">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categories Section */}
        <div className="relative flex items-center w-full md:w-auto">
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-all"
              aria-label="Scroll left"
            >
              <ArrowBackIosNewIcon style={{ fontSize: 16 }} />
            </button>
          )}

          <div
            ref={categoriesRef}
            className="flex items-center overflow-x-auto scrollbar-hide gap-2 px-10"
            onScroll={handleScroll}
            data-testid="category-container"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-[#ef5644] text-white shadow-md"
                  : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => handleCategorySelect("All")}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-[#ef5644] text-white shadow-md"
                    : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 z-10 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 transition-all"
              aria-label="Scroll right"
            >
              <ArrowForwardIosIcon style={{ fontSize: 16 }} />
            </button>
          )}
        </div>

        {/* Search Section */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400" style={{ fontSize: 20 }} />
          </div>

          <input
            type="text"
            placeholder="Search for delicious items..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-full focus:ring-4 focus:ring-[#ef5644]/10 focus:border-[#ef5644] transition-all duration-200 outline-none text-gray-700 placeholder-gray-400 shadow-sm hover:border-gray-300"
          />

          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Active filters indicator */}
      {(search || selectedCategory !== "All") && (
        <div className="flex items-center gap-2 mt-3 px-2">
          <span className="text-xs text-gray-500">Active filters:</span>
          {selectedCategory !== "All" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ef5644]/10 text-[#ef5644] rounded-full text-xs font-medium">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory("All")}
                className="hover:text-[#d04a3b]"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ef5644]/10 text-[#ef5644] rounded-full text-xs font-medium">
              Search: {search}
              <button onClick={clearSearch} className="hover:text-[#d04a3b]">
                <X size={12} />
              </button>
            </span>
          )}
          {(search || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                clearSearch();
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuBar;
