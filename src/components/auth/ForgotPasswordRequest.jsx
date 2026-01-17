// ForgotPasswordRequest.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";
import Loading from "../Loading";
import { requestPasswordChangeOtp } from "../../redux/user_slices/authSlice.jsx";

const ForgotPasswordRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    try {
      await dispatch(requestPasswordChangeOtp({ email })).unwrap();
      setIsSubmitted(true);
    } catch {
      // Error handled by Redux
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
          <p className="text-gray-300 mb-4">OTP sent to:</p>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{email}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() =>
                navigate("/reset-password-confirm", { state: { email } })
              }
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold"
            >
              Enter OTP
            </button>

            <button
              onClick={() => dispatch(requestPasswordChangeOtp({ email }))}
              disabled={loading}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
            >
              {loading ? (
                <Loading small />
              ) : (
                "Resend OTP"
              )}
            </button>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
            >
              Change Email
            </button>
          </div>

          <p className="text-gray-400 text-sm mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-purple-400 hover:text-purple-300"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-gray-400 mt-2">
              Enter your email to receive OTP
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
              />
              {emailError && (
                <p className="text-red-400 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm p-3 bg-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading small />
                  Sending...
                </div>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-purple-400 hover:text-purple-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordRequest;
