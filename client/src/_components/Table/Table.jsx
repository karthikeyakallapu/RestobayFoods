import { useState } from "react";
import useTableStore from "../../store/use-table";
import useModalStore from "../../store/use-modal";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import dayjs from "dayjs";
import { displayRazorpay } from "../Pay/Razorpay";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  IndianRupee,
  AlertCircle,
  Info,
  X,
  CheckCircle,
  Clock as ClockIcon,
  ChevronRight
} from "lucide-react";

const Table = () => {
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const navigate = useNavigate();

  const {
    selectedTable,
    tableId,
    isLoading,
    date,
    partySize,
    startTime,
    endTime,
    getPrice,
    error,
    resetTable,
  } = useTableStore();

  const { closeModal } = useModalStore();

  const handlePayment = async () => {
    setIsPaymentProcessing(true);
    try {
      if (!tableId || !date || !partySize || !startTime || !endTime) {
        throw new Error("Missing required booking information");
      }

      const orderData = {
        tableId: tableId,
        bookingDate: dayjs(date).format("YYYY-MM-DD"),
        partySize: Number(partySize),
        startTime: dayjs(startTime).format("HH:mm"),
        endTime: dayjs(endTime).format("HH:mm"),
        amount: getPrice(),
      };

      const success = await displayRazorpay(navigate, "table", orderData);

      if (success && resetTable) {
        resetTable();
        closeModal();
        navigate("/bookings/table");
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleCancel = () => {
    if (resetTable) {
      resetTable();
    }
    closeModal();
    navigate("/table");
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full w-full p-4"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#ef5644]/20 animate-ping"></div>
            <div className="relative animate-spin h-20 w-20 border-4 border-t-transparent border-[#ef5644] rounded-full"></div>
            <TableRestaurantIcon
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#ef5644]"
              sx={{ height: "2rem", width: "2rem" }}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              Loading reservation details...
            </p>
            <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-full w-full p-4"
      >
        <div className="bg-white p-8 rounded-2xl border border-red-100 text-center max-w-md shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-400"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full"></div>
          
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} className="text-red-600" />
          </button>

          <div className="relative z-10">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertCircle size={48} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={handleCancel}
            >
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!selectedTable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-full w-full p-4"
      >
        <div className="bg-white p-8 rounded-2xl border border-amber-100 text-center max-w-md shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 to-amber-400"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-50 rounded-full"></div>
          
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-2 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} className="text-amber-600" />
          </button>

          <div className="relative z-10">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Info size={48} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Table Selected
            </h2>
            <p className="text-gray-600 mb-8">
              Please select a table to continue with your reservation.
            </p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto"
              onClick={() => {
                closeModal();
                navigate("/table");
              }}
            >
              Browse Tables
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="h-full w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-orange-50"
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ef5644]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ef5644] via-[#ff8a7a] to-[#ef5644]"></div>
        
        {/* Header with gradient and pattern */}
        <div className="bg-gradient-to-br from-[#ef5644] to-[#d04a3b] px-6 py-10 text-white relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-40 h-40 border-8 border-white rounded-full"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 border-8 border-white rounded-full"></div>
          </div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-white rounded-full"></span>
                Table Reservation
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold mt-1"
              >
                {selectedTable}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/80 text-sm mt-2 flex items-center gap-1"
              >
                <ClockIcon size={14} />
                Premium seating
              </motion.p>
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
            >
              <TableRestaurantIcon sx={{ height: "2.5rem", width: "2.5rem" }} />
            </motion.div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Booking details with glass morphism effect */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 space-y-4 shadow-inner border border-gray-100"
          >
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-gradient-to-br from-[#ef5644]/10 to-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                <Calendar size={22} className="text-[#ef5644]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {dayjs(date).format("dddd, MMMM D, YYYY")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-gradient-to-br from-[#ef5644]/10 to-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                <Clock size={22} className="text-[#ef5644]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {dayjs(startTime).format("h:mm A")} - {dayjs(endTime).format("h:mm A")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-gradient-to-br from-[#ef5644]/10 to-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                <Users size={22} className="text-[#ef5644]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Party Size</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {partySize} {partySize === 1 ? "person" : "people"}
                </p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-4"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-[#ef5644]/20 to-orange-200 rounded-lg">
                  <IndianRupee size={20} className="text-[#ef5644]" />
                </div>
                <span className="text-gray-600 font-medium">Total Amount</span>
              </div>
              <motion.span 
                className="font-bold text-3xl text-[#ef5644]"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                ₹{getPrice()}
              </motion.span>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all relative overflow-hidden group ${
                isPaymentProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] shadow-lg hover:shadow-2xl"
              }`}
              onClick={handlePayment}
              disabled={isPaymentProcessing}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPaymentProcessing ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Confirm & Pay
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              {!isPaymentProcessing && (
                <span className="absolute inset-0 bg-gradient-to-r from-[#d04a3b] to-[#ff6b5a] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="w-full py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all hover:border-gray-300"
            >
              Cancel
            </motion.button>
          </motion.div>

          {/* Terms with checkmark */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <CheckCircle size={14} className="text-green-500" />
            <span>
              By confirming, you agree to our{" "}
              <button className="text-[#ef5644] hover:underline font-medium">Terms</button>{" "}
              and{" "}
              <button className="text-[#ef5644] hover:underline font-medium">
                Cancellation Policy
              </button>
            </span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Table;