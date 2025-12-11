import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../../redux/user_slices/profileSlice.jsx";

const PROFILE_FORM_PATH = "/profile_form";

const RequireProfile = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const {
    data: profile,
    loading: profileLoading,
    needsProfileSetup,
  } = useSelector((state) => state.profile);

  // Fetch profile when authenticated and not yet loaded
  useEffect(() => {
    if (isAuthenticated && !profile && !profileLoading) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, profile, profileLoading, dispatch]);

  // 1. Not logged in -> go to login
  if (!isAuthenticated && !authLoading) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 2. While things are loading, block with loader
  if (
    authLoading ||
    profileLoading ||
    (isAuthenticated && !profile && !needsProfileSetup)
  ) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-gray-300">
        <span className="text-sm">
          Preparing your personalized experience...
        </span>
      </div>
    );
  }

  // 3. If profile is missing or incomplete, force profile form
  //    But don't redirect if you're already on the form
  if (needsProfileSetup && location.pathname !== PROFILE_FORM_PATH) {
    return (
      <Navigate
        to={PROFILE_FORM_PATH}
        state={{ from: location }}
        replace
      />
    );
  }

  // 4. All good, render the child route
  return <Outlet />;
};

export default RequireProfile;
