import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

/* USER */
import {
  addIncomingCall as addUserIncomingCall,
  callAccepted as userCallAccepted,
  callEnded as userCallEnded,
} from "../redux/user_slices/userCallSlice";

/* TRAINER */
import {
  addIncomingCall as addTrainerIncomingCall,
  callAccepted as trainerCallAccepted,
  callEnded as trainerCallEnded,
} from "../redux/trainer_slices/trainerCallSlice";

import { message } from "antd"; // ✅ ADDED

export const useGlobalCallSocket = () => {
  const dispatch = useDispatch();
  // ⚠️ FIX: authSlice does not store accessToken. Use localStorage.
  const token = localStorage.getItem("access");
  const role = useSelector((state) => state.auth?.profile?.role);
  const user = useSelector((state) => state.auth?.profile || state.auth?.user); // ✅ GET USER

  console.log("🟢 useGlobalCallSocket INIT → token:", !!token, "role:", role);
  console.log("👤 MY USER ID:", user?.user_id || user?.id, "Role:", role); // ✅ LOG ID
  console.log("🚀 RELOADED: Global Socket Version 2.0 (Targeting Port 8001)");

  useEffect(() => {
    // 🔑 ONLY TOKEN MATTERS
    // 🔑 ROLE MATTERS TOO (to pick correct port)
    if (!token || !role) {
      console.warn("⛔ Global WS skipped (missing token or role)", { token: !!token, role });
      return;
    }

    // 🔑 ROLE CHECK (Wait for valid role)
    if (!token || !role) {
       // ... (wait)
       return;
    }

    // 💡 DISCOVERY: UserCallConsumer is on the Chat Service (8001)
    // The routing.py provided shows it alongside ChatConsumer.
    // So both User and Trainer should connect to 8001.
    
    // Use Chat Service Port (8001)
    const WS_BASE = import.meta.env.VITE_USER_WS_URL || "ws://127.0.0.1:8001";
    
    // The path is defined as "^ws/user/call/$" in routing.py
    // It seems "user" here refers to the consumer name, not the service.
    const path = "/ws/user/call/";

    const wsUrl = `${WS_BASE}${path}?token=${token}`;
    console.log(`🌐 Opening GLOBAL CALL WS [${role}]:`, wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ Global call WS CONNECTED");
    };

    ws.onmessage = (event) => {
      console.log("📩 RAW GLOBAL WS MESSAGE:", event.data);

      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.error("❌ Invalid WS JSON", event.data);
        return;
      }

      console.log("📨 PARSED GLOBAL WS MESSAGE:", data);

      const type = data.type;
      const payload = data;
      const isTrainer = role === "trainer";

      switch (type) {
        case "INCOMING_CALL":
          console.log("📞 INCOMING_CALL → Dispatching to Redux");
          if (isTrainer) {
            dispatch(addTrainerIncomingCall(payload));
          } else {
            dispatch(addUserIncomingCall(payload));
          }
          break;

        case "CALL_ACCEPTED":
          console.log("✅ CALL_ACCEPTED");
          isTrainer
            ? dispatch(trainerCallAccepted(payload))
            : dispatch(userCallAccepted(payload));
          break;

        case "CALL_ENDED":
          console.log("📴 CALL_ENDED");
          if (isTrainer) {
            dispatch(trainerCallEnded());
          } else {
            dispatch(userCallEnded());
          }
          // 🚀 FORCE NAVIGATION - The slice state update might not trigger navigation if the component isn't watching it appropriately or if we need a global handler. 
          // However, useGlobalCallSocket is a hook. We cannot easily use 'useNavigate' inside a conditional effect without risk.
          // BUT: The components (VideoCallUser/Trainer) *should* be watching the callStatus.
          // Let's verify if 'trainerCallEnded' / 'userCallEnded' sets the status to 'ended'.
          break;

        default:
          console.warn("⚠️ Unknown GLOBAL WS event:", type);
      }
    };

    ws.onerror = (e) => {
      console.error("❌ Global call WS ERROR", e);
    };

    ws.onclose = () => {
      console.warn("🔌 Global call WS CLOSED");
    };

    return () => {
      console.warn("♻️ Closing GLOBAL CALL WS");
      ws.close();
    };
  }, [token, role, dispatch, user]);
};
