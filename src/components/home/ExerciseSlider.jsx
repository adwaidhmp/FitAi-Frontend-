import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Timer,
  Target,
  Zap,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

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
    loading = false,
    error = null,
    loggedExercises = {},
    logging = false,
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

  if (loading) {
    return <div className="text-gray-400">Loading workout...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  /* =========================
     GENERATING STATE
  ========================= */
  if (generating) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-600 rounded-2xl animate-pulse">
            <Zap className="w-8 h-8" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2">
          Generating Workout Plan
        </h3>
        <p className="text-gray-400">
          This takes a few seconds. Do not refresh.
        </p>
      </div>
    );
  }

  /* =========================
     NO WORKOUT YET (CHOICES)
  ========================= */
  if (!plan) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-600 rounded-2xl">
            <Zap className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2">
          Choose Your Workout Style
        </h3>
        <p className="text-gray-400 mb-6">
          Select a workout type and generate your weekly plan.
        </p>

        {/* Choices */}
        <div className="flex justify-center gap-3 mb-6">
          {WORKOUT_CHOICES.map((choice) => (
            <button
              key={choice.value}
              onClick={() => setSelectedType(choice.value)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                selectedType === choice.value
                  ? "bg-blue-600 border-blue-500"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {choice.label}
            </button>
          ))}
        </div>

        {/* Generate */}
        <button
          disabled={!selectedType}
          onClick={() => dispatch(generateWorkout(selectedType))}
          className="px-6 py-3 bg-blue-600 rounded-xl font-semibold disabled:opacity-50"
        >
          Generate Workout
        </button>
      </div>
    );
  }

  /* =========================
     SAFE SESSION ACCESS
  ========================= */
  const session = plan?.sessions?.sessions?.[0];
  if (!session) {
    return (
      <div className="text-gray-400">
        Workout plan exists but no sessions found.
      </div>
    );
  }

  const exercises = session.exercises || [];

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
     RENDER WORKOUT
  ========================= */
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Weekly Workout Plan</h3>
        <p className="text-gray-400">
          {plan.goal} · {plan.workout_type} · {plan.week_start} → {plan.week_end}
        </p>
      </div>

      <div className="mb-8 bg-linear-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-800/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold">{session.name}</h4>
            <p className="text-gray-300">Repeat daily for this week</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={<Timer className="w-4 h-4" />} label="Duration" value={`${totalDurationMin} mins`} />
          <Stat icon={<Target className="w-4 h-4" />} label="Exercises" value={exercises.length} />
          <Stat icon={<Flame className="w-4 h-4" />} label="Calories" value={totalCalories} />
          <Stat icon={<TrendingUp className="w-4 h-4" />} label="Level" value={exercises[0]?.intensity} />
        </div>
      </div>

      {/* Exercises grid unchanged */}
    </div>
  );
};

const Stat = ({ icon, label, value }) => (
  <div className="bg-blue-900/30 rounded-xl p-3">
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
