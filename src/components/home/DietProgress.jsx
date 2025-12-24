import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Flame, TrendingUp, Calendar, Weight, AlertCircle } from "lucide-react";

import {
  fetchDailyAnalytics,
  fetchWeeklyAnalytics,
  fetchMonthlyAnalytics,
  clearDietAnalytics,
} from "../../redux/user_slices/dietAnalyticsSlice";

const DietProgress = () => {
  const dispatch = useDispatch();

  // ✅ SELECT RAW STATE
  const diet = useSelector((state) => state.dietAnalytics);

  // ✅ NORMALIZE (NULL-SAFE)
  const dailyCalories =
    diet.dailyCalories && typeof diet.dailyCalories === "object"
      ? diet.dailyCalories
      : {};

  const weeklyProgress =
    diet.weeklyProgress && typeof diet.weeklyProgress === "object"
      ? diet.weeklyProgress
      : { days: {} };

  const monthlyCalories =
    diet.monthlyCalories && typeof diet.monthlyCalories === "object"
      ? diet.monthlyCalories
      : { daily_calories: {} };

  const monthlyWeight =
    diet.monthlyWeight && typeof diet.monthlyWeight === "object"
      ? diet.monthlyWeight
      : { weights: [] };

  const causeAnalysis =
    diet.causeAnalysis && typeof diet.causeAnalysis === "object"
      ? diet.causeAnalysis
      : { top_custom_days: [] };

  const { loading, error } = diet;

  useEffect(() => {
    dispatch(fetchDailyAnalytics());
    dispatch(fetchWeeklyAnalytics());
    dispatch(fetchMonthlyAnalytics());

    return () => {
      dispatch(clearDietAnalytics());
    };
  }, [dispatch]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  /* ============================
     DERIVED VALUES
  ============================ */

  // Daily
  const todayCalories = dailyCalories.calories ?? 0;

  // Weekly
  const weeklyDays = Object.keys(weeklyProgress.days || {});
  const weeklyLoggedDays = weeklyDays.length;
  const weeklyTarget = weeklyProgress.weekly_target_calories ?? 0;

  // Monthly calories
  const dailyValues = Object.values(monthlyCalories.daily_calories || {});

  const monthlyActual = monthlyCalories.monthly_actual ?? 0;
  const monthlyTarget = monthlyCalories.monthly_target ?? 0;

  const monthlyAvg =
    dailyValues.length > 0
      ? Math.round(
          dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length,
        )
      : 0;

  // Monthly weight
  const weights = monthlyWeight.weights || [];
  const startWeight = weights[0]?.weight;
  const currentWeight = weights[weights.length - 1]?.weight;
  const weightDelta =
    startWeight && currentWeight
      ? (currentWeight - startWeight).toFixed(1)
      : null;

  // Cause analysis
  const customCalories = causeAnalysis.total_custom_calories ?? 0;
  const topDays = causeAnalysis.top_custom_days || [];

  /* ============================
     UI
  ============================ */

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold">Your Progress</h3>
        <p className="text-gray-400">Calories, weight, and trends over time</p>
      </div>

      <div className="space-y-4">
        {/* Daily Calories */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="text-orange-500" size={18} />
            <h4 className="font-semibold">Today’s Calories</h4>
          </div>

          <p className="text-gray-300 text-sm">
            Consumed:{" "}
            <span className="font-semibold">{todayCalories} kcal</span>
          </p>

          {todayCalories === 0 && (
            <p className="text-gray-400 text-sm">No meals logged today</p>
          )}
        </div>

        {/* Weekly Progress */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-green-500" size={18} />
            <h4 className="font-semibold">Weekly Progress</h4>
          </div>

          <p className="text-gray-300 text-sm">
            Logged days:{" "}
            <span className="font-semibold">{weeklyLoggedDays}</span>
          </p>

          <p className="text-gray-400 text-sm">
            Weekly target: {weeklyTarget} kcal
          </p>

          {weeklyLoggedDays === 0 && (
            <p className="text-gray-400 text-sm">No meals logged this week</p>
          )}
        </div>

        {/* Monthly Calories */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="text-blue-500" size={18} />
            <h4 className="font-semibold">Monthly Calories</h4>
          </div>

          <p className="text-gray-300 text-sm">
            Average per day:{" "}
            <span className="font-semibold">{monthlyAvg} kcal</span>
          </p>

          <p className="text-gray-400 text-sm">
            Total consumed: {monthlyActual} kcal
          </p>

          <p className="text-gray-400 text-sm">Target: {monthlyTarget} kcal</p>

          {monthlyActual === 0 && (
            <p className="text-gray-400 text-sm">
              No calorie data for this month
            </p>
          )}
        </div>

        {/* Monthly Weight */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Weight className="text-purple-500" size={18} />
            <h4 className="font-semibold">Weight Change</h4>
          </div>

          {weights.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No weight updates this month
            </p>
          ) : (
            <>
              <p className="text-gray-300 text-sm">Start: {startWeight} kg</p>
              <p className="text-gray-300 text-sm">
                Current: {currentWeight} kg
              </p>
              <p className="text-gray-400 text-sm">Change: {weightDelta} kg</p>
            </>
          )}
        </div>

        {/* Cause Analysis */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-yellow-500" size={18} />
            <h4 className="font-semibold">Monthly Analysis</h4>
          </div>

          <p className="text-gray-300 text-sm">
            Custom meal calories:{" "}
            <span className="font-semibold">{customCalories} kcal</span>
          </p>

          {topDays.length > 0 ? (
            <ul className="text-sm text-gray-300 list-disc pl-5 mt-2">
              {topDays.map((day, idx) => (
                <li key={idx}>{day}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm mt-2">
              No high-calorie custom meals detected
            </p>
          )}
        </div>

        {loading && (
          <p className="text-gray-500 text-sm">Updating analytics…</p>
        )}
      </div>
    </div>
  );
};

export default DietProgress;
