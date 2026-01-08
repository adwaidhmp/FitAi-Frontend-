import React from "react";
import {
  Sparkles,
  Users,
  MessageSquare,
  ShoppingBag,
  User,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrainerHome = () => {
  const navigate = useNavigate();

  return (
    <div className="text-white">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Trainer
              </span>
            </h2>
            <p className="text-gray-400">
              Manage your clients and training sessions
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:opacity-90 transition-opacity">
              Schedule Session
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Active Clients",
              value: "24",
              color: "text-green-400",
              icon: "👥",
            },
            {
              label: "Pending Requests",
              value: "8",
              color: "text-orange-400",
              icon: "📋",
            },
            {
              label: "Sessions Today",
              value: "6",
              color: "text-blue-400",
              icon: "🎯",
            },
            {
              label: "Monthly Earnings",
              value: "$3.2K",
              color: "text-purple-400",
              icon: "💰",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity / Calls */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="text-yellow-400" size={20} />
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "View Clients",
                  icon: <Users size={24} />,
                  path: "/trainer-home/clients",
                  color: "bg-green-600/20 text-green-400"
                },
                {
                  label: "Check Requests",
                  icon: <ClipboardList size={24} />,
                  path: "/trainer-home/client-request",
                  color: "bg-orange-600/20 text-orange-400"
                },
                {
                  label: "Messages",
                  icon: <MessageSquare size={24} />,
                  path: "/trainer-home/chat-call",
                  color: "bg-blue-600/20 text-blue-400"
                },
                {
                  label: "Profile",
                  icon: <User size={24} />,
                  path: "/trainer-home/trainer-profile",
                  color: "bg-purple-600/20 text-purple-400"
                }
              ].map((action, idx) => (
                  <button 
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className={`p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 transition-colors group`}
                  >
                      <div className={`p-3 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                          {action.icon}
                      </div>
                      <span className="font-semibold text-sm">{action.label}</span>
                  </button>
              ))}
            </div>
        </div>

        {/* Placeholder for Schedule or Upcoming */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
             <div className="p-4 bg-gray-800 rounded-full mb-4">
                 <Sparkles className="w-8 h-8 text-blue-400" />
             </div>
             <h3 className="text-lg font-bold mb-2">Upcoming Sessions</h3>
             <p className="text-gray-400 text-sm">You have no sessions scheduled for today.</p>
             <button className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                 View Calendar
             </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerHome;
