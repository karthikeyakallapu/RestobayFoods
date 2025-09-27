import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Users, DollarSign, Table } from "lucide-react";
import restoApiInstance from "../../service/api/api";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import MainLoader from "../../_components/Loaders/MainLoader";

const MyTableBookings = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["resto-table-bookings"],
    queryFn: restoApiInstance.getTableBookings
  });

  if (isLoading) {
    return <MainLoader />;
  }

  if (isError) {
    return (
      <BlockWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              Unable to load bookings
            </div>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      </BlockWrapper>
    );
  }

  const hasBookings = data?.bookings?.length > 0;

  return (
    <BlockWrapper>
      <div className="mb-8">
        <h1 className="anton tracking-wide text-2xl text-center text-[#ef5644]">
          Table Bookings
        </h1>
        <div className="w-22 h-1 bg-[#ef5644] mx-auto rounded"></div>
      </div>

      {!hasBookings && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Table className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 font-medium">No bookings found</p>
          <Link to="/table">
            <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
              Book a Table
            </button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {hasBookings &&
          data.bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg bg-orange-50 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/6 bg-orange-100 flex items-center justify-center p-4">
                  <Table size={48} className="text-red-500" />
                </div>

                <div className="p-4 md:w-5/6 ubuntu">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <h2 className="font-semibold text-gray-800">
                        Booking #
                        <span className="font-bold text-red-500">
                          {booking.id}
                        </span>
                      </h2>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm mb-4">
                    <div className="flex items-center">
                      <Table size={16} className="text-red-500 mr-2" />
                      <div>
                        <span className="text-gray-500">Table Number:</span>{" "}
                        <span className="font-medium">
                          {booking.table_number}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users size={16} className="text-red-500 mr-2" />
                      <div>
                        <span className="text-gray-500">People:</span>{" "}
                        <span className="font-medium">
                          {booking.number_of_people}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar size={16} className="text-red-500 mr-2" />
                      <div>
                        <span className="text-gray-500">Date:</span>{" "}
                        <span className="font-medium">
                          {dayjs(booking.booking_date).format("MMM D, YYYY")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <DollarSign size={16} className="text-red-500 mr-2" />
                      <div>
                        <span className="text-gray-500">Amount:</span>{" "}
                        <span className="font-medium">${booking.amount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-100 rounded-md mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Clock size={16} className="text-red-500 mr-2" />
                        <div>
                          <span className="text-gray-500">Start Time:</span>{" "}
                          <span className="font-medium">
                            {booking.start_time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock size={16} className="text-red-500 mr-2" />
                        <div>
                          <span className="text-gray-500">End Time:</span>{" "}
                          <span className="font-medium">
                            {booking.start_time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Booked on {new Date(booking.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </BlockWrapper>
  );
};

export default MyTableBookings;
