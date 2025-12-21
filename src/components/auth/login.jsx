import React, { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Dumbbell,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  UserPlus,
  Brain,
  Apple,
  Target,
  Shield,
} from "lucide-react";
import {
  loginUser,
  googleLogin,
  clearError,
} from "../../redux/user_slices/authSlice";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error } = useSelector((state) => state.auth);

  const handleGoogleCallback = useCallback(
    async (response) => {
      console.log("GSI response:", response);
      setIsGoogleLoading(true);
      try {
        await dispatch(googleLogin({ id_token: response.credential })).unwrap();
        const from = location.state?.from?.pathname || "/home";
        navigate(from, { replace: true });
        console.log("Google login successful");
      } catch (err) {
        console.error("Google login failed:", err);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [dispatch, navigate, location]
  );

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Google button requires a numeric pixel width (not percentage).
        // We'll render it at 320px which works well responsively inside our layout.
        window.google?.accounts?.id.renderButton(
          document.getElementById("googleSignInButton"),
          {
            theme: "filled_black",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: "100%",
          }
        );
      }
    };

    if (!GOOGLE_CLIENT_ID) {
      console.warn(
        "VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work."
      );
      return;
    }

    const loadGoogleScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.body.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    };

    loadGoogleScript();

    return () => {
      // Cleanup if needed
    };
  }, [handleGoogleCallback]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { user } = await dispatch(loginUser(values)).unwrap();

        if (!user || !user.role) {
          throw new Error("Invalid login response: role missing");
        }

        if (user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (user.role === "trainer") {
          navigate("/trainer-home", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error("Login failed:", err);
        // show error message here
      }
    },
  });


  return (
    <div className="min-h-screen bg-black text-white overflow-auto">
      {/* Main Split Layout - No scrolling */}
      <div className="h-full flex flex-col lg:flex-row">
        {/* Left Column - Login Form */}
        <div className="lg:w-1/2 h-full p-4 lg:p-6 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Brand Header - Compact */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl mb-3">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
                  FitAI
                </span>
              </h1>
              <p className="text-gray-400 text-sm">Sign in to your account</p>
            </div>

            {/* Error Display - Only when present */}
            {error && (
              <div className="mb-4 animate-fadeIn">
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="text-red-200 text-xs flex-1">
                    {typeof error === "object"
                      ? JSON.stringify(error, null, 2)
                      : error}
                  </div>
                  <button
                    onClick={() => dispatch(clearError())}
                    className="ml-2 text-red-300 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Login Card - Compact */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              {/* Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 text-sm bg-gray-800 border ${formik.touched.email && formik.errors.email
                        ? "border-red-500"
                        : "border-gray-700"
                      } rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-xs text-red-400">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-3 py-2 text-sm pr-10 bg-gray-800 border ${formik.touched.password && formik.errors.password
                          ? "border-red-500"
                          : "border-gray-700"
                        } rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400 disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-2 h-3" />
                      ) : (
                        <Eye className="w-2 h-3" />
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1 text-xs text-red-400">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 disabled:opacity-50"
                      disabled={loading}
                    />
                    <span className="text-xs text-gray-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    disabled={loading}
                    onClick={() => navigate("/reset-password")}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading || !formik.isValid}
                  className={`w-full py-2.5 text-sm bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-4 flex items-center">
                <div className="flex-1 h-px bg-gray-800"></div>
                <span className="px-3 text-xs text-gray-500">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>

              {/* Google OAuth Button */}
              <div className="mb-4">
                <div
                  id="googleSignInButton"
                  className={`w-full ${isGoogleLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {isGoogleLoading && (
                    <div className="flex items-center justify-center py-2.5 bg-gray-800 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="text-center text-xs text-gray-500">
                <p>By signing in, you agree to our Terms and Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Signup/Trainer Section */}
        <div className="lg:w-1/2 h-full bg-linear-to-br from-gray-900 via-black to-purple-900/20 p-4 lg:p-6 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Welcome Message - Compact */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
                  Join Our Fitness Revolution
                </span>
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                AI-powered workouts, personalized nutrition plans, and expert
                guidance.
              </p>

              {/* Features - Compact */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-900/30 rounded-lg">
                    <Brain className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      AI-Powered Workouts
                    </h4>
                    <p className="text-xs text-gray-400">
                      Personalized routines that adapt
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-900/30 rounded-lg">
                    <Apple className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Smart Nutrition Plans
                    </h4>
                    <p className="text-xs text-gray-400">
                      Diet based on your goals
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-pink-900/30 rounded-lg">
                    <Target className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Progress Tracking
                    </h4>
                    <p className="text-xs text-gray-400">
                      Monitor with detailed analytics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signup Options */}
            <div className="space-y-4">
              {/* Regular Signup */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
                <h3 className="text-lg font-bold mb-2">New to FitAI?</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Create your free account. No credit card required.
                </p>
                <Link
                  to="/signup"
                  className="w-full inline-flex items-center justify-center py-2.5 text-sm bg-linear-to-r from-purple-900/30 to-pink-900/30 text-purple-300 border border-purple-700/30 rounded-lg hover:bg-purple-900/40 hover:text-purple-200 transition-all font-semibold"
                >
                  Create Free Account
                </Link>
              </div>

              {/* Trainer Signup */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold">
                    For Fitness Professionals
                  </h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Join our certified trainer network with exclusive tools.
                </p>
                <Link
                  to="/signup"
                  state={{ asTrainer: true }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-linear-to-r from-blue-900/30 to-cyan-900/30 text-blue-300 border border-blue-700/30 rounded-lg hover:bg-blue-900/40 hover:text-blue-200 transition-all font-semibold"
                >
                  <UserPlus className="w-4 h-4" />
                  Join as Certified Trainer
                </Link>
              </div>
            </div>

            {/* Stats/Benefits */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">50K+</div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">500+</div>
                  <div className="text-xs text-gray-400">Trainers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-400">98%</div>
                  <div className="text-xs text-gray-400">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
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

export default Login;
