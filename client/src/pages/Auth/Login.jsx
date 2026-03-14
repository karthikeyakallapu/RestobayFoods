import useFormData from "@/hooks/useFormData.js";
import useAuthStore from "@/store/use-auth.js";
import restoApiInstance from "@/service/api/api.js";
import { restoClient } from "../../service/api/api";
import Toast from "@/_components/Toasts/Toast";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import { useNavigate } from "react-router-dom";
import LOGIN_IMG from "../../assets/images/login_img.jpg";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuthStore();
  const { handleChange, data, handleSubmit, isLoading } = useFormData(
    {
      email: "",
      password: "",
    },
    restoApiInstance.loginUser,
  );

  const handleLogin = async (e) => {
    try {
      e.preventDefault();

      const response = await handleSubmit();

      if (response) {
        if (response.accessToken) {
          setAccessToken(response.accessToken);
          restoClient.defaults.headers["Authorization"] =
            `Bearer ${response.accessToken}`;
          navigate("/menu");
          Toast({ type: "success", message: "Login successful!" });
        } else {
          Toast({ type: response.type, message: response.message });
        }
      }
    } catch (error) {
      console.log(error);
      Toast({ type: "error", message: "Login failed. Please try again." });
    }
  };

  return (
    <BlockWrapper>
      <motion.div
        key="login"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center w-full py-8 px-4"
      >
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="w-full md:w-1/2 relative h-64 md:h-auto">
            <img
              src={LOGIN_IMG}
              alt="Restaurant ambiance"
              className="object-cover h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold"
              >
                Welcome Back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-lg mt-2"
              >
                Sign in to continue your culinary journey
              </motion.p>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold text-gray-800">
                Sign in to your account
              </h3>
              <p className="text-gray-600 mt-2">
                Enter your credentials to access your account
              </p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition"
                    onChange={handleChange}
                    name="email"
                    value={data.email}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-[#ef5644] hover:text-red-700 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition"
                    onChange={handleChange}
                    name="password"
                    value={data.password}
                    placeholder="********"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#ef5644] to-[#ff7a6a] text-white font-medium py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Logging In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Log In</span>
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-[#ef5644] hover:text-red-700 transition inline-flex items-center gap-1"
                >
                  Register now
                  <ArrowRight size={16} />
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </BlockWrapper>
  );
};

export default Login;
