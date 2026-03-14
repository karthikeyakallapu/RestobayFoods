import { useNavigate } from "react-router-dom";
import useFormData from "@/hooks/useFormData.js";
import restoApiInstance from "@/service/api/api.js";
import Toast from "@/_components/Toasts/Toast.js";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import REGISTER_IMG from "../../assets/images/login_img.jpg";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { data, handleChange, handleSubmit, isLoading } = useFormData(
    {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
    },
    restoApiInstance.registerUser,
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      Toast({ type: "error", message: "Passwords do not match" });
      return;
    }
    if (data.password.length < 6) {
      Toast({
        type: "error",
        message: "Password must be at least 6 characters",
      });
      return;
    }
    const response = await handleSubmit();
    if (response) {
      Toast({ type: response.type, message: response.message });
      if (response.type === "success") {
        setTimeout(() => navigate("/login"), 2000);
      }
    }
  };

  return (
    <BlockWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center justify-center w-full py-8 px-4"
      >
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="w-full md:w-1/2 relative h-64 md:h-auto">
            <img
              src={REGISTER_IMG}
              alt="Restaurant food display"
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
                Join Us Today
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-lg mt-2"
              >
                Create an account to start your dining experience
              </motion.p>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#ef5644] transition-colors mb-6"
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>

              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="text-[#ef5644]" />
                Create an account
              </h3>
              <p className="text-gray-600 mt-2">
                Fill in your details to get started
              </p>
            </motion.div>

            <form onSubmit={handleRegister} className="space-y-4 mt-6">
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
                    value={data.email || ""}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition"
                    onChange={handleChange}
                    name="name"
                    value={data.name || ""}
                    placeholder="John Doe"
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
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition"
                    onChange={handleChange}
                    name="phone"
                    value={data.phone || ""}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
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
                    value={data.password || ""}
                    placeholder="********"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition"
                    onChange={handleChange}
                    name="confirmPassword"
                    value={data.confirmPassword || ""}
                    placeholder="********"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="pt-4"
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                className="text-sm text-gray-500 hover:text-[#ef5644] transition flex items-center gap-1"
                onClick={() => navigate("/resend-mail")}
              >
                <Mail size={14} />
                Resend Verification
              </button>
              <span className="hidden sm:block text-gray-300">|</span>
              <button
                className="text-sm text-gray-500 hover:text-[#ef5644] transition flex items-center gap-1"
                onClick={() => navigate("/login")}
              >
                Already have an account?
                <ArrowRight size={14} />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </BlockWrapper>
  );
};

export default Register;
