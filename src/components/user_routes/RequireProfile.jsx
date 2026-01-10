import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../../redux/user_slices/profileSlice.jsx";

const PROFILE_FORM_PATH = "/profile_form";

const RequireProfile = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, loading: authLoading } = useSelector(
    (state) => state.auth,
  );

  const {
    data: profile,
    loading: profileLoading,
    needsProfileSetup,
    error: profileError,
  } = useSelector((state) => state.profile);

  // Fetch profile when authenticated and not yet loaded
  useEffect(() => {
    // Added profileError check to prevent infinite retries on 404/500
    if (isAuthenticated && !profile && !profileLoading && !profileError) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, profile, profileLoading, profileError, dispatch]);

  // 1. Not logged in -> go to login
  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. While things are loading, block with loader
  //    Wait for BOTH auth and profile to settle
  // 2. While things are loading, block with loader
  //    Wait for BOTH auth and profile to settle
  //    Also wait if profile is null but no error yet (initial load race condition)
  if (
    authLoading ||
    profileLoading ||
    (isAuthenticated && !profile && !profileError)
  ) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-gray-300">
        <span className="text-sm">
          Preparing your personalized experience...
        </span>
      </div>
    );
  }

  // 3. Logic for Profile Status

  // Case A: Profile is completely missing (fetched but null) -> Go to Signup
  // (User needs to register or re-register logic)
  if (!profile) {
    return <Navigate to="/signup" replace />;
  }

  // Case B: Profile exists but incomplete -> Go to Profile Form
  // (Only redirect if we aren't already there to avoid loop)
  if (needsProfileSetup) {
    if (location.pathname !== PROFILE_FORM_PATH) {
      return (
        <Navigate to={PROFILE_FORM_PATH} state={{ from: location }} replace />
      );
    }
    // If we are on the form, allow rendering it
    return <Outlet />;
  }

  // Case C: Profile is complete -> Access Granted
  return <Outlet />;
};

export default RequireProfile;
