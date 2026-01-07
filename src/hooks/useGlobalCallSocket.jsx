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

export const useGlobalCallSocket = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.accessToken);
  const role = useSelector((state) => state.auth?.user?.role); // "user" | "trainer"

  console.log("useGlobalCallSocket: role =", role);

  useEffect(() => {
    if (!token || !role) return;

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_BASE_URL}/ws/user/call/?token=${token}`
    );

    ws.onopen = () => {
      console.log("🔗 Global call WS connected for", role);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.error("❌ Invalid WS message", event.data);
        return;
      }

      const payload = data.payload;
      console.log("📨 WS message received", data.type, payload);

      switch (data.type) {
        case "INCOMING_CALL":
          role === "trainer"
            ? dispatch(addTrainerIncomingCall(payload))
            : dispatch(addUserIncomingCall(payload));
          break;

        case "CALL_ACCEPTED":
          role === "trainer"
            ? dispatch(trainerCallAccepted(payload))
            : dispatch(userCallAccepted(payload));
          break;

        case "CALL_ENDED":
          role === "trainer"
            ? dispatch(trainerCallEnded())
            : dispatch(userCallEnded());
          break;

        default:
          break;
      }
    };

    ws.onerror = (e) => {
      console.error("❌ Global call WS error", e);
    };

    ws.onclose = () => {
      console.warn("⚠️ Global call WS closed");
    };

    return () => ws.close();
  }, [token, role, dispatch]);
};
