import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import restoApiInstance from "../../service/api/api";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import FORGOT_PASSWORD_IMG from "../../assets/images/login_img.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrorMessage("");
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await restoApiInstance.forgotPassword({ email });
      if (response) {
        setStatus(
          response.message || "Password reset instructions sent to your email!",
        );
        setIsSuccess(response.type === "success" || response.status === 200);
      } else {
        setStatus("Password reset instructions sent to your email!");
        setIsSuccess(true);
      }
    } catch (err) {
      const apiErrorMessage =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        "Failed to process your request. Please try again.";
      setStatus(apiErrorMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (status) {
    return (
      <BlockWrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen flex items-center justify-center py-12 px-4"
        >
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] p-8 text-center">
              <Lock className="mx-auto text-white mb-2" size={40} />
              <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
            </div>
            <div className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="mb-6">
                  {isSuccess ? (
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100">
                      <CheckCircle className="h-10 w-10 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-rose-100">
                      <AlertCircle className="h-10 w-10 text-rose-600" />
                    </div>
                  )}
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-lg font-medium mb-4 ${
                    isSuccess ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {status}
                </motion.p>

                {isSuccess && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-gray-500 mb-8"
                  >
                    Please check your inbox and follow the instructions to reset
                    your password.
                  </motion.p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </BlockWrapper>
    );
  }

  return (
    <BlockWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center py-12 px-4"
      >
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Image */}
          <div className="w-full md:w-1/2 relative h-48 md:h-auto">
            <img
              src={FORGOT_PASSWORD_IMG}
              alt="Reset password"
              className="object-cover h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold"
              >
                Reset Password
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-sm md:text-base mt-2"
              >
                We&apos;ll help you get back into your account
              </motion.p>
            </div>
          </div>

          {/* Right Side - Form */}
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
                <Lock className="text-[#ef5644]" size={24} />
                Forgot Password?
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
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
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errorMessage
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition`}
                    placeholder="your@email.com"
                  />
                </div>
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle size={14} />
                    {errorMessage}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white font-medium py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle
                className="text-amber-500 flex-shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <p className="text-amber-800 text-xs font-medium">
                  Having trouble?
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  If you don&apos;t receive an email within a few minutes,
                  please check your spam folder. Contact support if you need
                  further assistance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </BlockWrapper>
  );
};

export default ForgotPassword;
