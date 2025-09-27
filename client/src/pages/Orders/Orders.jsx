import { useQuery } from "@tanstack/react-query";
import { Clock, Package, ShoppingBag, IndianRupee } from "lucide-react";
import restoApiInstance from "../../service/api/api";
import { useNavigate } from "react-router-dom";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import MainLoader from "../../_components/Loaders/MainLoader";
import FastfoodIcon from "@mui/icons-material/Fastfood";

const Orders = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["resto-orders"],
    queryFn: restoApiInstance.getOrders
  });

  const navigate = useNavigate();

  if (isLoading) {
    return <MainLoader />;
  }

  if (isError) {
    return (
      <BlockWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              Unable to load orders
            </div>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      </BlockWrapper>
    );
  }

  const hasOrders = data?.orders?.length > 0;

  return (
    <BlockWrapper>
      <div className="mb-8">
        <h1 className="anton tracking-wide text-2xl text-center text-[#ef5644]">
          Your Orders
        </h1>
        <div className="w-22 h-1 bg-[#ef5644] mx-auto rounded"></div>
      </div>

      {!hasOrders && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 font-medium">No orders found</p>
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            onClick={() => navigate("/menu")}
          >
            Browse Menu
          </button>
        </div>
      )}

      <div className="space-y-4">
        {hasOrders &&
          data.orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg bg-orange-50 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 p-4">
                  <FastfoodIcon
                    style={{ fontSize: 65, color: "#ef5644" }}
                    className="mx-auto mt-4 mb-2"
                  />
                </div>

                <div className="p-4 md:w-3/4 ubuntu">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <Package size={18} className="text-red-500 mr-2" />
                      <h2 className="font-semibold text-gray-800">
                        Order #
                        <span className="font-bold text-red-500">
                          {order.id}
                        </span>
                      </h2>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "INPROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-300 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Items
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white px-3 py-1 rounded-full text-sm border border-gray-200"
                        >
                          {item.name}{" "}
                          <span className="font-medium">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
                    <div className="flex items-center">
                      <IndianRupee size={18} className="text-red-500 mr-2" />
                      <div className="flex items-center justify-center text-sm">
                        <span className="text-gray-500">Amount:</span>{" "}
                        <span className="font-medium">
                          &nbsp;
                          {order.total_amount}
                        </span>
                        <span
                          className={`px-3  ml-4 mt-1 py-1 rounded-full text-xs font-medium ${
                            order.payment.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : order.payment.status === "PAYMENT_PENDING"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.payment.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center ">
                      <Clock size={18} className="text-red-500 mr-2" />
                      <div>
                        <span className="text-gray-500">Placed:</span>{" "}
                        <span className="font-medium text-sm">
                          {new Date(order.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </BlockWrapper>
  );
};

export default Orders;
