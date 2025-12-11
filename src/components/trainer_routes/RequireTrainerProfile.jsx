// src/components/routes/RequireTrainerProfile.jsx
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrainerProfile } from "../../redux/trainer_slices/trainerProfileSlice.jsx";

const TRAINER_PROFILE_FORM_PATH = "/trainer_profile_form";

const RequireTrainerProfile = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  // auth slice: { isAuthenticated, loading, user }
  const { isAuthenticated, loading: authLoading, user } = useSelector(
    (state) => state.auth || {}
  );

  // trainer profile slice: { profile, loadingProfile, trainerNeedsSetup }
  const { profile, loadingProfile, trainerNeedsSetup } =
    useSelector((state) => state.trainerProfile || {});

  const userLoaded = !!user;
  const isTrainer = Boolean(user?.role === "trainer");

  // Fetch trainer profile only when:
  // - user is authenticated
  // - user has trainer role
  // - we don't already have a profile
  // - a fetch is not already in progress
  useEffect(() => {
    if (isAuthenticated && isTrainer && !profile && !loadingProfile) {
      dispatch(fetchTrainerProfile());
    }
  }, [isAuthenticated, isTrainer, profile, loadingProfile, dispatch]);

  // 1) Not logged in -> go to login
  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) Auth finished and user exists but is not a trainer -> send to home
  if (isAuthenticated && !authLoading && userLoaded && !isTrainer) {
    return <Navigate to="/" replace />;
  }

  // 3) While auth or profile loading, block with a loader
  // Also keep blocking if authenticated trainer but we don't have profile and
  // backend hasn't marked trainerNeedsSetup yet to avoid premature redirects.
  if (
    authLoading ||
    loadingProfile ||
    (isAuthenticated && isTrainer && !profile && !trainerNeedsSetup)
  ) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-gray-300">
        <span className="text-sm">Preparing trainer workspace...</span>
      </div>
    );
  }

  // 4) If trainer profile is required, redirect to the profile form (unless already there)
  if (trainerNeedsSetup && location.pathname !== TRAINER_PROFILE_FORM_PATH) {
    return (
      <Navigate
        to={TRAINER_PROFILE_FORM_PATH}
        state={{ from: location }}
        replace
      />
    );
  }

  // 5) All good, render child routes
  return <Outlet />;
};

export default RequireTrainerProfile;
