import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Edit,
  Save,
  Plus,
  Check,
  X,
  CreditCard,
  DollarSign
} from "lucide-react";

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

  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm({ plan: "", price: "", is_active: true });
    setIsEditing(false);
  }

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
      setIsEditing(false);
    });
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Premium Plans</h2>
          <p className="text-gray-400 text-sm">
            Configure subscription pricing and availability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM CARD */}
        <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    {isEditing ? <Edit size={18}/> : <Plus size={18}/>}
                    {isEditing ? "Edit Plan" : "Add New Plan"}
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Plan Type</label>
                        <select
                            name="plan"
                            value={form.plan}
                            onChange={handleChange}
                            disabled={isEditing} // Often code is PK, editable? logic says upsert uses plan as key probably
                            className="w-full bg-black border border-gray-800 text-white p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Plan</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Price (INR)</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="number"
                                name="price"
                                placeholder="0.00"
                                value={form.price}
                                onChange={handleChange}
                                className="w-full bg-black border border-gray-800 text-white pl-10 pr-4 p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-300">Active</span>
                        </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 py-2 px-4 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            ) : (
                                <Save size={18} />
                            )}
                            {isEditing ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* LIST CARD */}
        <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Plan Name</th>
                                <th className="p-4 font-medium">Price</th>
                                <th className="p-4 font-medium">Duration</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                             {plans.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No plans configured yet.
                                    </td>
                                </tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan.code} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 font-medium text-white capitalize flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gray-800 text-purple-400">
                                                <CreditCard size={18} />
                                            </div>
                                            {plan.code}
                                        </td>
                                        <td className="p-4 text-white font-bold">
                                            ₹{plan.price}
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {plan.duration_days} days
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                plan.is_active ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-red-900/20 text-red-400 border border-red-900/30'
                                            }`}>
                                                {plan.is_active ? <Check size={12}/> : <X size={12}/>}
                                                {plan.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleEdit(plan)}
                                                className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 hover:text-white transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPremiumPlans;
