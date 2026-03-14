import useCartStore from "../../store/use-cart";
import { memo, useState } from "react";
import PropTypes from "prop-types";
import { displayRazorpay } from "../Pay/Razorpay";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles, ArrowRight, Utensils } from "lucide-react";

const CartItem = memo(({ item, addToCart, removeFromCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="grid grid-cols-12 gap-2 items-center p-4 border-b border-orange-100 hover:bg-orange-50/50 transition-all duration-300"
    >
      {/* Item Info */}
      <div className="col-span-5 flex items-center gap-4">
        <div className="relative">
          <img
            src={import.meta.env.VITE_BLOB_IMAGES_URL + item.image_url}
            className="h-16 w-16 object-cover rounded-2xl border-2 border-orange-200"
            alt={item.name}
            loading="lazy"
          />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
            {item.quantity}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-orange-400 flex items-center gap-1">
            ₹{item.price}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="col-span-4 flex items-center justify-center gap-3">
        <button
          className="w-9 h-9 flex items-center justify-center bg-orange-100 rounded-xl hover:bg-orange-200 transition-colors text-[#ef5644]"
          onClick={() => removeFromCart(item.id)}
        >
          <Minus size={16} />
        </button>

        <span className="font-bold text-gray-800 min-w-[24px] text-center text-lg">
          {item.quantity}
        </span>

        <button
          className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-xl hover:shadow-lg transition-shadow"
          onClick={() => addToCart(item)}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Subtotal */}
      <p className="col-span-2 text-right font-bold text-[#ef5644] text-lg">
        ₹{item.price * item.quantity}
      </p>
    </motion.div>
  );
});

CartItem.displayName = "CartItem";

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
  }).isRequired,
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
};

const Cart = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, addToCart, removeFromCart } = useCartStore();
  const navigate = useNavigate();

  // Calculate total
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await displayRazorpay(navigate, "cart");
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl min-h-[500px]"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-full w-32 h-32 flex items-center justify-center mb-6 shadow-lg"
        >
          <Utensils size={50} className="text-[#ef5644]" />
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Your plate is empty!
        </h3>
        <p className="text-gray-500 text-center mb-8 max-w-md">
          Time to add some delicious food to your cart. Our chefs are waiting to
          cook for you!
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/menu")}
          className="px-8 py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-2xl hover:shadow-2xl transition-all font-medium flex items-center gap-2 group"
        >
          <Sparkles size={20} />
          Explore Menu
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] p-6 text-white">
        <div>
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
            <Utensils size={14} />
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Total Section */}
      <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100">
        <div className="flex justify-between items-center text-xl font-bold">
          <span className="text-gray-800">Total</span>
          <span className="text-[#ef5644] text-3xl">
            ₹{totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-4 bg-white">
        <button
          className={`w-full py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-2xl font-bold text-lg transition-all ${
            isProcessing ? "opacity-50 cursor-not-allowed" : "hover:shadow-2xl"
          }`}
          onClick={handleCheckout}
          disabled={isProcessing || cart.length === 0}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
              Preparing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Place Order
              <ArrowRight size={20} />
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Cart;
