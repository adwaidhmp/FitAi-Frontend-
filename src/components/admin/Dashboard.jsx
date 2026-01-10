import React from "react";
import {
  Users,
  Dumbbell,
  CreditCard,
  Activity,
  ArrowUpRight,
  TrendingUp,
  UserPlus
} from "lucide-react";

const Dashboard = () => {
  // Placeholder stats - in a real app, these would come from an API
  // Since we removed fake data, we show neutral or empty states
  const stats = [
    {
      label: "Total Users",
      value: "--",
      icon: <Users size={24} />,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      label: "Active Trainers",
      value: "--",
      icon: <Dumbbell size={24} />,
      color: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    {
      label: "Revenue",
      value: "--",
      icon: <CreditCard size={24} />,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      label: "Pending Approvals",
      value: "--",
      icon: <Activity size={24} />,
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm">Welcome back, Admin</p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-lg border ${stat.color}`}
              >
                {stat.icon}
              </div>
              <span className="flex items-center text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-900/30">
                <TrendingUp size={12} className="mr-1" />
                Live
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT ACTIVITY PLACEHOLDER */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <button className="text-sm text-purple-400 hover:text-purple-300">
              View All
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
             <Activity size={48} className="mb-4 opacity-20" />
             <p>No recent activities found</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border border-gray-800 bg-black/20 hover:bg-gray-800 hover:border-purple-500/50 transition-all group text-left">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserPlus size={20} />
              </div>
              <h4 className="font-semibold text-white">Review Trainers</h4>
              <p className="text-xs text-gray-400 mt-1">
                Check pending applications
              </p>
            </button>

            <button className="p-4 rounded-xl border border-gray-800 bg-black/20 hover:bg-gray-800 hover:border-purple-500/50 transition-all group text-left">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CreditCard size={20} />
              </div>
              <h4 className="font-semibold text-white">Update Plans</h4>
              <p className="text-xs text-gray-400 mt-1">
                Manage premium pricing
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
