import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "antd";
import { PhoneCall, PhoneOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* USER */
import {
  acceptCall as userAcceptCall,
  endCall as userEndCall,
} from "../../redux/user_slices/userCallSlice";

/* TRAINER */
import {
  acceptCall as trainerAcceptCall,
  endCall as trainerEndCall,
} from "../../redux/trainer_slices/trainerCallSlice";

const AUTO_REJECT_MS = 30_000; // 30 seconds

const IncomingCallModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const userIncoming = useSelector(
    (state) => state.userCall?.incomingCall
  );
  const trainerIncoming = useSelector(
    (state) => state.trainerCall?.incomingCall
  );

  const incomingCall = userIncoming || trainerIncoming;
  const isTrainer = Boolean(trainerIncoming);

  console.log("IncomingCallModal: incomingCall", incomingCall, "isTrainer", isTrainer);

  /* =========================
     AUTO REJECT
  ========================== */
  useEffect(() => {
    if (!incomingCall) return;

    timeoutRef.current = setTimeout(() => {
      handleReject(true);
    }, AUTO_REJECT_MS);

    return () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCall]);

  if (!incomingCall) return null;

  const { call_id } = incomingCall;

  /* =========================
     ACTIONS
  ========================== */
  const handleAccept = async () => {
    clearTimeout(timeoutRef.current);

    if (isTrainer) {
      await dispatch(trainerAcceptCall(call_id));
    } else {
      await dispatch(userAcceptCall(call_id));
    }

    // 🔥 REQUIRED: move to video screen
    navigate(`/video-call/${call_id}`, { state: { isCaller: false } });
  };

  const handleReject = async (isAuto = false) => {
    clearTimeout(timeoutRef.current);

    if (isTrainer) {
      await dispatch(trainerEndCall(call_id));
    } else {
      await dispatch(userEndCall(call_id));
    }

    if (isAuto) {
      console.info("📞 Call auto-rejected");
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <Modal
      open
      centered
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <div className="flex flex-col items-center gap-4 p-6">
        <h2 className="text-xl font-bold">Incoming Video Call</h2>

        <p className="text-sm text-gray-500">
          Auto-rejecting in {AUTO_REJECT_MS / 1000}s…
        </p>

        <div className="flex gap-6 mt-4">
          <button
            onClick={() => handleReject(false)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            <PhoneOff />
            Reject
          </button>

          <button
            onClick={handleAccept}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            <PhoneCall />
            Accept
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default IncomingCallModal;
