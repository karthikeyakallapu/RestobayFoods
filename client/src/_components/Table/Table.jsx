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
  X, } from "lucide-react";

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
            <div className="animate-spin h-16 w-16 border-4 border-t-transparent border-[#ef5644] rounded-full"></div>
            <TableRestaurantIcon
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#ef5644]"
              sx={{ height: "1.5rem", width: "1.5rem" }}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              Loading reservation details...
            </p>
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
        <div className="bg-red-50 p-8 rounded-xl border border-red-200 text-center max-w-md shadow-lg relative">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-red-600" />
          </button>

          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-3">
            Reservation Error
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            onClick={handleCancel}
          >
            Go Back
          </button>
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
        <div className="bg-amber-50 p-8 rounded-xl border border-amber-200 text-center max-w-md shadow-lg relative">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-amber-600" />
          </button>

          <div className="bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Info size={40} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-amber-700 mb-3">
            No Table Selected
          </h2>
          <p className="text-amber-600 mb-6">
            Please select a table to continue with your reservation.
          </p>
          <button
            className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            onClick={() => {
              closeModal();
              navigate("/table");
            }}
          >
            Browse Tables
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full w-full flex items-center justify-center  bg-gradient-to-br from-gray-50 to-gray-100"
    >
    

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#ef5644] to-[#d04a3b] px-6 py-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm font-medium">
                Table Reservation
              </p>
              <h1 className="text-3xl font-bold mt-1">{selectedTable}</h1>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <TableRestaurantIcon sx={{ height: "2rem", width: "2rem" }} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-[#ef5644]" />
              <span className="text-gray-600 flex-1">Date</span>
              <span className="font-semibold text-gray-900">
                {dayjs(date).format("MMMM D, YYYY")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={20} className="text-[#ef5644]" />
              <span className="text-gray-600 flex-1">Time</span>
              <span className="font-semibold text-gray-900">
                {dayjs(startTime).format("h:mm A")} -{" "}
                {dayjs(endTime).format("h:mm A")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Users size={20} className="text-[#ef5644]" />
              <span className="text-gray-600 flex-1">Party Size</span>
              <span className="font-semibold text-gray-900">
                {partySize} {partySize === 1 ? "person" : "people"}
              </span>
            </div>

            <div className="h-px bg-gray-200 my-2"></div>

            <div className="flex items-center gap-3">
              <IndianRupee size={20} className="text-[#ef5644]" />
              <span className="text-gray-600 flex-1">Total Amount</span>
              <span className="font-bold text-xl text-[#ef5644]">
                ₹{getPrice()}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              className={`w-full py-3.5 rounded-xl text-white font-medium transition-all ${
                isPaymentProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#ef5644] hover:bg-[#d04a3b] active:transform active:scale-[0.98] shadow-lg hover:shadow-xl"
              }`}
              onClick={handlePayment}
              disabled={isPaymentProcessing}
            >
              {isPaymentProcessing ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full"></span>
                  Processing Payment...
                </span>
              ) : (
                "Confirm & Pay"
              )}
            </button>

            <button
              onClick={handleCancel}
              className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By confirming, you agree to our{" "}
            <button className="text-[#ef5644] hover:underline">Terms</button>{" "}
            and{" "}
            <button className="text-[#ef5644] hover:underline">
              Cancellation Policy
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Table;