import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";

import {
  fetchPendingClients,
  decideUserBooking,
  clearTrainerApprovalState,
} from "../../redux/trainer_slices/trainerBookingApprovalSlice";

const PendingRequests = () => {
  const dispatch = useDispatch();

  const {
    pendingClients,
    loading,
    error,
  } = useSelector((state) => state.trainerBookingApproval);

  useEffect(() => {
    dispatch(fetchPendingClients());

    return () => {
      dispatch(clearTrainerApprovalState());
    };
  }, [dispatch]);

  const handleDecision = (bookingId, action) => {
    dispatch(
      decideUserBooking({
        bookingId,
        action, // "approve" | "reject"
      })
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">
          Client Requests ({pendingClients.length})
        </h3>
      </div>

      {loading && pendingClients.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Loading pending requests...
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400">
          {error}
        </div>
      )}

      {!loading && pendingClients.length === 0 && !error ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold mb-2">
            No Pending Requests
          </h4>
          <p className="text-gray-400">
            All requests have been processed
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingClients.map((request) => (
            <div
              key={request.booking_id}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <User className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="font-bold">
                      {request.user_name || "Unknown User"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {request.gender || "--"} • {request.goal || "--"}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                  Pending
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {request.notes?.trim() || "No notes provided"}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {request.created_at
                    ? new Date(request.created_at).toLocaleDateString()
                    : "--"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleDecision(request.booking_id, "approve")
                  }
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>

                <button
                  onClick={() =>
                    handleDecision(request.booking_id, "reject")
                  }
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
