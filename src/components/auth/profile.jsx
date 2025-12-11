// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
  Lock,
  Calendar,
  Target,
  Activity,
  Ruler,
  Weight,
  Star,
} from "lucide-react";
import {
  fetchProfile,
  editProfile,
  logoutUser,
} from "../../redux/user_slices/authSlice";
import {
  fetchUserProfile,
  fetchProfileChoices,
  updateUserProfile,
  clearProfileError,
} from "../../redux/user_slices/profileSlice";

const FIELD_CONFIG = {
  dob: { label: "Date of Birth", icon: Calendar, type: "date" },
  gender: { label: "Gender", icon: User, type: "select" },
  height_cm: { label: "Height (cm)", icon: Ruler, type: "number" },
  weight_kg: { label: "Weight (kg)", icon: Weight, type: "number" },
  goal: { label: "Fitness Goal", icon: Target, type: "select" },
  activity_level: { label: "Activity Level", icon: Activity, type: "select" },
  exercise_experience: {
    label: "Exercise Experience",
    icon: Star,
    type: "select",
  },
  body_type: { label: "Body Type", icon: User, type: "select" },
  diet_constraints: { label: "Diet Constraints", icon: User, type: "textarea" },
  allergies: { label: "Allergies", icon: User, type: "text" },
  medical_conditions: { label: "Medical Conditions", icon: User, type: "text" },
  supplements: { label: "Supplements", icon: User, type: "text" },
  preferred_equipment: { label: "Equipment", icon: User, type: "text" },
  notes: { label: "Notes", icon: User, type: "textarea" },
};

