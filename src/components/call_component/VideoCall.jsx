import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react";

import { endCall as endUserCall } from "../../redux/user_slices/userCallSlice";
import { endCall as endTrainerCall } from "../../redux/trainer_slices/trainerCallSlice";
import { useCallSocket } from "../../hooks/useCallSocket";

const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* REDUX SELECTORS */
  const role = useSelector((state) => state.auth?.user?.role);
  
  const userCallStatus = useSelector((state) => state.userCall?.activeCall?.status);
  const trainerCallStatus = useSelector((state) => state.trainerCall?.activeCall?.status);

  // Derive current status based on role
  const currentStatus = role === "trainer" ? trainerCallStatus : userCallStatus;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  /* LOCAL UI STATE */
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  /**
   * Callee waits for OFFER
   *
   * Since caller navigates immediately after startCall
   * and callee navigates after acceptCall,
   * this is correct for now.
   */
  const location = useLocation();
  const stateIsCaller = location.state?.isCaller;
  
  // fallback if location state missing (refresh?) -> default false usually safer
  const isCaller = typeof stateIsCaller === "boolean" ? stateIsCaller : false;

  console.log("VideoCall: CallID:", callId, "isCaller:", isCaller);

  /* ⚡ STREAMS via STATE */
  const { localStream, remoteStream, toggleAudio, toggleVideo } = useCallSocket({
    callId,
    isCaller,
  });

  /* Attach local stream */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  /* Attach remote stream */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  /* End call */
  const handleEndCall = async () => {
    try {
      if (role === "trainer") {
        await dispatch(endTrainerCall(callId));
      } else {
        await dispatch(endUserCall(callId));
      }
    } catch(err) {
        console.error("End call failed", err);
    } 
    navigate(-1); 
  };
  
  /* ⚡ LISTEN FOR REMOTE END CALL */
  useEffect(() => {
       if (currentStatus === "ended") {
           console.log("Remote commanded end call. Navigating back.");
           navigate(-1); 
       }
  }, [currentStatus, navigate]);

  /* TOGGLES */
  const handleToggleMic = () => {
    toggleAudio(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  const handleToggleCamera = () => {
    toggleVideo(!isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden flex items-center justify-center">
      {/* REMOTE VIDEO (Full Screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* OVERLAY GRADIENT */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* LOCAL VIDEO (Floating PIP - Top Right) */}
      <div className="absolute top-4 right-4 w-32 md:w-48 aspect-[3/4] bg-black rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!isCameraOn ? "hidden" : "block"}`}
        />
        {/* Placeholder avatar when camera off */}
        {!isCameraOn && (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
            Camera Off
          </div>
        )}
        
        {/* Mic Status Icon on Local Video */}
        {!isMicOn && (
          <div className="absolute bottom-2 right-2 p-1.5 bg-red-600 rounded-full">
             <MicOff size={12} className="text-white" />
          </div>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-50">
        
        {/* MIC TOGGLE */}
        <button
          onClick={handleToggleMic}
          className={`p-4 rounded-full transition-all shadow-lg backdrop-blur-md ${
            isMicOn 
              ? "bg-gray-700/50 hover:bg-gray-600/50 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        {/* END CALL (Main Action) */}
        <button
          onClick={handleEndCall}
          className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transition-transform hover:scale-105"
        >
          <PhoneOff size={32} fill="currentColor" />
        </button>

        {/* CAMERA TOGGLE */}
        <button
          onClick={handleToggleCamera}
          className={`p-4 rounded-full transition-all shadow-lg backdrop-blur-md ${
            isCameraOn 
              ? "bg-gray-700/50 hover:bg-gray-600/50 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isCameraOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
        </button>

      </div>
    </div>
  );
};

export default VideoCall;
