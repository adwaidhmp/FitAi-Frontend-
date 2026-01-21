import "./App.css";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ===== AUTH ===== */
import Login from "./components/auth/login";
import Signup from "./components/auth/signup";
import ForgotPasswordRequest from "./components/auth/ForgotPasswordRequest";
import ForgotPasswordConfirm from "./components/auth/ForgotPasswordConfirm";
import ProfilePage from "./components/auth/profile";

/* ===== USER ===== */
import ProfileForm from "./components/user/ProfileForm";
import RequireProfile from "./components/user_routes/RequireProfile";
import Home from "./components/home/Home";
import HomeLanding from "./components/home/HomeLanding";
import DietPlanSlider from "./components/home/DietPlanSlider";
import ExerciseSlider from "./components/home/ExerciseSlider";
import ProgressDashboard from "./components/home/ProgressDashboard";
import TrainerSlider from "./components/home/TrainerSlider";
import TrainerChat from "./components/home/ChatCall";

/* ===== TRAINER ===== */
import RequireTrainerProfile from "./components/trainer_routes/RequireTrainerProfile";
import TrainerHome from "./components/trainer/home_page";
import TrainerLayout from "./components/trainer/TrainerLayout";
import ConfirmedClients from "./components/trainer/ConfirmedClients";
import PendingRequests from "./components/trainer/PendingRequests";
import TrainerProfileForm from "./components/user/TrainerProfileForm";
import TrainerProfilePage from "./components/trainer/TrainerProfilePage";

/* ===== ADMIN ===== */
import AdminProtectedRoute from "./components/admin_route/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import UserManagement from "./components/admin/UserManagement";
import TrainerManagement from "./components/admin/TrainerManagement";

/* ===== MISC ===== */
import LandingPage from "./components/landing";
import PageNotFound from "./components/PageNotFound";

/* ===== CALL ===== */
import VideoCall from "./components/call_component/VideoCall";
import IncomingCallModal from "./components/call_component/IncomingCallModal";
import { useGlobalCallSocket } from "./hooks/useGlobalCallSocket";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./redux/user_slices/authSlice";
import AdminPremiumPlans from "./components/admin/PremiumPlan";
import PremiumPlans from "./components/user/PremiumPlans";
import BuyPremium from "./components/user/BuyPremium";
import RequirePremium from "./components/user_routes/PremiumRoute";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Restore user/profile after refresh
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, dispatch]);
  useGlobalCallSocket();

  return (
    <>
      {/* 🔔 GLOBAL INCOMING CALL POPUP */}
      <IncomingCallModal />

      {/* 🔀 ROUTES */}
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ForgotPasswordRequest />} />
        <Route
          path="/reset-password-confirm"
          element={<ForgotPasswordConfirm />}
        />

        {/* CALL */}
        <Route path="/video-call/:callId" element={<VideoCall />} />

        <Route path="/premium-plans" element={<PremiumPlans />} />
        <Route path="/buy-premium/:plan" element={<BuyPremium />} />

        {/* ================= USER ================= */}

        {/* ✅ PUBLIC USER HOME (INDEX ONLY) */}
        <Route path="home" element={<Home />}>
          <Route index element={<HomeLanding />} />
        </Route>

        {/* 🔒 PROTECTED USER ROUTES (UNCHANGED) */}
        <Route element={<RequireProfile />}>
          <Route path="/profile_form" element={<ProfileForm />} />

          <Route path="home" element={<Home />}>
            <Route path="diet" element={<DietPlanSlider />} />
            <Route path="exercise" element={<ExerciseSlider />} />
            <Route path="progress-dashboard" element={<ProgressDashboard />} />

            {/* 🔒 PREMIUM ONLY */}
            <Route element={<RequirePremium />}>
              <Route path="trainer" element={<TrainerSlider />} />
              <Route path="chat-call" element={<TrainerChat />} />
            </Route>

            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ================= TRAINER ================= */}

        {/* ✅ PUBLIC TRAINER HOME (INDEX ONLY) */}
        <Route path="trainer-home" element={<TrainerLayout />}>
          <Route index element={<TrainerHome />} />
        </Route>

        {/* 🔒 PROTECTED TRAINER ROUTES (UNCHANGED) */}
        <Route element={<RequireTrainerProfile />}>
          <Route path="/trainer-profile" element={<TrainerProfilePage />} />
          <Route path="/trainer_profile_form" element={<TrainerProfileForm />} />

          <Route path="trainer-home" element={<TrainerLayout />}>
            <Route path="clients" element={<ConfirmedClients />} />
            <Route path="client-request" element={<PendingRequests />} />
            <Route path="chat-call" element={<TrainerChat />} />
            <Route path="trainer-profile" element={<TrainerProfilePage />} />
          </Route>
        </Route>
        {/* ADMIN */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="trainers" element={<TrainerManagement />} />
            <Route path="premium-plans" element={<AdminPremiumPlans />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
