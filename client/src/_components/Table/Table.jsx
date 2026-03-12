import { useState } from "react";
import useTableStore from "../../store/use-table";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import dayjs from "dayjs";
import { displayRazorpay } from "../Pay/Razorpay";
import { useNavigate } from "react-router-dom";

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
  } = useTableStore((state) => state);

  const handlePayment = () => {
    setIsPaymentProcessing(true);
    displayRazorpay(navigate, "table", {
      tableId: tableId,
      bookingDate: date.toISOString(),
      partySize,
      startTime: dayjs(startTime).format("HH:mm"),
      endTime: dayjs(endTime).format("HH:mm"),
    });
    setIsPaymentProcessing(false);
    useTableStore.getState().resetTable();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-[#ef5644] rounded-full"></div>
          <p className="text-lg font-medium text-gray-600">
            Loading reservation details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Reservation Error
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!selectedTable) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center max-w-md">
          <div className="text-yellow-500 text-4xl mb-4">ℹ️</div>
          <h2 className="text-xl font-bold text-yellow-700 mb-2">
            No Table Selected
          </h2>
          <p className="text-yellow-600 mb-4">
            Please select a table to continue with your reservation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-[50vw] max-w-md mx-auto ">
      <div className="flex flex-col items-center ">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <TableRestaurantIcon
            sx={{ color: "#ef5644", height: "3rem", width: "3rem" }}
          />
        </div>

        <h1 className="text-3xl font-bold text-[#3f3f3f] anton tracking-wider mb-6">
          {selectedTable}
        </h1>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-medium text-gray-600">Date</h2>
            <p className="font-semibold">{dayjs(date).format("MMM D, YYYY")}</p>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-medium text-gray-600">Time </h2>
            <p className="ml-8 font-semibold">
              {dayjs(startTime).format("h:mm A")} -{" "}
              {dayjs(endTime).format("h:mm A")}
            </p>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-medium text-gray-600">Party Size</h2>
            <p className="font-semibold">
              {partySize} {partySize === 1 ? "person" : "people"}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <h2 className="font-bold text-lg text-gray-800">Total</h2>
            <p className="font-bold text-lg text-[#ef5644]">Rs.{getPrice()}</p>
          </div>
        </div>

        <button
          className={`w-full py-2 rounded-md text-white font-medium transition-all ${
            isPaymentProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#ef5644] hover:bg-[#d04a3b] active:transform active:scale-95"
          }`}
          onClick={handlePayment}
          disabled={isPaymentProcessing}
        >
          {isPaymentProcessing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full"></span>
              Processing...
            </span>
          ) : (
            "Complete Reservation"
          )}
        </button>
      </div>
    </div>
  );
};

export default Table;
