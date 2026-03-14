import { useEffect, memo, useMemo, useState } from "react";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import restoApiInstance from "../../service/api/api";
import { useQuery } from "@tanstack/react-query";
import MenuBar from "@/_components/Menu/MenuBar";
import useMenuStore from "../../store/use-menu";
import PropTypes from "prop-types";
import useCartStore from "../../store/use-cart";
import MainLoader from "../../_components/Loaders/MainLoader";
import { AlertCircle, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MenuItem = memo(({ item, addToCart, removeFromCart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className={` ${
      !item.available ? "opacity-25 pointer-events-none " : ""
    } bg-[#fde4c7] flex flex-col items-center rounded-xl justify-center m-2 p-3 w-72 shadow-md hover:shadow-lg transition-shadow`}
    key={item.id}
  >
    <div className="overflow-hidden rounded-xl">
      <img
        src={import.meta.env.VITE_BLOB_IMAGES_URL + item.image_url}
        className="h-44 w-64 object-cover rounded-xl transition-transform hover:scale-105"
        alt={item.name}
        loading="lazy"
      />
    </div>

    <div className="mt-2 text-center w-full px-2">
      <h3 className="font-medium truncate max-w-full text-gray-800">
        {item.name}
      </h3>
    </div>

    <div className="flex items-center justify-between w-full mt-3 px-2">
      <p className="font-medium flex items-center text-gray-700">
        ₹{" "}
        <span className="text-[#ef5644] ml-1 font-bold text-lg">
          {item.price}
        </span>
      </p>

      {!item.quantity ? (
        <button
          className="ml-2 bg-[#ef5644] text-white text-sm px-5 py-2 rounded-lg hover:bg-[#d04a3b] transition-all active:scale-95 font-medium"
          aria-label={`Add ${item.name} to order`}
          onClick={() => addToCart(item)}
        >
          Add
        </button>
      ) : (
        <div className="flex items-center justify-center gap-3 bg-white rounded-lg px-2 py-1 shadow-sm">
          <button
            onClick={() => removeFromCart(item.id)}
            className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-lg font-bold text-gray-600"
            aria-label="Decrease quantity"
          >
            -
          </button>

          <span className="font-semibold text-gray-800 min-w-[20px] text-center">
            {item.quantity}
          </span>

          <button
            onClick={() => addToCart(item)}
            className="w-7 h-7 flex items-center justify-center bg-[#ef5644] text-white rounded-full hover:bg-[#d04a3b] transition-colors text-lg font-bold"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
    </div>

    {!item.available && (
      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        Unavailable
      </div>
    )}
  </motion.div>
));

MenuItem.displayName = "MenuItem";

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    description: PropTypes.string,
    available: PropTypes.bool,
    quantity: PropTypes.number,
  }).isRequired,
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
};

const Menu = () => {
  const [retryCount, setRetryCount] = useState(0);
  const { setMenu, search, setCategories, selectedCategory } = useMenuStore();
  const { addToCart, cart, removeFromCart } = useCartStore();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["restoMenu", retryCount],
    queryFn: restoApiInstance.getMenu,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (data?.menu && data?.categories) {
      setMenu(data.menu);
      setCategories(data.categories);
    }
  }, [data, setMenu, setCategories]);

  // Filter menu items based on selected category and search term
  const filteredItems = useMemo(() => {
    if (!data?.menu) return [];

    // Map cart quantities to menu items
    const menuWithQuantities = data.menu.map((item) => {
      const cartItem = cart.find((i) => i.id === item.id);
      return cartItem
        ? { ...item, quantity: cartItem.quantity }
        : { ...item, quantity: 0 };
    });

    return menuWithQuantities
      .filter(
        (item) =>
          selectedCategory === "All" || item.category === selectedCategory,
      )
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, selectedCategory, search, cart]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    refetch();
  };

  if (isLoading && !data) {
    return <MainLoader />;
  }

  if (isError) {
    return (
      <BlockWrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px]"
        >
          <div className="bg-red-50 p-8 rounded-xl border border-red-200 text-center max-w-md">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-700 mb-3">
              Failed to load menu
            </h2>
            <p className="text-red-600 mb-6">
              Please check your connection and try again.
            </p>
            <button
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              onClick={handleRetry}
              disabled={isFetching}
            >
              {isFetching ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full"></span>
                  Retrying...
                </span>
              ) : (
                "Try Again"
              )}
            </button>
          </div>
        </motion.div>
      </BlockWrapper>
    );
  }

  // Render empty state
  if (!data || filteredItems.length === 0) {
    return (
      <BlockWrapper>
        <MenuBar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[400px]"
        >
          <div className="text-center">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-700 mb-2">
              {search
                ? "No items match your search"
                : "No menu items available"}
            </p>
            <p className="text-gray-500">
              {search
                ? "Try adjusting your search term"
                : "Check back later for delicious items"}
            </p>
            {search && (
              <button
                onClick={() => useMenuStore.getState().setSearch("")}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </motion.div>
      </BlockWrapper>
    );
  }

  return (
    <BlockWrapper>
      <MenuBar />

      {/* Results count */}
      <div className="flex justify-between items-center mt-4 px-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredItems.length}</span>{" "}
          items
        </p>
        {search && (
          <button
            onClick={() => useMenuStore.getState().setSearch("")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear search
            <X size={14} />
          </button>
        )}
      </div>

      {/* Menu items grid */}
      <motion.div
        className="flex items-center flex-wrap mt-4 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        <AnimatePresence>
          {filteredItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </BlockWrapper>
  );
};

export default Menu;
