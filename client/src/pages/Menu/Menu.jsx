import { useEffect, memo, useMemo } from "react";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import restoApiInstance from "../../service/api/api";
import { useQuery } from "@tanstack/react-query";
import MenuBar from "@/_components/Menu/MenuBar";
import useMenuStore from "../../store/use-menu";
import PropTypes from "prop-types";
import useCartStore from "../../store/use-cart";

const MenuItem = memo(({ item, addToCart, removeFromCart }) => (
  <div
    // eslint-disable-next-line react/prop-types
    className={` ${!item.available ? "opacity-25 pointer-events-none " : ""
    } bg-[#fde4c7] flex flex-col items-center rounded-xl  justify-center m-2 p-3 w-72 `}
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

    <div className="mt-2 text-center">
      <h3 className="font-medium truncate max-w-full">{item.name}</h3>
    </div>

    <div className="flex items-center justify-between w-full mt-2 ">
      <p className="mt-1 font-medium flex items-center">
        Rs:{" "}
        <span className="text-[#ef5644] ml-1 font-bold text-lg">
          {item.price}
        </span>
      </p>
      {!item.quantity ? (
        <button
          className="ml-2 bg-[#ef5644]  text-white text-sm px-4 py-1.5 rounded  hover:opacity-90 transition-opacity"
          aria-label={`Add ${item.name} to order`}
          onClick={() => addToCart(item)}
        >
          <p className="font-medium">Add</p>
        </button>
      ) : (
        <div className="flex items-center justify-center">
          <div onClick={() => removeFromCart(item.id)} className="quantity-btn">
            <button>-</button>
          </div>

          <p>{item.quantity}</p>

          <div onClick={() => addToCart(item)} className="quantity-btn">
            <button>+</button>
          </div>
        </div>
      )}
    </div>
  </div>
));

MenuItem.displayName = "MenuItem";

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    quantity: PropTypes.number
  }).isRequired,
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired
};

const Menu = () => {
  const { setMenu, search, setCategories, selectedCategory } = useMenuStore();
  const { addToCart, cart, removeFromCart } = useCartStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["restoMenu"],
    queryFn: restoApiInstance.getMenu
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
      return cartItem ? { ...item, quantity: cartItem.quantity } : item;
    });

    return menuWithQuantities
      .filter(
        (item) =>
          selectedCategory === "All" || item.category === selectedCategory
      )
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, selectedCategory, search, cart]);

  if (isLoading) {
    return (
      <BlockWrapper>
        <h1>Loading...</h1>
      </BlockWrapper>
    );
  }

  if (isError) {
    return (
      <BlockWrapper>
        <div className="text-center py-10">
          <p className="text-lg text-red-500">Failed to load menu items</p>
          <button
            className="mt-4 bg-[#ef5644] text-white px-6 py-2 rounded-full"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </BlockWrapper>
    );
  }

  // Render empty state
  if (!data || filteredItems.length === 0) {
    return (
      <BlockWrapper>
        <MenuBar />
        <div className="text-center py-10">
          <p className="text-lg">
            {search
              ? "No items match your search."
              : "No menu items available."}
          </p>
        </div>
      </BlockWrapper>
    );
  }

  return (
    <BlockWrapper>
      <MenuBar />
      <div className="flex items-center flex-wrap mt-4 justify-center">
        {filteredItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
          />
        ))}
      </div>
    </BlockWrapper>
  );
};

export default Menu;
