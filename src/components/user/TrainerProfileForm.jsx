// src/pages/TrainerProfileForm.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, UploadCloud, FileText, CheckCircle } from "lucide-react";
import {
  updateTrainerProfile,
  // optional helpers if you have them — safe to remove if not present
  // fetchTrainerProfile,
  clearTrainerErrors,
  // fetchTrainerCertificates,
} from "../../redux/trainer_slices/trainerProfileSlice"; // adjust path if needed

const FALLBACK = {
  specialties: [
    { value: "strength", label: "Strength training" },
    { value: "cardio", label: "Cardio" },
    { value: "yoga", label: "Yoga / Mobility" },
    { value: "nutrition", label: "Sports nutrition" },
    { value: "rehab", label: "Rehabilitation" },
  ],
};

const TrainerProfileForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((s) => s.auth);

  // expected trainer slice shape: { data, loading, error, certificates, uploading }
  // adapt the property names if your slice uses different keys
  const {
    data: trainer,
    loading,
    error,
    certificates = [],
    uploading,
  } = useSelector((state) => state.trainer || {});

  // boolean if trainer row exists
  const _hasTrainer = Boolean(trainer && trainer.id);

  const getHydratedForm = () => {
    if (!trainer) {
      return {
        bio: "",
        specialties: "",
        experience_years: "",
      };
    }
    return {
      bio: trainer.bio || "",
      specialties: Array.isArray(trainer.specialties) ? trainer.specialties.join(", ") : "",
      experience_years:
        trainer.experience_years !== null && trainer.experience_years !== undefined
          ? String(trainer.experience_years)
          : "",
    };
  };

  const [form, setForm] = useState(() => getHydratedForm());
  const [files, setFiles] = useState([]); // files user selected for upload
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    setForm(getHydratedForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainer]);

  // If you have fetch actions, you can fetch trainer and certificates here.
  // useEffect(() => {
  //   if (!trainer && !loading) dispatch(fetchTrainerProfile());
  //   if (hasTrainer && certificates.length === 0) dispatch(fetchTrainerCertificates());
  // }, [trainer, loading, certificates, dispatch, hasTrainer]);

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm">You must be logged in to manage your trainer profile.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toList = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleFiles = (e) => {
    const fl = Array.from(e.target.files || []);
    setFiles(fl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // basic client-side validation
    if (form.experience_years && Number(form.experience_years) < 0) {
      setLocalError("Experience years must be >= 0");
      return;
    }

    const fd = new FormData();

    // append scalar fields
    fd.append("bio", form.bio || "");
    // specialties is JSONField on server, better send as JSON string
    const specs = toList(form.specialties);
    fd.append("specialties", JSON.stringify(specs));
    fd.append("experience_years", form.experience_years ? String(form.experience_years) : "0");

    // append files under 'files' (serializer accepts 'file' or 'files'; we send 'files')
    files.forEach((f) => {
      fd.append("files", f);
    });

    try {
      const res = await dispatch(updateTrainerProfile(fd));
      if (res?.meta?.requestStatus === "fulfilled") {
        // success: navigate or show a message
        navigate("/trainer-home", { replace: true }); // adjust target as you want
      }
    } catch (err) {
      // thunk should handle rejectWithValue; show fallback
      console.error("Trainer profile upload failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-6 md:p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Trainer{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
              Profile
            </span>
          </h1>
          <p className="text-xs text-gray-400">Add your bio, specialties and upload certificates.</p>
          {uploading && (
            <p className="text-xs text-gray-500 mt-1">Uploading files…</p>
          )}
        </div>

        {(error || localError) && (
          <div className="mb-4">
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="text-red-200 flex-1">
                {localError || (typeof error === "object" ? error.detail || JSON.stringify(error) : error)}
              </div>
              <button
                onClick={() => {
                  setLocalError(null);
                  if (typeof clearTrainerErrors === "function") dispatch(clearTrainerErrors());
                }}
                className="ml-2 text-red-300 hover:text-white text-sm"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-gray-300 text-xs">Short bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm"
              placeholder="Tell trainees about your approach, certifications, etc."
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300 text-xs">Specialties (comma separated)</label>
            <input
              type="text"
              name="specialties"
              value={form.specialties}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
              placeholder="e.g., strength, hypertrophy, mobility"
            />
            <div className="mt-2 text-xs text-gray-400">
              Tip: separate values with commas, they will be stored as a list.
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-300 text-xs">Experience (years)</label>
            <input
              type="number"
              min="0"
              step="1"
              name="experience_years"
              value={form.experience_years}
              onChange={handleChange}
              className="w-32 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300 text-xs">Upload certificate(s)</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 cursor-pointer text-xs">
                <UploadCloud className="w-4 h-4" />
                <span>Choose files</span>
                <input
                  type="file"
                  name="files"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFiles}
                  className="hidden"
                />
              </label>

              <div className="text-xs text-gray-400">
                {files.length > 0 ? `${files.length} file(s) selected` : "No files selected"}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Allowed: PDF, JPEG, PNG. Max size enforced server-side.
            </div>
          </div>

          {/* existing certificates list */}
          <div>
            <label className="block mb-1 text-gray-300 text-xs">Existing certificates</label>
            {Array.isArray(certificates) && certificates.length > 0 ? (
              <ul className="space-y-2">
                {certificates.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 text-xs">
                    <FileText className="w-4 h-4 text-green-300" />
                    <a
                      href={c.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-sm text-gray-200"
                    >
                      {c.filename}
                    </a>
                    <span className="text-gray-500 ml-2 text-xs">• {new Date(c.uploaded_at).toLocaleDateString()}</span>
                    {c.is_latest && <CheckCircle className="w-4 h-4 text-blue-300 ml-2" />}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">No certificates uploaded yet.</div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Upload"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerProfileForm;
