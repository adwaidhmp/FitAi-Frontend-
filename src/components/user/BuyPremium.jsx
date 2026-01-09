import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";

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

  // ==============================
  // Open Razorpay
  // ==============================
  const openRazorpay = async (order) => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      alert("Razorpay SDK failed to load. Try again.");
      return;
    }

    const options = {
      key: order.razorpay_key,
      amount: order.amount * 100,
      currency: "INR",
      order_id: order.order_id,
      name: "Premium Subscription",
      description: `Buy ${order.plan} plan`,
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
      theme: { color: "#000000" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // ==============================
  // Create order on page load
  // ==============================
  useEffect(() => {
    dispatch(createPremiumOrder({ plan }));
  }, [dispatch, plan]);

  // ==============================
  // Open Razorpay when order ready
  // ==============================
  useEffect(() => {
    if (order) {
      openRazorpay(order);
    }
  }, [order]);

  // ==============================
  // Navigate back on success
  // ==============================
  useEffect(() => {
    if (success) {
      dispatch(resetPremiumState());
      const from = location.state?.from?.pathname || location.state?.from || "/home";
      navigate(from, { replace: true });
    }
  }, [success, dispatch, navigate, location]);

  return (
    <div className="p-6 text-center">
      {loading && <p>Processing payment...</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default BuyPremium;
