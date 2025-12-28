import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./app.css";
import Login from "./components/auth/login";
import Signup from "./components/auth/signup";
import ProfileForm from "./components/user/ProfileForm";
import ProfilePage from "./components/auth/profile";
import Home from "./components/home/Home";
import DietPlanSlider from "./components/home/DietPlanSlider";
import ExerciseSlider from "./components/home/ExerciseSlider";
import ProgressDashboard from "./components/home/ProgressDashboard";
import TrainerSlider from "./components/home/TrainerSlider";
import LandingPage from "./components/landing";
import ForgotPasswordRequest from "./components/auth/ForgotPasswordRequest";
import ForgotPasswordConfirm from "./components/auth/ForgotPasswordConfirm";

import RequireProfile from "./components/user_routes/RequireProfile";
import RequireTrainerProfile from "./components/trainer_routes/RequireTrainerProfile";
import AdminProtectedRoute from "./components/admin_route/AdminProtectedRoute";

import TrainerHome from "./components/trainer/home_page";
import ConfirmedClients from "./components/trainer/ConfirmedClients";
import PendingRequests from "./components/trainer/PendingRequests";
import TrainerProfileForm from "./components/user/TrainerProfileForm";
import TrainerProfilePage from "./components/trainer/TrainerProfilePage";

import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import UserManagement from "./components/admin/UserManagement";
import TrainerManagement from "./components/admin/TrainerManagement";
import TrainerChat from "./components/home/ChatCall";
import HomeLanding from "./components/home/HomeLanding";
import PageNotFound from "./components/PageNotFound";

function App() {
  return (
    <Router>
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

        {/* USER */}
        <Route element={<RequireProfile />}>
          <Route path="/profile_form" element={<ProfileForm />} />

          {/* Home becomes a LAYOUT */}
          <Route path="home/" element={<Home />}>
            <Route index element={<HomeLanding />} />
            <Route path="diet" element={<DietPlanSlider />} />
            <Route path="progress-dashboard" element={<ProgressDashboard />} />
            <Route path="exercise" element={<ExerciseSlider />} />
            <Route path="trainer" element={<TrainerSlider />} />
            <Route path="chat-call" element={<TrainerChat />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* TRAINER */}
        <Route element={<RequireTrainerProfile />}>
          <Route path="/trainer-profile" element={<TrainerProfilePage />} />
          <Route
            path="/trainer_profile_form"
            element={<TrainerProfileForm />}
          />
          <Route path="/trainer-home" element={<TrainerHome />} />
          <Route path="/clients" element={<ConfirmedClients />} />
          <Route path="/client-request" element={<PendingRequests />} />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="trainers" element={<TrainerManagement />} />
          </Route>
        </Route>

        {/* GLOBAL FALLBACK */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
