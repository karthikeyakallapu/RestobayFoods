import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { restoClient } from "@/service/api/api.js";
import useCartStore from "./use-cart";

const parseToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

const getCookie = (cookieName) => Cookies.get(cookieName) || null;

const initializeAuthState = () => {
  const token = getCookie("accessToken");
  const role = getCookie("role");
  const decodedToken = token ? parseToken(token) : null;

  return {
    accessToken: token,
    isAuthenticated: !!token,
    role: role,
    userId: decodedToken?.id || null,
    username: decodedToken?.name || null,
  };
};

const useAuthStore = create((set) => ({
  ...initializeAuthState(),

  setAccessToken: (token) => {
    const decodedToken = parseToken(token);
    if (!decodedToken) return;

    Cookies.set("role", decodedToken.role, { path: "/" });
    Cookies.set("accessToken", token, { path: "/" });
    restoClient.defaults.headers["Authorization"] = `Bearer ${token}`;

    set({
      accessToken: token,
      isAuthenticated: true,
      username: decodedToken.username,
      role: decodedToken.role,
      userId: decodedToken.userid,
    });

    // ✅ Fetch cart after login
    useCartStore.getState().initializeCart();
  },

  removeAccessToken: async () => {
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("role", { path: "/" });
    delete restoClient.defaults.headers["Authorization"];
    window.location.href = "/";
    set({
      accessToken: null,
      isAuthenticated: false,
      username: null,
      role: null,
      userId: null,
    });
  },
}));

export default useAuthStore;
