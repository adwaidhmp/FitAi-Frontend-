// src/pages/ProfileForm.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateUserProfile,
  clearProfileError,
  fetchProfileChoices,
} from "../../redux/user_slices/profileSlice.jsx";
import { AlertCircle } from "lucide-react";
import Loading from "../Loading";

const FALLBACK = {
  gender: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ],
  goal: [
    { value: "maintenance", label: "Maintenance" },
    { value: "bulking", label: "Bulking" },
    { value: "cutting", label: "Cutting / Fat loss" },
    { value: "recomposition", label: "Body Recomposition" },
  ],
  body_type: [
    { value: "", label: "Select body type" },
    { value: "ectomorph", label: "Ectomorph" },
    { value: "mesomorph", label: "Mesomorph" },
    { value: "endomorph", label: "Endomorph" },
  ],
  activity_level: [
    { value: "sedentary", label: "Sedentary" },
    { value: "light", label: "Lightly active" },
    { value: "moderate", label: "Moderately active" },
    { value: "active", label: "Active" },
    { value: "very_active", label: "Very active" },
  ],
  exercise_experience: [
    { value: "none", label: "None" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ],
};

const ProfileForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    data: profile,
    loading,
    error,
    missingFields,
    choices,
    choicesLoading,
    choicesError,
  } = useSelector((state) => state.profile);

  // infer hasProfile from profile presence (still useful elsewhere)
  const _hasProfile = Boolean(profile && profile.id);

  // build usable choices object that falls back to constants while loading/failing
  const effectiveChoices = {
    gender: (choices && choices.gender) || FALLBACK.gender,
    goal: (choices && choices.goal) || FALLBACK.goal,
    body_type: (choices && choices.body_type) || FALLBACK.body_type,
    activity_level:
      (choices && choices.activity_level) || FALLBACK.activity_level,
    exercise_experience:
      (choices && choices.exercise_experience) || FALLBACK.exercise_experience,
  };

  // Helper: hydrate form data from profile or use defaults
  const getHydratedForm = () => {
    if (!profile) {
      return {
        dob: "",
        gender: "",
        height_cm: "",
        weight_kg: "",
        target_weight_kg: "",
        goal: "",
        body_type: "",
        activity_level: "",
        exercise_experience: "",
        diet_constraints: "",
        allergies: "",
        medical_conditions: "",
        supplements: "",
        preferred_equipment: "",
        notes: "",
      };
    }
    return {
      dob: profile.dob || "",
      gender: profile.gender || "",
      height_cm:
        profile.height_cm !== null && profile.height_cm !== undefined
          ? String(profile.height_cm)
          : "",
      weight_kg:
        profile.weight_kg !== null && profile.weight_kg !== undefined
          ? String(profile.weight_kg)
          : "",
      target_weight_kg:
        profile.target_weight_kg !== null &&
        profile.target_weight_kg !== undefined
          ? String(profile.target_weight_kg)
          : "",
      goal: profile.goal || "",
      body_type: profile.body_type || "",
      activity_level: profile.activity_level || "",
      exercise_experience: profile.exercise_experience || "",
      diet_constraints: profile.diet_constraints?.notes || "",
      allergies: (profile.allergies || []).join(", "),
      medical_conditions: (profile.medical_conditions || []).join(", "),
      supplements: (profile.supplements || []).join(", "),
      preferred_equipment: (profile.preferred_equipment || []).join(", "),
      notes: profile.notes || "",
    };
  };

  // local form state (timezone + language removed)
  const [form, setForm] = useState(() => getHydratedForm());

  // update local form when profile loads/changes
  useEffect(() => {
    setForm(getHydratedForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // fetch choices if not already loaded
  useEffect(() => {
    if (!choices && !choicesLoading) {
      dispatch(fetchProfileChoices());
    }
  }, [choices, choicesLoading, dispatch]);

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm">
          You must be logged in to complete your profile.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toList = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const isMissing = (fieldName) =>
    Array.isArray(missingFields) && missingFields.includes(fieldName);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      dob: form.dob || null,
      gender: form.gender || null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      target_weight_kg: form.target_weight_kg
        ? parseFloat(form.target_weight_kg)
        : null,
      goal: form.goal || null,
      body_type: form.body_type || "",
      activity_level: form.activity_level || null,
      exercise_experience: form.exercise_experience || null,
      diet_constraints: form.diet_constraints
        ? { notes: form.diet_constraints }
        : {},
      allergies: form.allergies ? toList(form.allergies) : [],
      medical_conditions: form.medical_conditions
        ? toList(form.medical_conditions)
        : [],
      supplements: form.supplements ? toList(form.supplements) : [],
      preferred_equipment: form.preferred_equipment
        ? toList(form.preferred_equipment)
        : [],
      notes: form.notes || "",
    };

    try {
      // always update, profile row is auto-created on signup
      const res = await dispatch(updateUserProfile(payload));

      // keep previous behaviour: navigate on successful thunk
      if (res?.meta?.requestStatus === "fulfilled") {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error("Profile save failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-6 md:p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Complete your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
              FitAI Profile
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            These details are required for accurate AI workouts and nutrition
            predictions.
          </p>
          {choicesLoading && (
            <p className="text-xs text-gray-500 mt-1">Loading choices…</p>
          )}
          {choicesError && (
            <p className="text-xs text-yellow-300 mt-1">
              Could not load choices, using defaults.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4">
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="text-red-200 flex-1">
                {typeof error === "object"
                  ? error.detail || JSON.stringify(error)
                  : error}
                {Array.isArray(missingFields) && missingFields.length > 0 && (
                  <div className="mt-1 text-red-300">
                    Missing: {missingFields.join(", ")}
                  </div>
                )}
              </div>
              <button
                onClick={() => dispatch(clearProfileError())}
                className="ml-2 text-red-300 hover:text-white text-sm"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* dob + gender */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Date of Birth{" "}
                {isMissing("dob") && <span className="text-red-400">*</span>}
              </label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                  isMissing("dob") ? "border-red-500" : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Gender{" "}
                {isMissing("gender") && <span className="text-red-400">*</span>}
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                  isMissing("gender") ? "border-red-500" : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              >
                <option value="">Select gender</option>
                {effectiveChoices.gender.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* height + weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Height (cm){" "}
                {isMissing("height_cm") && (
                  <span className="text-red-400">*</span>
                )}
              </label>
              <input
                type="number"
                step="0.1"
                name="height_cm"
                value={form.height_cm}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                  isMissing("height_cm") ? "border-red-500" : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              />
              <div>
                <label className="block mb-1 text-gray-300 text-xs">
                  Target Weight (kg){" "}
                  {isMissing("target_weight_kg") && (
                    <span className="text-red-400">*</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="target_weight_kg"
                  value={form.target_weight_kg}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                    isMissing("target_weight_kg")
                      ? "border-red-500"
                      : "border-gray-700"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Weight (kg){" "}
                {isMissing("weight_kg") && (
                  <span className="text-red-400">*</span>
                )}
              </label>
              <input
                type="number"
                step="0.1"
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                  isMissing("weight_kg") ? "border-red-500" : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              />
            </div>
          </div>

          {/* goal + body_type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Primary Goal{" "}
                {isMissing("goal") && <span className="text-red-400">*</span>}
              </label>
              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                  isMissing("goal") ? "border-red-500" : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              >
                <option value="">Select goal</option>
                {effectiveChoices.goal.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Body Type (optional)
              </label>
              <select
                name="body_type"
                value={form.body_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {effectiveChoices.body_type.map((c) => (
                  <option key={c.value || "empty"} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* activity_level + exercise_experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Activity Level{" "}
                {isMissing("activity_level") && (
                  <span className="text-red-400">*</span>
                )}
              </label>
              <select
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                  isMissing("activity_level")
                    ? "border-red-500"
                    : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              >
                <option value="">Select activity level</option>
                {effectiveChoices.activity_level.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Exercise Experience{" "}
                {isMissing("exercise_experience") && (
                  <span className="text-red-400">*</span>
                )}
              </label>
              <select
                name="exercise_experience"
                value={form.exercise_experience}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                  isMissing("exercise_experience")
                    ? "border-red-500"
                    : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              >
                <option value="">Select experience</option>
                {effectiveChoices.exercise_experience.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* diet constraints */}
          <div>
            <label className="block mb-1 text-gray-300 text-xs">
              Diet Constraints / Preferences (optional)
            </label>
            <textarea
              name="diet_constraints"
              value={form.diet_constraints}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
              placeholder="e.g., vegetarian, no dairy, low carb..."
            />
          </div>

          {/* allergies + medical_conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Allergies (comma separated)
              </label>
              <input
                type="text"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
                placeholder="e.g., peanuts, gluten"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Medical Conditions (comma separated)
              </label>
              <input
                type="text"
                name="medical_conditions"
                value={form.medical_conditions}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
                placeholder="e.g., hypertension, diabetes"
              />
            </div>
          </div>

          {/* supplements + equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Supplements (comma separated)
              </label>
              <input
                type="text"
                name="supplements"
                value={form.supplements}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
                placeholder="e.g., whey, creatine"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300 text-xs">
                Available Equipment (comma separated)
              </label>
              <input
                type="text"
                name="preferred_equipment"
                value={form.preferred_equipment}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
                placeholder="e.g., dumbbells, barbell, treadmill"
              />
            </div>
          </div>

          {/* notes */}
          <div>
            <label className="block mb-1 text-gray-300 text-xs">
              Notes for coach / AI (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
              placeholder="Anything special we should know?"
            />
          </div>

          {/* submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loading small />
                  Saving profile...
                </>
              ) : (
                "Save & Continue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
