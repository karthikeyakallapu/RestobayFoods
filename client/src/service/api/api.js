import axios from "axios";
import Cookies from "js-cookie";
import { ENDPOINTS } from "../endpoints/API_ENDPOINTS";

const baseURL = import.meta.env.VITE_BACKEND_URL;
const token = Cookies.get("accessToken");

export const restoClient = axios.create({
  baseURL,
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
  },
});

class RestoService {
  loginUser = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.login, data);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  registerUser = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.register, data);
      return response.data;
    } catch (err) {
      return {
        type: "error",
        message:
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  verifyEmail = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.verifyEmail, data);
      return response.data;
    } catch (err) {
      return {
        type: "error",
        message:
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  resendVerificationMail = async (data) => {
    try {
      const response = await restoClient.post(
        ENDPOINTS.resendVerificationMail,
        data,
      );
      return response.data;
    } catch (err) {
      return {
        type: "error",
        message:
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  validateResetToken = async (data) => {
    try {
      const response = await restoClient.post(
        ENDPOINTS.validateResetToken,
        data,
      );
      return response.data;
    } catch (err) {
      return {
        type: "error",
        message:
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  forgotPassword = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.forgotPassword, data);
      return response.data;
    } catch (err) {
      return {
        type: "error",
        message:
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  resetPassword = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.resetPassword, data);
      return response.data;
    } catch (err) {
      return {
        type: "error",
        message:
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  getMenu = async () => {
    try {
      const response = await restoClient.get(ENDPOINTS.menu);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  cart = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.cart, data);

      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  getCart = async () => {
    try {
      const response = await restoClient.get(ENDPOINTS.cart);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  makeOrder = async () => {
    try {
      const response = await restoClient.post(ENDPOINTS.order);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  makeTableOrder = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.tableOrder, data);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  verifyPayment = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.verifyPayment, data);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  getOrders = async () => {
    try {
      const response = await restoClient.get(ENDPOINTS.getOrders);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  getTableBookings = async () => {
    try {
      const response = await restoClient.get(ENDPOINTS.getTableBookings);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  checkTableAvailability = async (data) => {
    try {
      const response = await restoClient.post(
        ENDPOINTS.checkTableAvailability,
        data,
      );
      return response.data;
    } catch (err) {
      return {
        type: "error",
        message:
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      };
    }
  };

  // Admin APIs

  getAllFoodOrders = async (
    page = 1,
    limit = 10,
    status = "",
    search = "",
    sortBy = "created_at",
    sortDirection = "desc",
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search }),
        sortBy,
        sortDirection: sortDirection.toUpperCase(),
      });

      const response = await restoClient.get(
        `${ENDPOINTS.AllFoodOrders}?${params}`,
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching orders:", err);
      throw err;
    }
  };

  getAllTableBookings = async (
    page = 1,
    limit = 10,
    status = "",
    search = "",
    sortBy = "booking_date",
    sortDirection = "desc",
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search }),
        sortBy,
        sortDirection: sortDirection.toUpperCase(),
      });

      const response = await restoClient.get(
        `${ENDPOINTS.AllTableBookings}?${params}`,
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching table bookings:", err);
      return (
        err.response?.data || {
          success: false,
          message: err.message,
          bookings: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: 0,
            limit: 10,
            from: 0,
            to: 0,
            statusCounts: {
              PENDING: 0,
              CONFIRMED: 0,
              CANCELLED: 0,
              total: 0,
            },
          },
        }
      );
    }
  };
  getAllUsers = async (
    page = 1,
    limit = 10,
    role = "",
    search = "",
    sortBy = "name",
    sortDirection = "asc",
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(role && { role }),
        ...(search && { search }),
        sortBy,
        sortDirection: sortDirection.toUpperCase(),
      });

      const response = await restoClient.get(`${ENDPOINTS.getUsers}?${params}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching users:", err);
      return (
        err.response?.data || {
          success: false,
          message: err.message,
          users: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            total: 0,
            limit: 10,
            from: 0,
            to: 0,
          },
        }
      );
    }
  };

  updateMenu = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.updateMenu, data);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  addItemtoMenu = async (data) => {
    try {
      const response = await restoClient.post(ENDPOINTS.addItemtoMenu, data);
      return response.data;
    } catch (err) {
      return err.response?.data || { message: err.message };
    }
  };

  uploadImage = async (formData) => {
    try {
      const response = await restoClient.post(ENDPOINTS.uploadImage, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };

  updateOrderStatus = async ({ orderId, newStatus, component }) => {
    try {
      const response = await restoClient.put(ENDPOINTS.updateOrderStatus, {
        orderId,
        newStatus,
        component,
      });
      return response.data;
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    }
  };
}

const restoApiInstance = new RestoService();

export default restoApiInstance;
