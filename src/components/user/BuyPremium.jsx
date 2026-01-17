import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, CreditCard, X, Lock } from "lucide-react";
import Loading from "../Loading";

import {
  createPremiumOrder,
  verifyPremiumPayment,
  resetPremiumState,
} from "../../redux/user_slices/premiumSlice";

// ==============================
// Razorpay Script Loader
// ==============================
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const BuyPremium = () => {
  const { plan } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { order, loading, success, error } = useSelector(
    (state) => state.premium
  );

  // Load order details on mount
  useEffect(() => {
    dispatch(createPremiumOrder({ plan }));
  }, [dispatch, plan]);

  // Handle successful payment navigation
  useEffect(() => {
    if (success) {
      dispatch(resetPremiumState());
      const from = location.state?.from?.pathname || location.state?.from || "/premium-plans";
      navigate(from, { replace: true });
    }
  }, [success, dispatch, navigate, location]);

  const handleCancel = () => {
    const from = location.state?.from?.pathname || location.state?.from || "/premium-plans";
    navigate(from, { replace: true });
  }

  const handlePayment = async () => {
    if (!order) return;

    const loaded = await loadRazorpayScript();

    if (!loaded) {
      alert("Razorpay SDK failed to load. Try again.");
      return;
    }

    const options = {
      key: order.razorpay_key,
      amount: order.amount * 100, // Amount is usually in smallest unit for Razorpay if not already
      currency: "INR",
      order_id: order.order_id,
      name: "Fitness AI Premium",
      description: `${order.plan} Subscription`,
      handler: function (response) {
        dispatch(
          verifyPremiumPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: order.plan,
          })
        );
      },
      theme: { color: "#9333ea" }, // Purple-600
      modal: {
        ondismiss: function() {
           // Optional: handle modal close if needed
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
            {/* CARD */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Secure Checkout</h2>
                    </div>
                    <button onClick={handleCancel} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                     {loading ? (
                         <Loading />
                     ) : error ? (
                         <div className="text-center py-8">
                             <div className="bg-red-900/20 text-red-400 p-4 rounded-xl border border-red-900/50 mb-4 inline-block">
                                 {error}
                             </div>
                             <p className="text-gray-500 mb-6">Something went wrong while fetching details.</p>
                             <button onClick={handleCancel} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
                                 Go Back
                             </button>
                         </div>
                     ) : (
                         order && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Amount</p>
                                    <h1 className="text-4xl font-bold text-white">₹{order.amount}</h1>
                                </div>

                                <div className="bg-black/40 rounded-xl p-4 border border-gray-800 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Plan</span>
                                        <span className="text-white font-medium capitalize">{order.plan} Access</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Description</span>
                                        <span className="text-white font-medium">Premium Membership</span>
                                    </div>
                                    <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                                        <span className="text-gray-300 font-medium">Total Payable</span>
                                        <span className="text-purple-400 font-bold">₹{order.amount}</span>
                                    </div>
                                </div>

                                {/* BUTTON GROUP */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handlePayment}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                                    >
                                        <Lock size={20} />
                                        Pay Securely
                                    </button>
                                    
                                    <button
                                        onClick={handleCancel}
                                        className="w-full py-3 bg-gray-800 rounded-xl text-gray-400 font-medium hover:bg-gray-700 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    <span>Payments are SSL encrypted and secure</span>
                                </div>
                            </div>
                         )
                     )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default BuyPremium;
