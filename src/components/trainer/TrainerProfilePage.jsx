import React, { useEffect, useState, useMemo } from "react";
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
  Target,
  Star,
  FileText,
  Briefcase,
  DollarSign,
} from "lucide-react";

import {
  fetchTrainerInfo,
  updateTrainerInfo,
} from "../../redux/trainer_slices/trainerProfileSlice";
import {
  fetchTrainerProfile,
  updateTrainerProfile,
  clearTrainerErrors,
} from "../../redux/trainer_slices/trainerProfileSlice";
import { logoutUser } from "../../redux/user_slices/authSlice";

// FIELD config for trainer personal/profile
const INFO_FIELD_CONFIG = {
  name: { label: "Full name", icon: User, type: "text" },
  email: { label: "Email", icon: Mail, type: "text", readOnly: true },
  phone: { label: "Phone", icon: Phone, type: "text" },
};

const PROFILE_FIELD_CONFIG = {
  bio: { label: "Bio", icon: FileText, type: "textarea" },
  specialties: { label: "Specialties", icon: Target, type: "text" }, // comma list -> backend array
  experience_years: {
    label: "Experience (years)",
    icon: Briefcase,
    type: "number",
  },
  // hourly_rate removed because backend does not provide this field
  certificates: {
    label: "Certifications (existing shown below)",
    icon: Star,
    type: "file",
  }, // backend uses 'certificates'
  notes: { label: "Notes", icon: FileText, type: "textarea" },
};

const TAB_CONFIG = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "profile", label: "Trainer Profile", icon: Briefcase },
];

const TrainerProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // auth slice (to guard access / show name/email)
  const { isAuthenticated, loading: authLoading, user: _authUser } =
    useSelector((s) => s.auth);

  // trainer slice
  const { trainerInfo, profile, loadingTrainerInfo, loadingProfile, error } =
    useSelector((s) => s.trainerProfile || {});

  const loading = authLoading || loadingTrainerInfo || loadingProfile;
  const _error = error;

  // UI state
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: "", email: "", phone: "" });
  const [profileForm, setProfileForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // file state for certificates
  const [newCertificates, setNewCertificates] = useState([]); // FileList -> array
  const [removedCertIds, setRemovedCertIds] = useState([]); // ids of existing certs to remove

  const combined = useMemo(
    () => ({ ...(trainerInfo || {}), ...(profile || {}) }),
    [trainerInfo, profile]
  );

  // seed forms when data arrives
  useEffect(() => {
    setInfoForm({
      name: trainerInfo?.name || combined?.name || "",
      email: trainerInfo?.email || combined?.email || "",
      phone: trainerInfo?.phone || combined?.phone || "",
    });

    // seed only keys present in PROFILE_FIELD_CONFIG
    const seeded = {};
    Object.keys(PROFILE_FIELD_CONFIG).forEach((k) => {
      const v = profile?.[k];
      if (Array.isArray(v)) {
        // convert array to comma list for text inputs
        seeded[k] = v.join(", ");
      } else if (v === null || v === undefined) {
        seeded[k] = "";
      } else {
        seeded[k] = String(v);
      }
    });

    setProfileForm(seeded);
    // reset file/remove state whenever profile changes
    setNewCertificates([]);
    setRemovedCertIds([]);
    setFormErrors({});
  }, [trainerInfo, profile]);

  // fetch on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!trainerInfo) dispatch(fetchTrainerInfo());
    if (!profile) dispatch(fetchTrainerProfile());
  }, [dispatch, isAuthenticated, trainerInfo, profile, navigate]);

  const toList = (str) =>
    String(str || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const validateInfo = () => {
    const errs = {};
    if (!infoForm.name || infoForm.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters.";
    return errs;
  };

  const validateProfile = () => {
    const errs = {};
    if (
      profileForm.experience_years &&
      isNaN(parseFloat(profileForm.experience_years))
    ) {
      errs.experience_years = "Experience must be a number.";
    }
    if (profileForm.hourly_rate && isNaN(parseFloat(profileForm.hourly_rate))) {
      errs.hourly_rate = "Hourly rate must be a number.";
    }
    return errs;
  };

  const toggleEditInfo = () => {
    setFormErrors({});
    setIsEditingInfo((v) => !v);
  };
  const toggleEditProfile = () => {
    setFormErrors({});
    setIsEditingProfile((v) => !v);
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  // certificate file handler
  const handleCertFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setNewCertificates((p) => [...p, ...files]);
    // if you want to clear the input afterwards caller must reset the input element value
  };

  const markRemoveCert = (certId) => {
    setRemovedCertIds((p) => {
      if (p.includes(certId)) return p.filter((id) => id !== certId);
      return [...p, certId];
    });
  };

  const handleSaveInfo = async () => {
    const errs = validateInfo();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: infoForm.name?.trim(),
        phone: infoForm.phone?.trim() || null,
      };
      await dispatch(updateTrainerInfo(payload)).unwrap();
      await dispatch(fetchTrainerInfo());
      setIsEditingInfo(false);
    } catch (err) {
      console.error("Save trainer info failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      // Build FormData (multipart)
      const fd = new FormData();
      // add scalar/array fields, but only for PROFILE_FIELD_CONFIG keys
      Object.keys(PROFILE_FIELD_CONFIG).forEach((k) => {
        if (k === "certificates") return; // files handled separately
        const val = profileForm[k];
        if (k === "specialties") {
          const list = toList(val);
          fd.append(k, JSON.stringify(list));
        } else if (PROFILE_FIELD_CONFIG[k]?.type === "number") {
          fd.append(k, val === "" ? "" : String(val));
        } else {
          fd.append(k, val == null ? "" : String(val));
        }
      });

      // attach new certificate files using 'certificates' key
      newCertificates.forEach((file) => {
        fd.append("certificates", file);
      });

      // send removed cert ids if any
      if (removedCertIds.length) {
        fd.append("remove_cert_ids", JSON.stringify(removedCertIds));
      }

      const res = await dispatch(updateTrainerProfile(fd)).unwrap();
      console.log("Trainer profile updated", res);
      await dispatch(fetchTrainerProfile());
      // reset editing & file state
      setIsEditingProfile(false);
      setNewCertificates([]);
      setRemovedCertIds([]);
    } catch (err) {
      console.error("Save trainer profile failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !combined) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading trainer profile...</p>
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
              <h3 className="text-lg font-semibold">{combined?.name || "Trainer"}</h3>
              <p className="text-xs text-gray-400">{combined?.email || "No email"}</p>
              <p className="text-xs text-gray-400 mt-1">{combined?.is_approved ? "Approved" : "Pending approval"}</p>
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
              <span className="font-semibold">trainer</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className={`${combined?.is_active ? "text-green-400" : "text-red-400"} font-semibold`}>{combined?.is_active ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved</span>
              <span className={`${combined?.is_approved ? "text-green-400" : "text-yellow-400"} font-semibold`}>{combined?.is_approved ? "Yes" : "No"}</span>
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
                  <p className="text-xs text-gray-400 mt-1">Name, email and phone. Email is read-only.</p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditingInfo ? (
                    <button onClick={toggleEditInfo} className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setIsEditingInfo(false); setFormErrors({}); }} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-xl">
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button onClick={handleSaveInfo} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {Object.keys(INFO_FIELD_CONFIG).map((k) => {
                  const cfg = INFO_FIELD_CONFIG[k];
                  const val = infoForm[k] ?? "";
                  if (!isEditingInfo) {
                    return (
                      <div key={k}>
                        <label className="text-xs text-gray-400 block mb-1">{cfg.label}</label>
                        <p className="font-semibold">{trainerInfo?.[k] ?? combined?.[k] ?? "Not set"}</p>
                      </div>
                    );
                  }

                  return (
                    <div key={k}>
                      <label className="text-xs text-gray-400 block mb-1">{cfg.label}</label>
                      <input
                        name={k}
                        value={val}
                        onChange={handleInfoChange}
                        readOnly={cfg.readOnly}
                        className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${formErrors[k] ? "border-red-500" : "border-gray-700"}`}
                      />
                      {formErrors[k] && <p className="text-red-400 text-xs mt-1">{formErrors[k]}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Trainer Profile */}
          {activeTab === "profile" && (
            <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                    Trainer Profile
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Bio, specialties, experience, hourly rate and certifications.</p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditingProfile ? (
                    <button onClick={toggleEditProfile} className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setIsEditingProfile(false); setFormErrors({}); }} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-xl">
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {Object.keys(PROFILE_FIELD_CONFIG).map((fieldKey) => {
                  const cfg = PROFILE_FIELD_CONFIG[fieldKey];
                  const displayValue = profile?.[fieldKey];
                  const formValue = profileForm[fieldKey] ?? "";

                  // show certificate thumbnails in read-only view
                  if (!isEditingProfile && fieldKey === "certificates") {
                    const certs = Array.isArray(displayValue) ? displayValue : [];
                    return (
                      <div key={fieldKey} className="col-span-full">
                        <label className="text-xs text-gray-400 block mb-1">{cfg.label}</label>
                        <div className="flex flex-wrap gap-3">
                          {certs.length ? certs.map((c) => (
                            <a key={c.id} href={c.file_url || '#'} target="_blank" rel="noreferrer" className="block w-40">
                              <img src={c.file_url} alt={c.filename || 'certificate'} className="w-full h-28 object-cover rounded-lg border border-gray-700" />
                              <div className="text-xs truncate mt-1 text-gray-300">{c.filename}</div>
                            </a>
                          )) : <div className="text-xs text-gray-400">Not set</div>}
                        </div>
                      </div>
                    );
                  }

                  // non-edit view
                  if (!isEditingProfile) {
                    let shown = displayValue;
                    if (fieldKey === "specialties")
                      shown = Array.isArray(displayValue)
                        ? displayValue.length
                          ? displayValue.join(", ")
                          : "Not set"
                        : displayValue || "Not set";

                    // certificates: show filenames or count
                    if (fieldKey === "certificates") {
                      const certs = Array.isArray(displayValue) ? displayValue : [];
                      shown = certs.length
                        ? certs.map((c) => c.filename || c.file_url || "Certificate").join(", ")
                        : "Not set";
                    }

                    if (cfg.type === "number") shown = displayValue ?? "Not set";
                    if (cfg.type === "textarea") shown = displayValue || "Not set";
                    if (shown === null || shown === undefined || shown === "") shown = "Not set";

                    return (
                      <div key={fieldKey} className="flex items-start gap-3">
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

                  // editing view
                  if (cfg.type === "textarea") {
                    return (
                      <div key={fieldKey}>
                        <label className="text-xs text-gray-400 block mb-1">{cfg.label}</label>
                        <textarea name={fieldKey} rows={3} value={formValue} onChange={handleProfileChange} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs" />
                        {formErrors[fieldKey] && <p className="text-red-400 text-xs mt-1">{formErrors[fieldKey]}</p>}
                      </div>
                    );
                  }

                  // file input/rendering for certificates (important fix: check 'certificates')
                  if (cfg.type === "file" && fieldKey === "certificates") {
                    return (
                      <div key={fieldKey} className="col-span-full">
                        <label className="text-xs text-gray-400 block mb-1">{cfg.label}</label>

                        {/* existing certificates list with remove toggle */}
                        <div className="space-y-2 mb-3">
                          {(profile?.certificates || []).map((c) => {
                            const isRemoved = removedCertIds.includes(c.id);
                            return (
                              <div key={c.id} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-lg">
                                <div>
                                  <div className="font-semibold">{c.filename || c.file_url || "Certificate"}</div>
                                  <a href={c.file_url || '#'} target="_blank" rel="noreferrer" className="text-xs text-blue-300 underline">View file</a>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => markRemoveCert(c.id)} className={`px-3 py-1 rounded text-xs ${isRemoved ? "bg-red-600 text-white" : "bg-gray-700 text-gray-200"}`}>
                                    {isRemoved ? "Undo remove" : "Remove"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* new files */}
                        <div className="mb-2">
                          <input type="file" accept=".pdf,.jpg,.png" multiple onChange={handleCertFiles} className="w-full" />
                          {newCertificates.length > 0 && (
                            <div className="mt-2 space-y-1 text-xs">
                              {newCertificates.map((f, i) => (
                                <div key={`${f.name}-${i}`} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded">
                                  <div className="truncate">{f.name}</div>
                                  <div className="flex gap-2">
                                    <button onClick={() => setNewCertificates((p) => p.filter((_, idx) => idx !== i))} className="px-2 py-1 text-xs bg-gray-700 rounded">Remove</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {formErrors[fieldKey] && <p className="text-red-400 text-xs mt-1">{formErrors[fieldKey]}</p>}
                      </div>
                    );
                  }

                  // default number/text
                  return (
                    <div key={fieldKey}>
                      <label className="text-xs text-gray-400 block mb-1">{cfg.label}</label>
                      <input name={fieldKey} value={formValue} onChange={handleProfileChange} type={cfg.type === "number" ? "number" : "text"} className={`w-full px-3 py-2 rounded-lg bg-gray-800 border ${formErrors[fieldKey] ? "border-red-500" : "border-gray-700"} text-xs`} />
                      {formErrors[fieldKey] && <p className="text-red-400 text-xs mt-1">{formErrors[fieldKey]}</p>}
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
              <div className="font-semibold">Trainer Profile Error</div>
              <div className="text-red-200">{typeof _error === "string" ? _error : JSON.stringify(_error)}</div>
              <div className="mt-2">
                <button onClick={() => dispatch(clearTrainerErrors())} className="text-xs text-red-300 underline">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerProfilePage;