const FALLBACK_CHOICES = {
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

const TAB_CONFIG = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "personal", label: "Personal Info", icon: User },
];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    profile: authProfile,
    loading: authLoading,
    error: _authError,
    isAuthenticated,
  } = useSelector((s) => s.auth);
  const {
    data: profileDetails,
    loading: profileLoading,
    error: _profileError,
    choices,
    _choicesLoading,
  } = useSelector((s) => s.profile);

  const loading = authLoading || profileLoading;
  const _error = _authError || _profileError;

  // Local editing state
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", email: "", phone: "" });
  const [detailForm, setDetailForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // build effective choices with fallback
  const effectiveChoices = useMemo(() => {
    const merged = {};
    Object.keys(FALLBACK_CHOICES).forEach((k) => {
      merged[k] = (choices && choices[k]) || FALLBACK_CHOICES[k];
    });
    return merged;
  }, [choices]);

  // combine profile object for display
  const combined = useMemo(
    () => ({ ...authProfile, ...profileDetails }),
    [authProfile, profileDetails]
  );

  // seed local forms whenever data arrives
  useEffect(() => {
    setAuthForm({
      name: authProfile?.name || "",
      email: authProfile?.email || "",
      phone: authProfile?.phone || "",
    });

    const seeded = {};
    Object.keys(FIELD_CONFIG).forEach((k) => {
      const v = profileDetails?.[k];
      if (Array.isArray(v)) {
        // show arrays as comma-joined strings in the form
        seeded[k] = v.join(", ");
      } else if (k === "diet_constraints") {
        seeded[k] = profileDetails?.diet_constraints?.notes || "";
      } else if (v === null || v === undefined) {
        seeded[k] = "";
      } else {
        seeded[k] = String(v);
      }
    });

    // include any extra keys present in profileDetails so Personal Info tab shows everything in edit mode
    if (profileDetails) {
      Object.keys(profileDetails).forEach((k) => {
        if (!(k in seeded)) {
          const v = profileDetails[k];
          seeded[k] = Array.isArray(v) ? v.join(", ") : v ?? "";
        }
      });
    }

    setDetailForm(seeded);
  }, [authProfile, profileDetails]);

  // fetch on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!authProfile) dispatch(fetchProfile());
    if (!profileDetails) dispatch(fetchUserProfile());
    if (!choices) dispatch(fetchProfileChoices());
  }, [
    dispatch,
    isAuthenticated,
    authProfile,
    profileDetails,
    choices,
    navigate,
  ]);

  const formatDate = useCallback((d) => {
    if (!d) return "Not set";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!authForm.name || authForm.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters.";
    if (detailForm.height_cm && isNaN(parseFloat(detailForm.height_cm)))
      errs.height_cm = "Height must be a number.";
    if (detailForm.weight_kg && isNaN(parseFloat(detailForm.weight_kg)))
      errs.weight_kg = "Weight must be a number.";
    return errs;
  };

  const toggleEdit = () => {
    setFormErrors({});
    setIsEditing((v) => !v);
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetailForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const toList = (str) =>
    String(str || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      // Save auth if changed
      const authPayload = {
        name: authForm.name?.trim(),
        phone: authForm.phone?.trim() || null,
      };
      if (
        authPayload.name !== authProfile?.name ||
        authPayload.phone !== authProfile?.phone
      ) {
        // call editProfile (authSlice)
        await dispatch(editProfile(authPayload)).unwrap();
        await dispatch(fetchProfile());
      }

      // Prepare detail payload: convert comma lists back into arrays, handle diet_constraints
      const detailPayload = {};
      Object.keys(detailForm).forEach((k) => {
        const val = detailForm[k];
        if (k === "diet_constraints") {
          detailPayload[k] = val ? { notes: val } : {};
        } else if (k === "notes") {
          // Skip notes field if empty - backend doesn't allow null
          if (val && val.trim()) {
            detailPayload[k] = val.trim();
          }
        } else if (
          FIELD_CONFIG[k]?.type === "text" &&
          [
            "allergies",
            "medical_conditions",
            "supplements",
            "preferred_equipment",
          ].includes(k)
        ) {
          detailPayload[k] = toList(val);
        } else if (FIELD_CONFIG[k]?.type === "number") {
          detailPayload[k] = val === "" ? null : parseFloat(val);
        } else {
          detailPayload[k] = val === "" ? null : val;
        }
      });

      // call updateUserProfile (profileSlice)
      const updateResult = await dispatch(
        updateUserProfile(detailPayload)
      ).unwrap();
      console.log("Profile updated:", updateResult);

      await dispatch(fetchUserProfile());

      // Exit edit mode but stay on profile page
      console.log("Exiting edit mode");
      setIsEditing(false);
      console.log("Edit mode exited, should stay on profile page");
    } catch (err) {
      // show server error by clearing slice error elsewhere - we just log here
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !combined) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-linear-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {combined?.name || "User"}
              </h3>
              <p className="text-xs text-gray-400">
                {combined?.email || "No email"}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {TAB_CONFIG.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === t.id
                    ? "bg-linear-to-r from-purple-900/50 to-pink-900/50 text-white border border-purple-700/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <t.icon className="w-5 h-5" />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-6">
            <button
              onClick={() => {
                dispatch(logoutUser());
                navigate("/reset-password");
              }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-xl border border-blue-700/30"
            >
              <Lock className="w-4 h-4" />
              Reset Password
            </button>
          </div>
          <div className="mt-6">
            <button
              onClick={() => {
                dispatch(logoutUser());
                navigate("/login");
              }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-xl border border-blue-700/30"
            >
              <Lock className="w-4 h-4" />
              Logout
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>Account Type</span>
              <span className="font-semibold">
                {combined?.role || "member"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span
                className={`${
                  combined?.is_active ? "text-green-400" : "text-red-400"
                } font-semibold`}
              >
                {combined?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Verified</span>
              <span
                className={`${
                  combined?.is_verified ? "text-green-400" : "text-yellow-400"
                } font-semibold`}
              >
                {combined?.is_verified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3 space-y-6">
          {/* Basic Info */}
          {activeTab === "basic" && (
            <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <User className="w-6 h-6 text-purple-400" />
                    Basic Info
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Name, email and phone. Email is read-only.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <button
                      onClick={toggleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormErrors({});
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-xl"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {/* Name */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Full name
                  </label>
                  {!isEditing ? (
                    <p className="font-semibold">
                      {combined?.name || "Not set"}
                    </p>
                  ) : (
                    <>
                      <input
                        name="name"
                        value={authForm.name}
                        onChange={handleAuthChange}
                        className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
                          formErrors.name ? "border-red-500" : "border-gray-700"
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Email
                  </label>
                  <p className="font-semibold">
                    {combined?.email || "Not set"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed here.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Phone
                  </label>
                  {!isEditing ? (
                    <p className="font-semibold">
                      {combined?.phone || "Not set"}
                    </p>
                  ) : (
                    <input
                      name="phone"
                      value={authForm.phone}
                      onChange={handleAuthChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
                    />
                  )}
                </div>

                {/* Member since */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Member since
                  </label>
                  <p className="font-semibold">
                    {formatDate(combined?.date_joined)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Personal Info */}
          {activeTab === "personal" && (
            <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <User className="w-6 h-6 text-purple-400" />
                    Personal Info
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Fitness profile, preferences, allergies and notes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <button
                      onClick={toggleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormErrors({});
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-xl"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {Object.keys(FIELD_CONFIG).map((fieldKey) => {
                  const cfg = FIELD_CONFIG[fieldKey];
                  const displayValue = combined?.[fieldKey];
                  const formValue = detailForm[fieldKey] ?? "";

                  // render selects if available
                  if (!isEditing) {
                    let shown = displayValue;
                    if (fieldKey === "diet_constraints")
                      shown = combined?.diet_constraints?.notes || "Not set";
                    if (Array.isArray(displayValue))
                      shown = displayValue.length
                        ? displayValue.join(", ")
                        : "Not set";
                    if (cfg?.type === "date") shown = formatDate(displayValue);
                    if (shown === null || shown === undefined || shown === "")
                      shown = "Not set";

                    return (
                      <div key={fieldKey} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-900/30 text-purple-400">
                          <cfg.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{shown}</p>
                          <p className="text-xs text-gray-400">{cfg.label}</p>
                        </div>
                      </div>
                    );
                  }

                  // editing mode: inputs
                  if (cfg.type === "select") {
                    const opts =
                      effectiveChoices[fieldKey] ||
                      FALLBACK_CHOICES[fieldKey] ||
                      [];
                    return (
                      <div key={fieldKey}>
                        <label className="text-xs text-gray-400 block mb-1">
                          {cfg.label}
                        </label>
                        <select
                          name={fieldKey}
                          value={formValue}
                          onChange={handleDetailChange}
                          className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                            formErrors[fieldKey]
                              ? "border-red-500"
                              : "border-gray-700"
                          }`}
                        >
                          <option value="">Select {cfg.label}</option>
                          {opts.map((o) => (
                            <option key={o.value ?? o} value={o.value ?? o}>
                              {o.label ?? o}
                            </option>
                          ))}
                        </select>
                        {formErrors[fieldKey] && (
                          <p className="text-red-400 text-xs mt-1">
                            {formErrors[fieldKey]}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (cfg.type === "textarea") {
                    return (
                      <div key={fieldKey}>
                        <label className="text-xs text-gray-400 block mb-1">
                          {cfg.label}
                        </label>
                        <textarea
                          name={fieldKey}
                          rows={2}
                          value={formValue}
                          onChange={handleDetailChange}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs"
                        />
                      </div>
                    );
                  }

                  // default text/number/date
                  return (
                    <div key={fieldKey}>
                      <label className="text-xs text-gray-400 block mb-1">
                        {cfg.label}
                      </label>
                      <input
                        name={fieldKey}
                        value={formValue}
                        onChange={handleDetailChange}
                        type={
                          cfg.type === "number"
                            ? "number"
                            : cfg.type === "date"
                            ? "date"
                            : "text"
                        }
                        className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${
                          formErrors[fieldKey]
                            ? "border-red-500"
                            : "border-gray-700"
                        } text-xs`}
                      />
                      {formErrors[fieldKey] && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors[fieldKey]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* error notification */}
      {_error && (
        <div className="fixed bottom-6 right-6 bg-red-900/80 border border-red-700/50 rounded-xl p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <div className="font-semibold">Profile Error</div>
              <div className="text-red-200">
                {typeof _error === "string" ? _error : JSON.stringify(_error)}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => dispatch(clearProfileError())}
                  className="text-xs text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
