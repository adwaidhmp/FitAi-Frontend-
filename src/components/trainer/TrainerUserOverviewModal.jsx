import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrainerUserOverview,
  clearTrainerUserOverview,
} from "../../redux/trainer_slices/trainerUserOverviewSlice";
import { X } from "lucide-react";

const TrainerUserOverviewModal = ({ userId, onClose }) => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state) => state.trainerUserOverview
  );

  /* =======================
     FETCH ON OPEN
  ======================== */
  useEffect(() => {
    if (userId) {
      dispatch(fetchTrainerUserOverview(userId));
    }

    return () => {
      dispatch(clearTrainerUserOverview());
    };
  }, [userId, dispatch]);

  /* =======================
     LOADING STATE
  ======================== */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-gray-900 text-white px-6 py-4 rounded-xl">
          Loading user details...
        </div>
      </div>
    );
  }

  /* =======================
     ERROR STATE
  ======================== */
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-gray-900 text-white px-6 py-4 rounded-xl">
          <p className="text-red-400">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /* =======================
     DATA SAFETY
  ======================== */
  if (!data || !data.profile) return null;

  const {
    profile,
    diet_plan,
    diet_logs = [],
    workout_plan,
    workout_logs = [],
    weight_logs = [],
    weekly_stats,
  } = data;

  /* =======================
     RENDER
  ======================== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white rounded-2xl shadow-xl p-6">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-6">Weekly User Overview</h2>

        {/* =======================
            PROFILE
        ======================== */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Gender: {profile.gender || "-"}</div>
            <div>DOB: {profile.dob || "-"}</div>
            <div>Height: {profile.height_cm || "-"} cm</div>
            <div>Weight: {profile.weight_kg || "-"} kg</div>
            <div>Target Weight: {profile.target_weight_kg || "-"} kg</div>
            <div>Goal: {profile.goal || "-"}</div>
            <div>Activity Level: {profile.activity_level || "-"}</div>
            <div>Experience: {profile.exercise_experience || "-"}</div>
          </div>
        </section>

        {/* =======================
            WEEKLY STATS
        ======================== */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">This Week Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              Calories Intake:{" "}
              <span className="font-semibold text-green-400">
                {weekly_stats?.calories_in ?? 0} kcal
              </span>
            </div>
            <div>
              Calories Burned:{" "}
              <span className="font-semibold text-red-400">
                {weekly_stats?.calories_burned ?? 0} kcal
              </span>
            </div>
          </div>
        </section>

        {/* =======================
            DIET PLAN
        ======================== */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Diet Plan (This Week)</h3>
          {diet_plan ? (
            <div className="text-sm space-y-2">
              <div>
                Week: {diet_plan.week_start} → {diet_plan.week_end}
              </div>
              <div>Daily Calories: {diet_plan.daily_calories}</div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No active diet plan</p>
          )}
        </section>

        {/* =======================
            MEAL LOGS
        ======================== */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Meals Logged (This Week)</h3>
          {diet_logs.length > 0 ? (
            <div className="space-y-2 text-sm">
              {diet_logs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex justify-between bg-gray-800 px-3 py-2 rounded"
                >
                  <span>
                    {log.date} — {log.meal_type} ({log.source})
                  </span>
                  <span>{log.calories} kcal</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No meals logged this week</p>
          )}
        </section>

        {/* =======================
            WORKOUT PLAN
        ======================== */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Workout Plan (This Week)</h3>
          {workout_plan ? (
            <div className="text-sm space-y-2">
              <div>
                Week: {workout_plan.week_start} → {workout_plan.week_end}
              </div>
              <div>Goal: {workout_plan.goal}</div>
              <div>Type: {workout_plan.workout_type}</div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No active workout plan</p>
          )}
        </section>

        {/* =======================
            WORKOUT LOGS
        ======================== */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Workouts Completed (This Week)
          </h3>
          {workout_logs.length > 0 ? (
            <div className="space-y-2 text-sm">
              {workout_logs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex justify-between bg-gray-800 px-3 py-2 rounded"
                >
                  <span>
                    {log.date} — {log.exercise_name} ({log.status})
                  </span>
                  <span>{log.calories_burnt} kcal</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No workouts logged this week
            </p>
          )}
        </section>

        {/* =======================
            WEIGHT LOGS
        ======================== */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Weight Logs (This Week)</h3>
          {weight_logs.length > 0 ? (
            <div className="space-y-2 text-sm">
              {weight_logs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex justify-between bg-gray-800 px-3 py-2 rounded"
                >
                  <span>{log.logged_at}</span>
                  <span>{log.weight_kg} kg</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No weight entries this week
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TrainerUserOverviewModal;
