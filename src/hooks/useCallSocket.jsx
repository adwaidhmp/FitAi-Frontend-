import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export const useCallSocket = ({ callId, isCaller }) => {
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());

  const token = useSelector((state) => state.auth?.accessToken);

  useEffect(() => {
    if (!callId || !token) return;

    let isMounted = true;

    /* =========================
       CREATE PEER
    ========================== */
    const createPeer = () => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current?.send(
            JSON.stringify({
              type: "CALL_ICE",
              candidate: e.candidate,
            })
          );
        }
      };

      peer.ontrack = (e) => {
        e.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current.addTrack(track);
        });
      };

      return peer;
    };

    /* =========================
       OPEN WS
    ========================== */
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_BASE_URL}/ws/calls/${callId}/?token=${token}`
    );

    socketRef.current = ws;

    ws.onopen = async () => {
      if (!isMounted) return;

      // 1️⃣ Get media
      localStreamRef.current =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      // 2️⃣ Create peer
      peerRef.current = createPeer();

      // 3️⃣ Add tracks
      localStreamRef.current.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, localStreamRef.current);
      });

      // 🔥 ONLY CALLER CREATES OFFER
      if (isCaller) {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);

        ws.send(
          JSON.stringify({
            type: "CALL_OFFER",
            offer,
          })
        );
      }
    };

    /* =========================
       SIGNALING
    ========================== */
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (!peerRef.current) return;

      switch (data.type) {
        case "CALL_OFFER": {
          // callee only
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );

          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);

          ws.send(
            JSON.stringify({
              type: "CALL_ANSWER",
              answer,
            })
          );
          break;
        }

        case "CALL_ANSWER": {
          // caller only
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          break;
        }

        case "CALL_ICE": {
          if (data.candidate) {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }
          break;
        }

        case "CALL_ENDED": {
          cleanup();
          break;
        }

        default:
          break;
      }
    };

    /* =========================
       CLEANUP
    ========================== */
    const cleanup = () => {
      socketRef.current?.close();
      peerRef.current?.close();

      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = new MediaStream();
    };

    ws.onclose = cleanup;
    ws.onerror = cleanup;

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [callId, token, isCaller]);

  return {
    localStreamRef,
    remoteStreamRef,
  };
};
