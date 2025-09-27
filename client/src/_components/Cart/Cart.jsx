import useCartStore from "../../store/use-cart";
import { memo } from "react";
import PropTypes from "prop-types";
import { displayRazorpay } from "../Pay/Razorpay";
import { useNavigate } from "react-router-dom";

const CartItem = memo(({ item, addToCart, removeFromCart }) => (
  <div className="grid grid-cols-4 md:grid-cols-5 gap-2 items-center p-2 border-b">
    {/* Item Info */}
    <div className="col-span-2 flex items-center">
      <img
        src={import.meta.env.VITE_BLOB_IMAGES_URL + item.image_url}
        className="h-12 w-12 object-cover rounded-xl transition-transform hover:scale-105"
        alt={item.name}
        loading="lazy"
      />
      <h2 className="ml-4">{item.name}</h2>
    </div>

    {/* Price (Hidden on small screens) */}
    <p className="text-center hidden md:block">Rs: {item.price}</p>

    {/* Quantity Controls */}
    <div className="flex items-center justify-center">
      <button
        className="px-2 py-1 border rounded  quantity-btn"
        onClick={() => removeFromCart(item.id)}
      >
        -
      </button>
      <p>{item.quantity}</p>
      <button
        className="px-2 py-1 border rounded quantity-btn"
        onClick={() => addToCart(item)}
      >
        +
      </button>
    </div>

    {/* Subtotal */}
    <p className="text-right font-semibold">Rs: {item.price * item.quantity}</p>

    <div></div>
  </div>
));

CartItem.displayName = "CartItem";

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired
  }).isRequired,
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired
};

const Cart = () => {
  const { cart, addToCart, removeFromCart } = useCartStore();
  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="p-4 rounded-lg shadow">
      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty</p>
      ) : (
        <>
          {/* Table Header */}
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2 items-center p-2 border-b font-bold text-sm md:text-base  ">
            <div className="col-span-2">Item</div>
            <div className="text-center hidden md:block">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-right">Subtotal</div>
          </div>

          <div className="h-80 flex flex-col overflow-y-auto">
            {/* Cart Items */}
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end items-center p-2 mt-2 ">
            <span className="font-bold text-md">
              Total: Rs{" "}
              <span className="text-[#ef5644] text-2xl">{totalPrice}</span>
            </span>
          </div>

          {/* Checkout */}
          <div className="flex justify-end   mt-2 ">
            <button
              className="category-btn"
              onClick={() => displayRazorpay(navigate, "cart")}
            >
              Pay
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
