import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchPremiumPlans,
  upsertPremiumPlan,
  clearPremiumPlanError,
} from "../../redux/admin_slices/admin_premiumPlanSlice";

const AdminPremiumPlans = () => {
  const dispatch = useDispatch();
  const { plans, loading, error } = useSelector(
    (state) => state.adminPremium
  );

  const [form, setForm] = useState({
    plan: "",
    price: "",
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchPremiumPlans());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearPremiumPlanError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (plan) => {
    setForm({
      plan: plan.code,
      price: plan.price,
      is_active: plan.is_active,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.plan || !form.price) return;

    dispatch(
      upsertPremiumPlan({
        plan: form.plan,
        price: Number(form.price),
        is_active: form.is_active,
      })
    ).then(() => {
      setForm({ plan: "", price: "", is_active: true });
    });
  };

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-xl font-semibold mb-4">Premium Plans</h2>

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 border rounded-md"
      >
        <div className="grid grid-cols-3 gap-4">
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Plan</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <input
            type="number"
            name="price"
            placeholder="Price (INR)"
            value={form.price}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Plan"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Plan</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Duration</th>
            <th className="border p-2">Active</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {plans.map((plan) => (
            <tr key={plan.code}>
              <td className="border p-2 capitalize">{plan.code}</td>
              <td className="border p-2">₹{plan.price}</td>
              <td className="border p-2">
                {plan.duration_days} days
              </td>
              <td className="border p-2">
                {plan.is_active ? "Yes" : "No"}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {!plans.length && !loading && (
            <tr>
              <td
                colSpan="5"
                className="text-center p-4 text-gray-500"
              >
                No plans found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPremiumPlans;
