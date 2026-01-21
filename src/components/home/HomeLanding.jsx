import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Dumbbell,
  Scale,
  Trophy,
  Utensils,
  Activity,
  LineChart,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { fetchDailyProgress } from "../../redux/user_slices/dietAnalyticsSlice";
import { fetchUserProfile } from "../../redux/user_slices/profileSlice";

const HomeLanding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: profile } = useSelector((state) => state.profile);
  const { daily, loading } = useSelector((state) => state.progress);

  useEffect(() => {
    dispatch(fetchDailyProgress());
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  const userName = user?.name || "Member";
  const userWeight = profile?.weight_kg || "--";

  const caloriesBurned = daily?.workout?.calories_burnt ?? 0;
  const caloriesIntake = daily?.diet?.calories ?? 0;
  const protein = daily?.diet?.protein ?? 0;

  return (
    <div className="text-white">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
                {userName.split(" ")[0]}
              </span>
            </h2>
            <p className="text-gray-400">
              Track your progress and stay consistent
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate("/home/exercise")}
              className="px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-opacity font-semibold"
            >
              Start Workout
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Calories Burned",
              value: caloriesBurned,
              color: "text-orange-400",
              icon: <Flame />,
            },
            {
              label: "Calories Intake",
              value: caloriesIntake,
              color: "text-blue-400",
              icon: <Utensils />,
            },
            {
              label: "Current Weight",
              value: `${userWeight} kg`,
              color: "text-purple-400",
              icon: <Scale />,
            },
            {
              label: "Protein",
              value: `${protein}g`,
              color: "text-yellow-400",
              icon: <Dumbbell />,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {loading.daily ? <span className="text-sm animate-pulse">...</span> : stat.value}
                </div>
                <span className={`${stat.color} opacity-80`}>{stat.icon}</span>
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Diet Plan",
                icon: <Utensils size={24} />,
                path: "/home/diet",
                color: "bg-green-600/20 text-green-400",
              },
              {
                label: "Workouts",
                icon: <Activity size={24} />,
                path: "/home/exercise",
                color: "bg-blue-600/20 text-blue-400",
              },
              {
                label: "My Progress",
                icon: <LineChart size={24} />,
                path: "/home/progress-dashboard",
                color: "bg-purple-600/20 text-purple-400",
              },
              {
                label: "Chat & Call",
                icon: <MessageSquare size={24} />,
                path: "/home/chat-call",
                color: "bg-pink-600/20 text-pink-400",
              },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-2 hover:bg-gray-800 transition-colors group"
              >
                <div
                  className={`p-3 rounded-full ${action.color} group-hover:scale-110 transition-transform`}
                >
                  {action.icon}
                </div>
                <span className="font-semibold text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Insight / Placeholder */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <div className="p-4 bg-gray-800 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">Today's Focus</h3>
          <p className="text-gray-400 text-sm mb-4">
            "Consistency is key. Follow your diet and crush your workout today!"
          </p>
          <button
            onClick={() => navigate("/home/diet")}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            Check Diet
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeLanding;
