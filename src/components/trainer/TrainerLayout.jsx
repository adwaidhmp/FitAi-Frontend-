import React, { useState,useEffect } from "react";
import {
  Dumbbell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import api from "../../api3"
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const TrainerLayout = () => {

  useEffect(() => {
  let unsubscribe;

  async function setupFCM() {
    try {
      // 1️⃣ Ask permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // 2️⃣ Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (!token) return;

      // 3️⃣ Send token to backend
      await api.post("fcm-token/", {
        fcm_token: token,
      });

      console.log("FCM token sent to backend");
    } catch (err) {
      console.error("FCM setup failed:", err);
    }
  }

  setupFCM();

  // 4️⃣ Foreground message handler
  unsubscribe = onMessage(messaging, (payload) => {
    console.log("Foreground notification:", payload);

    if (payload?.notification) {
      alert(
        payload.notification.title +
          "\n" +
          payload.notification.body
      );
    }
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sections = [
    {
      path: "/trainer-home",
      label: "Home",
      icon: "🏠",
      color: "from-blue-600 to-cyan-600",
    },
    { path: "/trainer-home/clients", label: "My Clients", icon: "👥" },
    { path: "/trainer-home/client-request", label: "Requests", icon: "📩" },
    { path: "/trainer-home/trainer-profile", label: "My Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Fit
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  AI
                </span>
                <span className="ml-2 text-xs uppercase tracking-wider text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">
                  Trainer
                </span>
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex gap-1 bg-gray-800/60 p-1 rounded-2xl">
              {sections.map((section) => (
                <button
                  key={section.path}
                  onClick={() => navigate(section.path)}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    location.pathname === section.path || (section.path !== "/trainer-home" && location.pathname.startsWith(section.path))
                      ? `bg-gradient-to-r ${section.color || "from-blue-600 to-cyan-600"} text-white`
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-800"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {menuOpen && (
            <div className="lg:hidden mt-4 grid grid-cols-2 gap-2">
              {sections.map((section) => (
                <button
                  key={section.path}
                  onClick={() => {
                    navigate(section.path);
                    setMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm transition ${
                    location.pathname === section.path
                      ? `bg-gradient-to-r ${section.color || "from-blue-600 to-cyan-600"} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-sm mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* HEADER */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Trainer
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {" "}Dashboard
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage your clients and plans efficiently
          </p>
        </div>
        {/* CONTENT */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-4 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg sm:text-2xl font-bold">
              {sections.find((s) => location.pathname === s.path)?.label ||
                "Overview"}
            </h3>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-800 rounded-lg" onClick={() => navigate(-1)}>
                <ChevronLeft />
              </button>
              <button className="p-2 bg-gray-800 rounded-lg" onClick={() => navigate(1)}>
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="min-h-[360px] sm:min-h-[500px]">
            <Outlet />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © 2025 FitAI. Trainer Portal
      </footer>
    </div>
  );
};

export default TrainerLayout;
