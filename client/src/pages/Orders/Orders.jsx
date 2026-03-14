import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  ShoppingBag,
  IndianRupee,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import restoApiInstance from "../../service/api/api";
import { useNavigate } from "react-router-dom";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import MainLoader from "../../_components/Loaders/MainLoader";
import { motion } from "framer-motion";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import dayjs from "dayjs";

const Orders = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["resto-orders"],
    queryFn: restoApiInstance.getOrders,
    staleTime: 30000,
  });

  const navigate = useNavigate();

  const getStatusStyles = (status) => {
    switch (status) {
      case "PAYMENT_PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
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
            <h3 className="text-xl font-bold text-red-700 mb-3">
              Failed to load orders
            </h3>
            <p className="text-red-600 mb-6">Please try again later</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </BlockWrapper>
    );
  }

  const orders = data?.orders || [];
  const hasOrders = orders.length > 0;

  return (
    <BlockWrapper>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Your <span className="text-[#ef5644]">Orders</span>
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] mx-auto rounded-full"></div>
      </div>

      {!hasOrders ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl"
        >
          <div className="bg-white rounded-full p-6 shadow-lg mb-6">
            <ShoppingBag size={64} className="text-[#ef5644]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No orders yet
          </h3>
          <p className="text-gray-600 text-center mb-8 max-w-md">
            Hungry? Browse our delicious menu and place your first order!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/menu")}
            className="px-8 py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            Browse Menu
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-orange-100"
            >
              <div className="flex flex-col md:flex-row">
                {/* Icon Section */}
                <div className="md:w-24 bg-gradient-to-br from-[#ef5644] to-[#ff8a7a] flex items-center justify-center p-6">
                  <FastfoodIcon style={{ fontSize: 48, color: "white" }} />
                </div>

                {/* Order Details */}
                <div className="flex-1 p-6">
                  {/* Header Row */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-sm text-gray-500">Order ID</span>
                        <h3 className="text-xl font-bold text-gray-800">
                          #{order.id}
                        </h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusStyles(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Items
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item) => (
                          <span
                            key={item.id}
                            className="bg-orange-50 px-4 py-2 rounded-xl text-sm border border-orange-200 text-gray-700"
                          >
                            {item.name}{" "}
                            <span className="font-bold text-[#ef5644] ml-1">
                              ×{item.quantity}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <IndianRupee size={18} className="text-[#ef5644]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-bold text-lg text-[#ef5644]">
                          ₹{order.total_amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock size={18} className="text-[#ef5644]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Order Placed</p>
                        <p className="font-semibold text-gray-800">
                          {dayjs(order.updated_at).format(
                            "MMM D, YYYY [at] h:mm A",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </BlockWrapper>
  );
};

export default Orders;
