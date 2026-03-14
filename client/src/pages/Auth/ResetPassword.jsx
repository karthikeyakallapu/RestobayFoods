import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import restoApiInstance from "../../service/api/api";
import useFormData from "../../hooks/useFormData";
import { motion } from "framer-motion";
import {
  Lock,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const {
    data: formData,
    handleChange,
    handleSubmit: submitForm,
    isLoading,
  } = useFormData(
    { password: "", confirmPassword: "", token },
    async (data) => {
      const response = await restoApiInstance.resetPassword({
        token,
        newPassword: data.password,
      });
      return response;
    },
  );

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenStatus, setTokenStatus] = useState({
    isChecking: true,
    isValid: false,
    message: "Verifying reset link...",
  });
  const [resetStatus, setResetStatus] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus({
          isChecking: false,
          isValid: false,
          message: "Invalid or missing token.",
        });
        return;
      }

      try {
        const response = await restoApiInstance.validateResetToken({ token });

        if (response) {
          setTokenStatus({
            isChecking: false,
            isValid: true,
            message: response.message,
          });
        } else {
          setTokenStatus({
            isChecking: false,
            isValid: false,
            message:
              response?.data?.message ||
              "This password reset link is invalid or has expired.",
          });
        }
      } catch (err) {
        setTokenStatus({
          isChecking: false,
          isValid: false,
          message:
            err.response?.data?.message ||
            "This password reset link is invalid or has expired.",
        });
      }
    };

    validateToken();
  }, [token]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await submitForm();

      if (response?.data) {
        setResetStatus(response.data.message || "Password reset successfully!");
        setIsSuccess(
          response.data.type === "success" || response.status === 200,
        );
      } else {
        setResetStatus("Password has been reset successfully!");
        setIsSuccess(true);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please try again.";
      setResetStatus(errorMessage);
      setIsSuccess(false);
    }
  };

  const handleRedirect = () => {
    navigate("/login");
  };

  if (tokenStatus.isChecking) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center py-12 px-4"
      >
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] p-8 text-center">
            <Key className="mx-auto text-white mb-2" size={40} />
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          </div>
          <div className="p-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#ef5644]/20 animate-ping"></div>
              <div className="relative bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            <p className="text-lg text-gray-600">{tokenStatus.message}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!tokenStatus.isValid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center py-12 px-4 "
      >
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-red-500 p-8 text-center">
            <XCircle className="mx-auto text-white mb-2" size={40} />
            <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
          </div>
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-rose-600" />
            </div>
            <p className="text-lg font-medium text-gray-800 mb-4">
              {tokenStatus.message}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please request a new password reset link from the login page.
            </p>
            <button
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white font-medium py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (resetStatus) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center py-12 px-4 "
      >
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div
            className={`bg-gradient-to-r p-8 text-center ${
              isSuccess
                ? "from-emerald-500 to-green-500"
                : "from-rose-500 to-red-500"
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="mx-auto text-white mb-2" size={40} />
            ) : (
              <XCircle className="mx-auto text-white mb-2" size={40} />
            )}
            <h1 className="text-2xl font-bold text-white">
              {isSuccess ? "Password Reset!" : "Reset Failed"}
            </h1>
          </div>
          <div className="p-8 text-center">
            <div
              className={`mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center ${
                isSuccess ? "bg-emerald-100" : "bg-rose-100"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              ) : (
                <XCircle className="h-10 w-10 text-rose-600" />
              )}
            </div>
            <p
              className={`text-lg font-medium mb-4 ${
                isSuccess ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {resetStatus}
            </p>
            <button
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white font-medium py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isSuccess ? "Go to Login" : "Back to Login"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center py-12 px-4  "
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] p-8 text-center">
          <Lock className="mx-auto text-white mb-2" size={40} />
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-white/80 text-sm mt-2">
            Enter your new password below
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#ef5644]/20 focus:border-[#ef5644] transition`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Hint */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">Hint:</span>{" "}
                Password must be at least 8 characters long.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#ef5644] to-[#ff8a7a] text-white font-medium py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleRedirect}
              className="text-sm text-gray-500 hover:text-[#ef5644] transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
