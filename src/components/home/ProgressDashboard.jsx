import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Flame,
  Dumbbell,
  Scale,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";

import {
  fetchDailyProgress,
  fetchWeeklyProgress,
  fetchMonthlyProgress,
} from "../../redux/user_slices/dietAnalyticsSlice";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ---------------- SMALL UI PARTS ---------------- */

const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} className="text-indigo-400" />
      <h4 className="font-semibold">{title}</h4>
    </div>
    {children}
  </div>
);

const Metric = ({ label, value }) => (
  <div className="flex justify-between text-sm text-gray-300">
    <span>{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

const ProgressDashboard = () => {
  const dispatch = useDispatch();
  const { daily, weekly, monthly, loading } = useSelector(
    (state) => state.progress
  );

  useEffect(() => {
    dispatch(fetchDailyProgress());
    dispatch(fetchWeeklyProgress());

    const today = new Date();
    dispatch(
      fetchMonthlyProgress({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      })
    );
  }, [dispatch]);

  if (!daily || !weekly || !monthly) {
    return <p className="text-gray-400">Loading progress…</p>;
  }

  /* ---------------- CHART DATA ---------------- */

  const dailyCaloriesChart = [
    {
      name: "Eaten",
      value: daily.diet.calories,
    },
    {
      name: "Burnt",
      value: daily.workout.calories_burnt,
    },
  ];

  const weeklyCaloriesChart = [
    {
      name: "Intake",
      value: weekly.diet.calories,
    },
    {
      name: "Burn",
      value: weekly.workout.calories_burnt,
    },
  ];

  const macroChart = [
    { name: "Protein", value: daily.diet.protein },
    { name: "Carbs", value: daily.diet.carbs },
    { name: "Fat", value: daily.diet.fat },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Progress Overview</h2>
        <p className="text-gray-400 text-sm">
          Diet, workouts, calories, and weight insights
        </p>
      </div>

      {/* ================= DAILY ================= */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Today</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Diet Summary" icon={Flame}>
            <Metric label="Calories" value={`${daily.diet.calories} kcal`} />
            <Metric
              label="Target"
              value={`${daily.diet.target_calories ?? "—"} kcal`}
            />
            <Metric label="Skipped Meals" value={daily.diet.skipped_meals} />
            <p className="text-xs text-gray-400 mt-2">
              {daily.diet.reason}
            </p>
          </Card>

          <Card title="Workout" icon={Dumbbell}>
            <Metric
              label="Calories Burnt"
              value={`${daily.workout.calories_burnt} kcal`}
            />
          </Card>

          <Card title="Net Calories" icon={TrendingUp}>
            <p className="text-2xl font-bold">
              {daily.net_calories} kcal
            </p>
          </Card>
        </div>

        {/* DAILY CHARTS */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Calories Intake vs Burn" icon={Activity}>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCaloriesChart}>
                  <CartesianGrid stroke="#1f2937" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Macros Breakdown (g)" icon={Flame}>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroChart}>
                  <CartesianGrid stroke="#1f2937" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* ================= WEEKLY ================= */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">This Week</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Weekly Diet" icon={Flame}>
            <Metric label="Calories" value={`${weekly.diet.calories} kcal`} />
            <Metric
              label="Target"
              value={`${weekly.diet.target_calories ?? "—"} kcal`}
            />
            <p className="text-xs text-gray-400 mt-2">
              {weekly.diet.reason}
            </p>
          </Card>

          <Card title="Workout" icon={Dumbbell}>
            <Metric
              label="Burnt"
              value={`${weekly.workout.calories_burnt} kcal`}
            />
            <Metric
              label="Target"
              value={`${weekly.workout.target_burn ?? "—"} kcal`}
            />
            <p className="text-xs text-gray-400 mt-2">
              {weekly.workout.reason}
            </p>
          </Card>

          <Card title="Weight Change" icon={Scale}>
            <p className="text-2xl font-bold">
              {weekly.weight.change_kg ?? "—"} kg
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {weekly.weight.reason}
            </p>
          </Card>
        </div>

        <Card title="Weekly Intake vs Burn" icon={Calendar}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyCaloriesChart}>
                <CartesianGrid stroke="#1f2937" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ================= MONTHLY ================= */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">This Month</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Calories Eaten" icon={Flame}>
            <p className="text-2xl font-bold">
              {monthly.diet.calories} kcal
            </p>
          </Card>

          <Card title="Calories Burnt" icon={Dumbbell}>
            <p className="text-2xl font-bold">
              {monthly.workout.calories_burnt} kcal
            </p>
          </Card>

          <Card title="Net Calories" icon={TrendingUp}>
            <p className="text-2xl font-bold">
              {monthly.net_calories} kcal
            </p>
          </Card>
        </div>
      </div>

      {loading.daily || loading.weekly || loading.monthly ? (
        <p className="text-gray-500 text-sm">Refreshing data…</p>
      ) : null}
    </div>
  );
};

export default ProgressDashboard;
