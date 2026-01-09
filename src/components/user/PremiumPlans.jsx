import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { fetchPremiumPlans } from "../../redux/user_slices/premiumSlice";

const PremiumPlans = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { plans, loading, error } = useSelector(
    (state) => state.premium
  );

  useEffect(() => {
    dispatch(fetchPremiumPlans());
  }, [dispatch]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Choose Your Premium Plan
      </h2>

      {loading && <p>Loading plans...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className="border rounded-lg p-5 shadow-sm"
          >
            <h3 className="text-xl font-medium capitalize mb-2">
              {plan.label}
            </h3>

            <p className="text-3xl font-bold mb-3">
              ₹{plan.price}
            </p>

            <ul className="text-sm mb-4 list-disc list-inside">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            <button
              onClick={() =>
                navigate(`/buy-premium/${plan.code}`, {
                  state: { from: location.state?.from },
                })
              }
              className="w-full bg-black text-white py-2 rounded"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumPlans;
