import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { endCall as endUserCall } from "../../redux/user_slices/userCallSlice";
import { endCall as endTrainerCall } from "../../redux/trainer_slices/trainerCallSlice";
import { useCallSocket } from "../../hooks/useCallSocket";

const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = useSelector((state) => state.auth?.user?.role);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  /**
   * 🔥 IMPORTANT
   * Caller creates OFFER
   * Callee waits for OFFER
   *
   * Since caller navigates immediately after startCall
   * and callee navigates after acceptCall,
   * this is correct for now.
   */
  const isCaller = true;

  const { localStreamRef, remoteStreamRef } = useCallSocket({
    callId,
    isCaller,
  });

  /* Attach local stream */
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef.current]);

  /* Attach remote stream */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef.current]);

  /* End call */
  const handleEndCall = async () => {
    try {
      if (role === "trainer") {
        await dispatch(endTrainerCall(callId));
      } else {
        await dispatch(endUserCall(callId));
      }
    } finally {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex-1 grid grid-cols-2 gap-2 p-4">
        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="bg-gray-900 rounded-lg"
        />

        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="bg-gray-900 rounded-lg"
        />
      </div>

      <div className="p-4 flex justify-center">
        <button
          onClick={handleEndCall}
          className="px-6 py-3 bg-red-600 text-white rounded-lg"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
