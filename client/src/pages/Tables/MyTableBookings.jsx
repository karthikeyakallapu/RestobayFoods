import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Users, Table as TableIcon, AlertCircle } from "lucide-react";
import restoApiInstance from "../../service/api/api";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import MainLoader from "../../_components/Loaders/MainLoader";
import { motion } from "framer-motion";

const MyTableBookings = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["resto-table-bookings"],
    queryFn: restoApiInstance.getTableBookings,
    staleTime: 30000,
  });

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
              Failed to load bookings
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

  const bookings = data?.bookings || [];
  const hasBookings = bookings.length > 0;

  const getStatusStyles = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <BlockWrapper>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          My Table <span className="text-[#ef5644]">Bookings</span>
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] mx-auto rounded-full"></div>
      </div>

      {!hasBookings ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl"
        >
          <div className="bg-white rounded-full p-6 shadow-lg mb-6">
            <TableIcon size={64} className="text-[#ef5644]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No bookings yet</h3>
          <p className="text-gray-600 text-center mb-8 max-w-md">
            Ready for a delicious meal? Book a table at your favorite restaurant.
          </p>
          <Link to="/table">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Book a Table Now
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-orange-100"
            >
              <div className="flex flex-col md:flex-row">
                {/* Table Icon Section */}
                <div className="md:w-24 bg-gradient-to-br from-[#ef5644] to-[#ff8a7a] flex items-center justify-center p-6">
                  <TableIcon size={40} className="text-white" />
                </div>

                {/* Booking Details */}
                <div className="flex-1 p-6">
                  {/* Header Row */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Booking ID</span>
                      <h3 className="text-xl font-bold text-gray-800">
                        #{booking.id}
                      </h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusStyles(booking.status)}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <TableIcon size={18} className="text-[#ef5644]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Table Number</p>
                        <p className="font-semibold text-gray-800">{booking.table_number}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Users size={18} className="text-[#ef5644]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Party Size</p>
                        <p className="font-semibold text-gray-800">{booking.number_of_people} guests</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar size={18} className="text-[#ef5644]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-800">
                          {dayjs(booking.booking_date).format("MMM D, YYYY")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock size={18} className="text-[#ef5644]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-semibold text-gray-800">
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-orange-100">
                    <p className="text-xs text-gray-400">
                      Booked on {dayjs(booking.updated_at).format("MMM D, YYYY [at] h:mm A")}
                    </p>
                    {booking.amount && (
                      <p className="font-bold text-[#ef5644]">
                        ₹{booking.amount}
                      </p>
                    )}
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

export default MyTableBookings;