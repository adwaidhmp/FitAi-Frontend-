import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
  Plus,
  RefreshCw,
  SkipForward,
  Weight,
} from "lucide-react";
import { message } from "antd";

import {
  fetchCurrentDietPlan,
  fetchTodayMealStatus,
  generateDietPlan,
  followMealFromPlan,
  skipMeal,
  logCustomMeal,
  logExtraMeal,
  updateWeight,
  clearDietActionState,
} from "../../redux/user_slices/dietActionsSlice";

const DietPlanSlider = () => {
  const dispatch = useDispatch();

  const {
    loading,
    error,
    currentPlan,
    mealStatus,
    lastResponse,
  } = useSelector((state) => state.dietActions);

  const [weight, setWeight] = useState("");
  const [extraMeal, setExtraMeal] = useState("");
  const [forceWeightUpdate, setForceWeightUpdate] = useState(false);

  /* ============================
     LOAD DATA
  ============================ */
  useEffect(() => {
    dispatch(fetchCurrentDietPlan());
    dispatch(fetchTodayMealStatus());

    return () => {
      dispatch(clearDietActionState());
    };
  }, [dispatch]);

  /* ============================
     TOASTS
  ============================ */
  useEffect(() => {
    if (lastResponse?.detail) {
      message.success(lastResponse.detail);
    }
  }, [lastResponse]);

  useEffect(() => {
    if (error) {
      // Check for specific backend error about automatic generation
      // "Diet plans are generated automatically after weekly weight updates."
      if (
        typeof error === "string" &&
        error.toLowerCase().includes("generated automatically")
      ) {
        setForceWeightUpdate(true);
        // We still show the error to explain WHY (or we could suppress it)
        message.info("Please update your weight to generate a new plan.");
      } else {
        message.error(error);
      }
    }
  }, [error]);

  /* ============================
     BACKEND-DRIVEN UI STATE
  ============================ */
  const showGenerate =
    !forceWeightUpdate &&
    (!currentPlan ||
      (!currentPlan.has_plan && currentPlan.can_generate));

  const isPending =
    currentPlan?.status === "pending";

  const showPlan =
    currentPlan?.status === "ready";

  const showWeightUpdate =
    currentPlan?.can_update_weight || forceWeightUpdate;

  /* ============================
     NORMALIZE PLAN
  ============================ */
  const dietPlan = useMemo(() => {
    if (!currentPlan?.meals) return null;

    return {
      daily_calories: currentPlan.daily_calories,
      meals: currentPlan.meals.map((meal) => ({
        meal_type: meal.name.toLowerCase(),
        display_name: meal.name,
        items: meal.items || [],
      })),
      disclaimer: currentPlan.disclaimer,
    };
  }, [currentPlan]);

  /* ============================
     CUSTOM MEALS STATE
  ============================ */
  const initialCustomMeals = useMemo(() => {
    if (!dietPlan?.meals) return {};
    return Object.fromEntries(
      dietPlan.meals.map((m) => [m.meal_type, ""])
    );
  }, [dietPlan?.meals]);

  const [customMeals, setCustomMeals] = useState(initialCustomMeals);

  useEffect(() => {
    setCustomMeals(initialCustomMeals);
  }, [initialCustomMeals]);

  /* ============================
     HANDLERS
  ============================ */
  const handleCustomMeal = (mealType) => {
    const text = customMeals[mealType];

    if (!text?.trim()) {
      message.warning("Enter food details first");
      return;
    }

    dispatch(
      logCustomMeal({
        meal_type: mealType,
        food_text: text,
      })
    );
  };

  const handleExtraMeal = () => {
    if (!extraMeal.trim()) {
      message.warning("Enter extra food details");
      return;
    }

    dispatch(logExtraMeal({ food_text: extraMeal }));
    setExtraMeal("");
  };

  const handleWeightUpdate = () => {
    if (!weight) {
      message.warning("Enter weight first");
      return;
    }

    dispatch(updateWeight({ weight_kg: weight }));
    setWeight("");
    setForceWeightUpdate(false); // Reset forced state after update
  };
    
    const handleRefresh = () => {
        dispatch(fetchCurrentDietPlan());
    };

  /* ============================
     LOADING (FIRST LOAD ONLY)
  ============================ */
  if (loading && !currentPlan) {
    return <div className="text-gray-400">Loading diet plan…</div>;
  }

  /* ============================
     GENERATE FIRST PLAN
  ============================ */
  if (showGenerate) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-bold mb-3">No Diet Plan Yet</h3>
        <p className="text-gray-400 mb-6">
          Generate your first AI-powered diet plan.
        </p>
        <button
          disabled={loading}
          onClick={() => dispatch(generateDietPlan())}
          className="px-6 py-3 bg-purple-600 rounded-md disabled:opacity-50"
        >
          Generate Diet Plan
        </button>
      </div>
    );
  }

  /* ============================
     PLAN GENERATING (ASYNC)
  ============================ */
  if (isPending) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-bold mb-3">
          Generating Your Diet Plan
        </h3>
        <p className="text-gray-400 mb-6">
          This may take a moment.
        </p>
        <div className="animate-pulse text-purple-400 mb-6">
          AI is building your plan…
        </div>
        <button
            onClick={handleRefresh}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition font-medium text-sm"
        >
            <RefreshCw size={16} />
            Refresh Status
        </button>
      </div>
    );
  }
    
  /* ============================
     FORCED WEIGHT UPDATE VIEW / NO PLAN VIEW
  ============================ */
  // If we have no plan data to show, but we are supposed to show weight update
  if (!showPlan && !dietPlan) {
      if (forceWeightUpdate) {
          return (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Update Weight Required</h3>
                <p className="text-gray-400 mb-6">
                    Your previous diet plan has expired. Please update your weight to generate a new one.
                </p>
                
                <div className="max-w-xs mx-auto flex gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight (kg)"
                    className="flex-1 bg-gray-800 rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleWeightUpdate}
                    className="px-3 py-2 bg-blue-600 rounded-md"
                  >
                    <Weight size={16} />
                  </button>
                </div>
            </div>
          );
      }
      return null;
  }

  /* ============================
     UI
  ============================ */
  return (
    <div>
      {/* Header */}
      {dietPlan && (
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Your AI Diet Plan</h3>
          <p className="text-gray-400">
            Daily target: {dietPlan.daily_calories} kcal
          </p>
        </div>

        <button
          disabled
          className="px-4 py-2 bg-gray-700 rounded-md text-sm opacity-50 cursor-not-allowed"
        >
          Diet Plan Active
        </button>
      </div>
      )}

      {/* Meals */}
      {dietPlan && (
      <div className="space-y-4">
        {dietPlan.meals.map((meal) => {
          const locked = mealStatus?.[meal.meal_type] !== null;

          return (
            <div
              key={meal.meal_type}
              className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
            >
              <h4 className="font-semibold mb-2 capitalize">
                {meal.display_name}
              </h4>

              <ul className="text-sm text-gray-300 mb-3 list-disc pl-5">
                {meal.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              {!locked && (
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() =>
                      dispatch(
                        followMealFromPlan({
                          meal_type: meal.meal_type,
                        })
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 rounded-md text-sm"
                  >
                    <ChevronRight size={16} />
                    Follow
                  </button>

                  <button
                    onClick={() =>
                      dispatch(
                        skipMeal({
                          meal_type: meal.meal_type,
                        })
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-md text-sm"
                  >
                    <SkipForward size={16} />
                    Skip
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={customMeals[meal.meal_type] || ""}
                  disabled={locked}
                  onChange={(e) =>
                    setCustomMeals((p) => ({
                      ...p,
                      [meal.meal_type]: e.target.value,
                    }))
                  }
                  placeholder={
                    locked
                      ? `${meal.display_name} already logged`
                      : `Log custom ${meal.display_name.toLowerCase()} separated by comma`
                  }
                  className="flex-1 bg-gray-800 rounded-md px-3 py-2 text-sm disabled:opacity-50"
                />
                <button
                  disabled={locked}
                  onClick={() => handleCustomMeal(meal.meal_type)}
                  className="px-3 py-2 bg-purple-600 rounded-md disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Extra Meal - Only show if plan exists (usually) */}
      {dietPlan && (
      <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <h4 className="font-semibold mb-2">Extra Meal</h4>
        <div className="flex gap-2">
          <input
            value={extraMeal}
            onChange={(e) => setExtraMeal(e.target.value)}
            placeholder="Log extra food separated by comma"
            className="flex-1 bg-gray-800 rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={handleExtraMeal}
            className="px-3 py-2 bg-purple-600 rounded-md"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      )}

      {/* Weight Update (Standard) - Show if can_update_weight OR forceWeightUpdate AND dietPlan exists (to append to bottom) */}
      {(showWeightUpdate && dietPlan) && (
        <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h4 className="font-semibold mb-2">Weekly Weight Update</h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight (kg)"
              className="flex-1 bg-gray-800 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={handleWeightUpdate}
              className="px-3 py-2 bg-blue-600 rounded-md"
            >
              <Weight size={16} />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Updating weight will generate a new diet plan automatically.
          </p>
        </div>
      )}

      {dietPlan?.disclaimer && (
        <p className="mt-4 text-xs text-gray-500">
          {dietPlan.disclaimer}
        </p>
      )}
    </div>
  );
};

export default DietPlanSlider;
