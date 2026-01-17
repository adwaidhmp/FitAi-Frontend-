import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Dumbbell,
  Users,
  Sparkles,
  Key,
  AlertCircle,
  Brain,
  TrendingUp,
  Target,
  CheckCircle,
} from "lucide-react";
import Loading from "../Loading";
import {
  requestOtp,
  registerUser,
  registerTrainer,
  clearError,
} from "../../redux/user_slices/authSlice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("user");
  const [showOtp, setShowOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const {
    loading,
    error,
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);

  const { data: profile } = useSelector((state) => state.profile);

  useEffect(() => {
    // Only redirect if authenticated AND profile is fully set up
    // This prevents the loop where a user with no profile gets bounced:
    // Signup -> Home -> RequireProfile -> Signup
    if (isAuthenticated && user && profile?.profile_completed) {
      navigate("/home");
    }
  }, [isAuthenticated, user, profile, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [activeForm, dispatch]);

  const otpValidation = Yup.string()
    .matches(/^[0-9]{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required");

  const userValidationSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    ...(showOtp && { otp: otpValidation }),
  });

  const trainerValidationSchema = Yup.object({
    name: Yup.string().required("Professional name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Contact number is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    ...(showOtp && { otp: otpValidation }),
  });

  const handleGetOtp = async (formik) => {
    formik.validateField("email");

    if (formik.errors.email || !formik.values.email) {
      formik.setFieldTouched("email", true);
      return;
    }

    try {
      await dispatch(requestOtp(formik.values.email)).unwrap();
      setShowOtp(true);
      setOtpSent(true);
      dispatch(clearError());
    } catch (err) {
      console.error("Failed to send OTP:", err);
    }
  };

  const handleResendOtp = async (formik) => {
    if (!formik.values.email) {
      formik.setFieldError("email", "Email is required to resend OTP");
      return;
    }

    try {
      await dispatch(requestOtp(formik.values.email)).unwrap();
      console.log("OTP resent successfully");
    } catch (err) {
      console.error("Failed to resend OTP:", err);
    }
  };

  const userFormik = useFormik({
    initialValues: { name: "", email: "", phone: "", password: "", otp: "" },
    validationSchema: userValidationSchema,
    onSubmit: async (values) => {
      if (!showOtp) {
        userFormik.setFieldError("otp", "Please verify with OTP first");
        return;
      }

      try {
        const payload = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          otp: values.otp,
        };

        await dispatch(registerUser(payload)).unwrap();
        navigate("/login");
        console.log("User registration successful");
      } catch (err) {
        console.error("Registration failed:", err);
      }
    },
  });

  const trainerFormik = useFormik({
    initialValues: { name: "", email: "", phone: "", password: "", otp: "" },
    validationSchema: trainerValidationSchema,
    onSubmit: async (values) => {
      if (!showOtp) {
        trainerFormik.setFieldError("otp", "Please verify with OTP first");
        return;
      }

      try {
        const payload = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          otp: values.otp,
        };

        await dispatch(registerTrainer(payload)).unwrap();
        navigate("/login");
        console.log("Trainer registration successful");
      } catch (err) {
        console.error("Trainer registration failed:", err);
      }
    },
  });

  const currentFormik = activeForm === "user" ? userFormik : trainerFormik;
  const isUser = activeForm === "user";
  const gradient = isUser
    ? "from-purple-600 to-pink-600"
    : "from-blue-600 to-cyan-600";
  const borderColor = isUser ? "border-purple-500/30" : "border-blue-500/30";

  return (
    <div className="h-screen bg-black text-white ">
      {/* Main Split Layout - No scrolling */}
      <div className="h-full flex flex-col lg:flex-row">
        {/* Left Column - Platform Information */}
        <div className="lg:w-1/2 h-full bg-linear-to-br from-gray-900 via-black to-purple-900/20 p-4 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Brand Header - Compact */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center p-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl mb-3">
                <Dumbbell className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold mb-1">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
                  FitAI
                </span>
              </h1>
              <p className="text-gray-300 text-sm mb-4">
                Join the future of fitness with AI-powered workouts,
                personalized nutrition, and expert guidance.
              </p>
            </div>

            {/* Platform Benefits - Compact */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-900/30 rounded-lg mt-0.5">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    AI-Powered Fitness
                  </h4>
                  <p className="text-xs text-gray-400">
                    Adaptive workout and nutrition plans that evolve with your
                    progress.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-cyan-900/30 rounded-lg mt-0.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Progress Tracking
                  </h4>
                  <p className="text-xs text-gray-400">
                    Detailed analytics, progress photos, and performance
                    metrics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-pink-900/30 rounded-lg mt-0.5">
                  <Users className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Expert Community
                  </h4>
                  <p className="text-xs text-gray-400">
                    Connect with certified trainers and fitness enthusiasts.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid - Compact */}
            <div className="bg-gray-900/30 rounded-xl p-4 mb-6 border border-gray-800">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">50K+</div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">500+</div>
                  <div className="text-xs text-gray-400">Trainers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-400">98%</div>
                  <div className="text-xs text-gray-400">Success</div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">
                  Secure & encrypted data
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">
                  No credit card required
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">7-day free trial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Signup Form - No scrolling */}
        <div className="lg:w-1/2 h-full p-4 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Toggle Container */}
            <div className="mb-4">
              <div className="bg-gray-900 rounded-xl p-1">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveForm("user");
                      setShowOtp(false);
                      setOtpSent(false);
                      dispatch(clearError());
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      isUser
                        ? `bg-linear-to-r ${gradient} text-white`
                        : "text-gray-400 hover:text-white"
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Fitness Member
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveForm("trainer");
                      setShowOtp(false);
                      setOtpSent(false);
                      dispatch(clearError());
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      !isUser
                        ? `bg-linear-to-r ${gradient} text-white`
                        : "text-gray-400 hover:text-white"
                    }`}
                    disabled={loading}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5" />
                      Gym Trainer
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold mb-1">
                {isUser
                  ? "Create Your Fitness Account"
                  : "Join as Certified Trainer"}
              </h2>
              <p className="text-gray-400 text-xs">
                {isUser
                  ? "Start your personalized fitness journey today"
                  : "Expand your training business with AI tools"}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-3 animate-fadeIn">
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-2 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <div className="text-red-200 text-xs flex-1">
                    {typeof error === "object"
                      ? JSON.stringify(error, null, 2)
                      : error}
                  </div>
                  <button
                    onClick={() => dispatch(clearError())}
                    className="ml-1 text-red-300 hover:text-white transition-colors text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Form Container */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
              <form onSubmit={currentFormik.handleSubmit}>
                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Name Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      {isUser ? "Full Name" : "Professional Name"}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={currentFormik.values.name}
                      onChange={currentFormik.handleChange}
                      onBlur={currentFormik.handleBlur}
                      className={`w-full px-3 py-2 text-xs bg-gray-800 border ${borderColor} rounded-lg focus:border-${isUser ? "purple" : "blue"}-500 focus:ring-2 focus:ring-${isUser ? "purple" : "blue"}-500/50 transition-all ${currentFormik.touched.name && currentFormik.errors.name ? "border-red-500" : ""}`}
                      placeholder={
                        isUser
                          ? "Enter your full name"
                          : "Enter your professional name"
                      }
                      disabled={loading}
                    />
                    {currentFormik.touched.name &&
                      currentFormik.errors.name && (
                        <p className="mt-1 text-xs text-red-400">
                          {currentFormik.errors.name}
                        </p>
                      )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={currentFormik.values.email}
                      onChange={currentFormik.handleChange}
                      onBlur={currentFormik.handleBlur}
                      className={`w-full px-3 py-2 text-xs bg-gray-800 border ${borderColor} rounded-lg focus:border-${isUser ? "purple" : "blue"}-500 focus:ring-2 focus:ring-${isUser ? "purple" : "blue"}-500/50 transition-all ${currentFormik.touched.email && currentFormik.errors.email ? "border-red-500" : ""}`}
                      placeholder={
                        isUser ? "member@example.com" : "trainer@example.com"
                      }
                      disabled={loading || otpSent}
                    />
                    {currentFormik.touched.email &&
                      currentFormik.errors.email && (
                        <p className="mt-1 text-xs text-red-400">
                          {currentFormik.errors.email}
                        </p>
                      )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      {isUser ? "Phone Number" : "Contact Number"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={currentFormik.values.phone}
                      onChange={currentFormik.handleChange}
                      onBlur={currentFormik.handleBlur}
                      className={`w-full px-3 py-2 text-xs bg-gray-800 border ${borderColor} rounded-lg focus:border-${isUser ? "purple" : "blue"}-500 focus:ring-2 focus:ring-${isUser ? "purple" : "blue"}-500/50 transition-all ${currentFormik.touched.phone && currentFormik.errors.phone ? "border-red-500" : ""}`}
                      placeholder="+91 (123) 456-7890"
                      disabled={loading}
                    />
                    {currentFormik.touched.phone &&
                      currentFormik.errors.phone && (
                        <p className="mt-1 text-xs text-red-400">
                          {currentFormik.errors.phone}
                        </p>
                      )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={currentFormik.values.password}
                      onChange={currentFormik.handleChange}
                      onBlur={currentFormik.handleBlur}
                      className={`w-full px-3 py-2 text-xs bg-gray-800 border ${borderColor} rounded-lg focus:border-${isUser ? "purple" : "blue"}-500 focus:ring-2 focus:ring-${isUser ? "purple" : "blue"}-500/50 transition-all ${currentFormik.touched.password && currentFormik.errors.password ? "border-red-500" : ""}`}
                      placeholder="Create a strong password"
                      disabled={loading}
                    />
                    {currentFormik.touched.password &&
                      currentFormik.errors.password && (
                        <p className="mt-1 text-xs text-red-400">
                          {currentFormik.errors.password}
                        </p>
                      )}
                  </div>

                  {/* OTP Section */}
                  {showOtp && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        OTP Verification
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            name="otp"
                            value={currentFormik.values.otp}
                            onChange={currentFormik.handleChange}
                            onBlur={currentFormik.handleBlur}
                            className={`w-full px-3 py-2 text-xs bg-gray-800 border ${borderColor} rounded-lg focus:border-${isUser ? "purple" : "blue"}-500 focus:ring-2 focus:ring-${isUser ? "purple" : "blue"}-500/50 transition-all ${currentFormik.touched.otp && currentFormik.errors.otp ? "border-red-500" : ""}`}
                            placeholder="Enter 6-digit OTP"
                            maxLength="6"
                            disabled={loading}
                          />
                          {currentFormik.touched.otp &&
                            currentFormik.errors.otp && (
                              <p className="mt-1 text-xs text-red-400">
                                {currentFormik.errors.otp}
                              </p>
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResendOtp(currentFormik)}
                          className="px-3 py-2 text-xs bg-gray-800 text-gray-300 border border-blue-500/30 rounded-lg hover:bg-blue-900/30 hover:text-white transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading || !currentFormik.values.email}
                        >
                          {loading ? "..." : "Resend"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-gray-800">
                  {!showOtp ? (
                    <button
                      type="button"
                      onClick={() => handleGetOtp(currentFormik)}
                      className={`w-full py-2 text-xs bg-linear-to-r ${gradient} text-white font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={loading || !currentFormik.values.email}
                    >
                      {loading ? (
                        <>
                          <Loading small />
                          Sending...
                        </>
                      ) : (
                        "Get Verification OTP"
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={`w-full py-2 text-xs bg-linear-to-r ${gradient} text-white font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={loading || !currentFormik.isValid}
                    >
                      {loading ? (
                        <>
                          <Loading small />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          {isUser ? "Create Account" : "Register as Trainer"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              {/* Switch Notice */}
              <div className="text-center mt-3 pt-3 border-t border-gray-800">
                <p className="text-xs text-gray-400">
                  {isUser ? (
                    <>
                      Are you a trainer?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveForm("trainer");
                          setShowOtp(false);
                          setOtpSent(false);
                          dispatch(clearError());
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        disabled={loading}
                      >
                        Join as Trainer
                      </button>
                    </>
                  ) : (
                    <>
                      Looking for fitness guidance?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveForm("user");
                          setShowOtp(false);
                          setOtpSent(false);
                          dispatch(clearError());
                        }}
                        className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                        disabled={loading}
                      >
                        Become a Member
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <div className="text-center text-xs text-gray-500">
              <p>By signing up, you agree to our Terms and Privacy Policy</p>
              <p className="mt-1">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Signup;
