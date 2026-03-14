import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import restoApiInstance from "../../service/api/api";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import VERIFY_IMG from "../../assets/images/login_img.jpg";

const VerifyMail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying your email...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("Invalid or missing verification token");
        setIsLoading(false);
        return;
      }

      try {
        const response = await restoApiInstance.verifyEmail({ token });
        if (response) {
          if (response.type === "success") {
            setIsSuccess(true);
          }
          setStatus(response.message || "Email verified successfully!");
        }
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          (err.response && err.response.data && err.response.data.message) ||
          err.message ||
          "Something went wrong during verification";
        setStatus(errorMessage);
        setIsSuccess(false);
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleRedirect = () => {
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center py-12 px-4  "
    >
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Image */}
        <div className="w-full md:w-1/2 relative h-48 md:h-auto">
          <img
            src={VERIFY_IMG}
            alt="Email verification"
            className="object-cover h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Mail className="mb-2" size={32} />
              <h2 className="text-2xl md:text-3xl font-bold">
                Email Verification
              </h2>
              <p className="text-white/90 text-sm md:text-base mt-2">
                {isLoading
                  ? "Please wait while we verify your email"
                  : isSuccess
                    ? "Your email has been verified"
                    : "Verification failed"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            {isLoading ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#ef5644]/20 animate-ping"></div>
                  <div className="relative bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] rounded-full p-4">
                    <Loader2 className="h-12 w-12 text-white animate-spin" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Verifying Your Email
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm">{status}</p>

                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] rounded-full"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex flex-col items-center"
              >
                <div className="mb-6">
                  {isSuccess ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.1,
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-full p-4"
                    >
                      <CheckCircle className="h-12 w-12 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.1,
                      }}
                      className="bg-gradient-to-r from-rose-500 to-red-500 rounded-full p-4"
                    >
                      <XCircle className="h-12 w-12 text-white" />
                    </motion.div>
                  )}
                </div>

                <h3
                  className={`text-xl font-semibold mb-3 ${
                    isSuccess ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isSuccess
                    ? "Verification Successful!"
                    : "Verification Failed"}
                </h3>

                <p className="text-gray-600 mb-6 text-center max-w-sm">
                  {status}
                </p>

                {!isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-left w-full"
                  >
                    <AlertCircle
                      className="text-amber-500 flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <div>
                      <p className="text-amber-800 text-sm font-medium">
                        Need help?
                      </p>
                      <p className="text-amber-600 text-xs mt-1">
                        Request a new verification email from your account
                        settings or contact support.
                      </p>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRedirect}
                  className="w-full bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white font-medium py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isSuccess ? (
                    <>
                      Continue to Login
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      Back to Login
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-400">
              Need assistance? Contact our{" "}
              <button className="text-[#ef5644] hover:underline">
                support team
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyMail;
