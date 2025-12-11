import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/login";
import Signup from "./components/auth/signup";
import ProfileForm from "./components/user/ProfileForm"
import ProfilePage from "./components/auth/profile";
import "./App.css";
import Home from "./components/home/Home";
import DietPlanSlider from "./components/home/DietPlanSlider";
import ExerciseSlider from "./components/home/ExerciseSlider";
import GymStoreSlider from "./components/home/TrainerSlider";
import TrainerSlider from "./components/home/TrainerSlider";
import LandingPage from "./components/landing";
import ForgotPasswordRequest from "./components/auth/ForgotPasswordRequest";
import ForgotPasswordConfirm from "./components/auth/ForgotPasswordConfirm";
import RequireProfile from "./components/user_routes/RequireProfile";
import TrainerHome from "./components/trainer/home_page";
import ConfirmedClients from "./components/trainer/ConfirmedClients";
import PendingRequests from "./components/trainer/PendingRequests";
import TrainerProfileForm from "./components/user/TrainerProfileForm";
import RequireTrainerProfile from "./components/trainer_routes/RequireTrainerProfile";
import TrainerProfilePage from "./components/trainer/TrainerProfilePage";
function App() {
  return (
    <Router>
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/reset-password" element={<ForgotPasswordRequest />} />
    <Route path="/reset-password-confirm" element={<ForgotPasswordConfirm />} />

    {/* Protected routes */}
    <Route element={<RequireProfile />}>
      <Route path="/profile_form" element={<ProfileForm />} />
      <Route path="/profile" element={<ProfilePage />} />
      {/* user protected content */}
      <Route path="/home" element={<Home />} />
      <Route path="/diet" element={<DietPlanSlider />} />
      <Route path="/exercise" element={<ExerciseSlider />} />
      <Route path="/gym" element={<GymStoreSlider />} />
      <Route path="/trainer" element={<TrainerSlider />} />
    </Route>

    {/* Trainer separate routes (not using RequireProfile) */}
    <Route element={<RequireTrainerProfile/>}>
    <Route path="/trainer-profile" element={<TrainerProfilePage/> }/>
    <Route path="/trainer_profile_form" element={<TrainerProfileForm/>}/>
    <Route path="/trainer-home" element={<TrainerHome />} />
    <Route path="/clients" element={<ConfirmedClients />} />
    <Route path="/client-request" element={<PendingRequests />} />
    </Route>
  </Routes>
</Router>

  );
}

export default App;
