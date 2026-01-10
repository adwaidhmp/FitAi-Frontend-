import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Check,
  Crown,
  Zap,
  Star,
  Shield,
  HelpCircle,
  TrendingUp,
  Users,
} from "lucide-react";

import { fetchPremiumPlans } from "../../redux/user_slices/premiumSlice";
import { fetchUserProfile } from "../../redux/user_slices/profileSlice";

const PremiumPlans = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { plans, loading, error } = useSelector((state) => state.premium);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchPremiumPlans());
  }, [dispatch]);

  /* ============================
     RENDER HELPERS
  ============================ */
  const renderBenefit = (icon, title, desc) => (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center hover:border-purple-500/30 transition-colors">
      <div className="inline-flex p-3 rounded-xl bg-gray-800 text-purple-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
            <Crown size={16} />
            <span>Premium Access</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Unlock{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Elite Fitness
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Get personalized guidance, advanced analytics, and direct access to
            certified trainers. Choose the plan that fits your goals.
          </p>
        </div>

        {/* PLANS GRID */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Loading premium plans...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === 1; // Arbitrary logic for visual variety
              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col p-6 rounded-3xl border ${
                    isPopular
                      ? "bg-gray-900/80 border-purple-500 shadow-2xl shadow-purple-900/20 scale-105 z-10"
                      : "bg-gray-900/40 border-gray-800 hover:border-gray-700"
                  } transition-all duration-300`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.label}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{plan.price}</span>
                      <span className="text-gray-400 text-sm">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 p-0.5 rounded-full bg-green-500/20 text-green-400">
                          <Check size={12} />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      navigate(`/buy-premium/${plan.code}`, {
                        state: {
                          from: location.state?.from || location.pathname,
                        },
                      })
                    }
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      isPopular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* WHY UPGRADE */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Go Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderBenefit(
              <Users size={24} />,
              "Expert Guidance",
              "Connect directly with certified trainers. Get feedback on your form, personalized advice, and ongoing support for your journey."
            )}
            {renderBenefit(
              <TrendingUp size={24} />,
              "Advanced Analytics",
              "Unlock deeper insights into your progress. Visual charts for checking weight trends, calorie intake, and workout consistency."
            )}
            {renderBenefit(
              <Shield size={24} />,
              "Priority Support",
              "Get faster responses from our support team and priority access to new features and workout programs before anyone else."
            )}
          </div>
        </div>

        {/* FAQ (Simulated) */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              [
                "Can I cancel anytime?",
                "Yes, you can cancel your subscription at any time. Your premium benefits will continue until the end of the billing period.",
              ],
              [
                "What payment methods do you accept?",
                "We accept all major credit cards, debit cards, UPI, and net banking via our secure Razorpay integration.",
              ],
              [
                "Is personal training included?",
                "Yes! All premium plans include access to chat and consult with our certified trainers.",
              ],
            ].map(([q, a], i) => (
              <div
                key={i}
                className="bg-gray-900/30 border border-gray-800 rounded-xl p-6"
              >
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-purple-400" /> {q}
                </h4>
                <p className="text-gray-400 text-sm ml-6">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlans;
