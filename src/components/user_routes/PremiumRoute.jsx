import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchUserProfile } from "../../redux/user_slices/profileSlice.jsx";

const PREMIUM_PLANS_PATH = "/premium-plans";

const RequirePremium = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const {
    data: profile,
    loading: profileLoading,
  } = useSelector((state) => state.profile);

  // Fetch profile if needed
  useEffect(() => {
    if (isAuthenticated && !profile && !profileLoading) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, profile, profileLoading, dispatch]);

  // 1️⃣ Not logged in → login
  if (!isAuthenticated && !authLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2️⃣ Loading state
  if (authLoading || profileLoading || (isAuthenticated && !profile)) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-gray-300">
        <span className="text-sm">
          Checking premium access...
        </span>
      </div>
    );
  }

  // 3️⃣ Not premium → redirect to premium plans
  if (!profile?.is_premium) {
    return (
      <Navigate
        to={PREMIUM_PLANS_PATH}
        state={{ from: location }}
        replace
      />
    );
  }

  // 4️⃣ Premium user → allow access
  return <Outlet />;
};

export default RequirePremium;
