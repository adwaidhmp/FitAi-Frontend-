import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Timer,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Loading from "../Loading";

import {
  fetchCurrentWorkout,
  fetchTodayWorkoutLogs,
  logWorkoutExercise,
  generateWorkout,
  clearWorkoutError,
} from "../../redux/user_slices/workoutSlice";

const WORKOUT_CHOICES = [
  { value: "cardio", label: "Cardio" },
  { value: "strength", label: "Strength" },
  { value: "mixed", label: "Mixed" },
];

const ExerciseSlider = () => {
  const dispatch = useDispatch();
  const [selectedType, setSelectedType] = useState(null);

  const {
    plan = null,
    status = "idle", // idle | pending | ready | failed
    loading = false,
    error = null,
    loggedExercises = {},
    generating = false,
  } = useSelector((state) => state.workout || {});

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    dispatch(fetchCurrentWorkout());
    dispatch(fetchTodayWorkoutLogs());

    return () => {
      dispatch(clearWorkoutError());
    };
  }, [dispatch]);

  if (loading && !plan && status !== "pending") {
    return <div className="text-gray-400">Loading workout...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-900/10 p-4 rounded-lg border border-red-500/30 text-center">
        <p className="mb-2">{error}</p>
        <button
          onClick={() => dispatch(fetchCurrentWorkout())}
          className="px-4 py-2 bg-red-900/30 rounded-lg hover:bg-red-900/50 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  /* =========================
     PENDING / GENERATING
  ========================= */
  if (status === "pending") {
    return (
      <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800">
        <h3 className="text-2xl font-bold mb-3">Generating Your Workout</h3>
        <p className="text-gray-400 mb-6">
          AI is building your weekly plan. This usually takes a few seconds.
        </p>
        <div className="animate-pulse text-blue-400 mb-8">
          <Zap className="w-12 h-12 mx-auto mb-2" />
          <span className="text-sm">Processing...</span>
        </div>
        <button
          onClick={() => dispatch(fetchCurrentWorkout())}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition font-bold"
        >
          <RefreshCw size={18} />
          Refresh Status
        </button>
      </div>
    );
  }

  /* =========================
     IDLE / NO PLAN
  ========================= */
  // If we are 'idle', OR 'failed', OR 'ready' but no plan data (fallback)
  if (status === "idle" || (status === "ready" && !plan)) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-600 rounded-2xl">
            <Zap className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2">Choose Your Workout Style</h3>

        <p className="text-gray-400 mb-6">
          Select a workout type and generate your weekly plan.
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {WORKOUT_CHOICES.map((choice) => (
            <button
              key={choice.value}
              onClick={() => setSelectedType(choice.value)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                selectedType === choice.value
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </div>

        <button
          disabled={!selectedType || generating}
          onClick={() => dispatch(generateWorkout(selectedType))}
          className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <Loading small /> Starting...
            </span>
          ) : (
            "Generate Workout Plan"
          )}
        </button>
      </div>
    );
  }

  /* =========================
     SAFE SESSION ACCESS
  ========================= */
  const session = plan?.sessions?.sessions?.[0];
  const exercises = session?.exercises || [];

  if (!session || exercises.length === 0) {
    // If status is ready but data is missing/malformed, treat as error or empty
    return <div className="text-gray-400">Workout data is empty.</div>;
  }

  /* =========================
     HANDLERS
  ========================= */
  const handleComplete = (exercise) => {
    if (loggedExercises[exercise.name]) return;

    dispatch(
      logWorkoutExercise({
        exercise_name: exercise.name,
        duration_sec: exercise.duration_sec,
        intensity: exercise.intensity,
        status: "completed",
      })
    );
  };

  const handleSkip = (exercise) => {
    if (loggedExercises[exercise.name]) return;

    dispatch(
      logWorkoutExercise({
        exercise_name: exercise.name,
        status: "skipped",
      })
    );
  };

  /* =========================
     TOTALS
  ========================= */
  const totalDurationMin = Math.round(
    exercises.reduce((sum, e) => sum + (e.duration_sec || 0), 0) / 60
  );

  const totalCalories = exercises.reduce(
    (sum, e) => sum + (e.estimated_calories || 0),
    0
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-1">Weekly Workout Plan</h3>
        <p className="text-gray-400">
          {plan.goal} · {plan.workout_type} · {plan.week_start} → {plan.week_end}
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8 bg-blue-900/30 rounded-2xl p-6 border border-blue-800/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold">{session.name}</h4>
            <p className="text-gray-300">Repeat daily this week</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={<Timer className="w-4 h-4" />} label="Duration" value={`${totalDurationMin} mins`} />
          <Stat icon={<Target className="w-4 h-4" />} label="Exercises" value={exercises.length} />
          <Stat icon={<Flame className="w-4 h-4" />} label="Calories" value={totalCalories} />
          <Stat icon={<TrendingUp className="w-4 h-4" />} label="Intensity" value={exercises[0]?.intensity} />
        </div>
      </div>

      {/* Exercises */}
      <div className="grid gap-4">
        {exercises.map((ex) => {
          const logged = loggedExercises[ex.name];

          return (
            <div
              key={ex.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-lg">{ex.name}</h4>
                <span className="text-sm text-gray-400 capitalize">
                  {ex.intensity}
                </span>
              </div>

              <div className="flex gap-6 text-sm text-gray-300 mb-4">
                <div>{Math.round(ex.duration_sec / 60)} mins</div>
                <div>{ex.estimated_calories} kcal</div>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={!!logged}
                  onClick={() => handleComplete(ex)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm font-semibold disabled:opacity-40"
                >
                  <CheckCircle size={16} /> Complete
                </button>

                <button
                  disabled={!!logged}
                  onClick={() => handleSkip(ex)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-sm font-semibold disabled:opacity-40"
                >
                  <XCircle size={16} /> Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }) => (
  <div className="bg-blue-900/40 rounded-xl p-3">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <div className="font-bold capitalize">{value}</div>
  </div>
);

const Flame = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
    />
  </svg>
);

export default ExerciseSlider;