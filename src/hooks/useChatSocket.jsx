import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { receiveSocketMessage } from "../redux/chatSlice";

export function useChatSocket(roomId) {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;

    if (!roomId) return;

    const token = localStorage.getItem("access");
    if (!token) return;
    const wsBase = import.meta.env.VITE_USER_WS_URL;
    const wsUrl = `${wsBase}/ws/chat/${roomId}/?token=${token}`;

const connect = () => {
  if (!isActiveRef.current) return;

  const socket = new WebSocket(wsUrl);
  socketRef.current = socket;

  socket.onopen = () => {
    console.log("WS OPEN", wsUrl);
  };

  socket.onmessage = (event) => {
    console.log("WS MESSAGE RAW", event.data);

    try {
      const data = JSON.parse(event.data);

      console.log("WS MESSAGE PARSED", data);

      if (data.type === "message" && isActiveRef.current) {
        dispatch(receiveSocketMessage(data.payload));
      }
    } catch (e) {
      console.error("Invalid WS payload", e);
    }
  };

  socket.onerror = (e) => {
    console.log("WS ERROR", e);
    socket.close();
  };

  socket.onclose = (e) => {
    console.log("WS CLOSED", e.code, e.reason);

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
