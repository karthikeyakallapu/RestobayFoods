import { useNavigate } from "react-router-dom";
import useFormData from "@/hooks/useFormData.js";
import restoApiInstance from "@/service/api/api.js";
import Toast from "@/_components/Toasts/Toast.js";
import BlockWrapper from "@/_components/Wrappers/BlockWrapper";
import REGISTER_IMG from "../../assets/images/login_img.jpg";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

const ResendMail = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const { data, handleChange, handleSubmit, isLoading, resetData } =
    useFormData(
      {
        email: "",
      },
      restoApiInstance.resendVerificationMail,
    );

  const handleResend = async (e) => {
    e.preventDefault();
    if (data.email === "") {
      Toast({ type: "error", message: "Please enter your email address" });
      return;
    }
    const response = await handleSubmit();

    if (response) {
      Toast({ type: response.type, message: response.message });
      if (response.type === "success") {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 5000);
      }
    }
    resetData();
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
          {/* Left Side - Image */}
          <div className="w-full md:w-1/2 relative h-64 md:h-auto">
            <img
              src={REGISTER_IMG}
              alt="Restaurant email verification"
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
                Verify Your Email
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-lg mt-2"
              >
                We&apos;ll send you a verification link to complete your
                registration
              </motion.p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
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
                <Mail className="text-[#ef5644]" />
                Resend Verification Email
              </h3>
              <p className="text-gray-600 mt-2">
                Enter your email address to receive a new verification link
              </p>
            </motion.div>

            {/* Success Message */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3"
                >
                  <CheckCircle
                    className="text-emerald-500 flex-shrink-0 mt-0.5"
                    size={18}
                  />
                  <div>
                    <p className="text-emerald-800 font-medium">
                      Verification email sent!
                    </p>
                    <p className="text-emerald-600 text-sm mt-1">
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleResend} className="space-y-6 mt-6">
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
                transition={{ delay: 0.3 }}
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Verification Email</span>
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-medium text-[#ef5644] hover:text-red-700 transition"
                >
                  Sign in
                </button>
              </p>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle
                className="text-amber-500 flex-shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <p className="text-amber-800 text-sm font-medium">
                  Having trouble?
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  If you don&apos;t receive an email within a few minutes,
                  please check your spam folder. Still having issues? Contact
                  our support team for assistance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </BlockWrapper>
  );
};

export default ResendMail;
