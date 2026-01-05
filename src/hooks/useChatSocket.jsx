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

    const wsUrl = `ws://localhost:8001/ws/chat/${roomId}/?token=${token}`;

    const connect = () => {
      if (!isActiveRef.current) return;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ CHAT WS CONNECTED");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "message" && isActiveRef.current) {
            dispatch(receiveSocketMessage(data.payload));
          }
        } catch (e) {
          console.error("Invalid WS payload", e);
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
