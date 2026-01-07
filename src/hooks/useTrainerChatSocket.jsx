import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  receiveSocketMessage,
  markRoomRead,
} from "../redux/trainer_slices/trainerChatSlice";

/**
 * Trainer chat WebSocket hook
 *
 * Responsibilities:
 * - connect to user_service WS
 * - receive messages
 * - update local read state
 * - auto reconnect
 * - cleanup correctly
 *
 * WS is RECEIVE-ONLY
 */
export function useTrainerChatSocket(roomId) {
  const dispatch = useDispatch();

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    isActiveRef.current = true;

    const token = localStorage.getItem("access");
    if (!token) return;

    const wsBase = import.meta.env.VITE_USER_WS_URL;
    const wsUrl = `${wsBase}/ws/chat/${roomId}/?token=${token}`;

    const connect = () => {
      if (!isActiveRef.current) return;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        // local-only read update
        dispatch(markRoomRead(roomId));
      };

      socket.onmessage = (event) => {
        if (!isActiveRef.current) return;

        try {
          const data = JSON.parse(event.data);

          if (data.type === "message") {
            dispatch(receiveSocketMessage(data.payload));
          }
        } catch {
          // silently ignore invalid frames
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        if (!isActiveRef.current) return;

        reconnectTimerRef.current = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      isActiveRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
    };
  }, [roomId, dispatch]);
}
