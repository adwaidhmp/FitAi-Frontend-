// ForgotPasswordConfirm.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { changePassword, requestPasswordChangeOtp } from '../../redux/user_slices/authSlice.jsx';

const ForgotPasswordConfirm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !otp || !password || !confirmPassword) {
      setFormError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    
    try {
      await dispatch(changePassword({ 
        email: email.toLowerCase(), 
        otp, 
        new_password: password 
      })).unwrap();
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setFormError('');
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setFormError('Email is required to resend OTP');
      return;
    }
    
    try {
      await dispatch(requestPasswordChangeOtp({ email })).unwrap();
      setFormError('');
    } catch {
      // Error handled by Redux
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Password Reset Successful!</h1>
          <p className="text-gray-300 mb-6">Redirecting to login...</p>
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
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-gray-400 mt-2">Enter OTP and new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <label className="text-sm text-gray-300">Email</label>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">OTP (6 digits)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="123456"
                required
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">Check your email</span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Resend OTP
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <label className="text-sm text-gray-300">New Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm password"
                required
              />
            </div>

            {(formError || error) && (
              <div className="text-red-400 text-sm p-3 bg-red-900/30 rounded-lg">
                {formError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <button
              onClick={() => navigate('/login')}
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

export default ForgotPasswordConfirm;