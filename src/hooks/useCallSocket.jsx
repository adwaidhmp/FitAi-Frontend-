import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export const useCallSocket = ({ callId, isCaller }) => {
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  // Use State for reactive UI updates, Refs for internal logic persistence
  const [localStream, setLocalStream] = useState(null);
  // Initial remote stream must be a new MediaStream for tracks to be added
  const [remoteStream, setRemoteStream] = useState(new MediaStream()); 

  const localStreamRef = useRef(null); // Keep ref for tracks access in cleanup

  // ⚠️ FIX: authSlice does not store accessToken. Use localStorage.
  const token = localStorage.getItem("access");

  useEffect(() => {
    console.log("🟡 useCallSocket INIT", { callId, isCaller, token });

    if (!callId || !token) {
      console.warn("⛔ Missing callId or token");
      return;
    }

    let isMounted = true;

    /* =========================
       CREATE PEER
    ========================== */
    const createPeer = (currentRemoteStream) => {
      console.log("🧠 Creating RTCPeerConnection");

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("🧊 ICE candidate generated", e.candidate);

          socketRef.current?.send(
            JSON.stringify({
              type: "CALL_ICE",
              candidate: e.candidate,
            })
          );
        }
      };

      peer.ontrack = (e) => {
        console.log("🎥 Remote track received", e.streams);
        e.streams[0].getTracks().forEach((track) => {
           currentRemoteStream.addTrack(track);
        });
        // Force update to trigger re-render if needed, though adding track to existing stream object usually works if attached
        setRemoteStream(new MediaStream(currentRemoteStream.getTracks())); 
      };

      peer.onconnectionstatechange = () => {
        console.log("🔗 Peer connection state:", peer.connectionState);
      };

      peer.onsignalingstatechange = () => {
        console.log("📡 Signaling state:", peer.signalingState);
      };

      return peer;
    };

    /* =========================
       OPEN WS
    ========================== */
    const wsBase = import.meta.env.VITE_USER_WS_URL || "ws://127.0.0.1:8001";
    const wsUrl = `${wsBase}/ws/calls/${callId}/?token=${token}`;
    console.log("🌐 Opening Call WS:", wsUrl);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = async () => {
      console.log("✅ CALL WS OPEN");

      if (!isMounted) {
        console.warn("⛔ Component unmounted before WS open");
        return;
      }

      try {
        // 1️⃣ Get media
        console.log("🎙️ Requesting media devices...");
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        
        localStreamRef.current = stream;
        setLocalStream(stream);

        console.log("🎥 Local stream acquired", stream.getTracks());

        // 2️⃣ Create peer
        // Create a dedicated remote stream instance for this connection
        const newRemoteStream = new MediaStream();
        setRemoteStream(newRemoteStream);
        
        peerRef.current = createPeer(newRemoteStream);

        // 3️⃣ Add tracks
        stream.getTracks().forEach((track) => {
          console.log("➕ Adding local track to peer", track.kind);
          peerRef.current.addTrack(track, stream);
        });

        // 🔥 ONLY CALLER CREATES OFFER
        if (isCaller) {
          console.log("📞 Caller creating OFFER");

          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);

          console.log("📨 Sending OFFER", offer);

          ws.send(
            JSON.stringify({
              type: "CALL_OFFER",
              offer,
            })
          );
        } else {
          console.log("📵 Callee waiting for OFFER");
        }
      } catch (err) {
        console.error("❌ Error during WS open setup", err);
      }
    };

    /* =========================
       SIGNALING
    ========================== */
    ws.onmessage = async (event) => {
      console.log("📩 WS MESSAGE RAW:", event.data);

      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("❌ Failed to parse WS message", e);
        return;
      }

      if (!peerRef.current) {
        console.warn("⚠️ Peer not ready yet, ignoring message");
        return;
      }

      console.log("📨 WS MESSAGE PARSED:", data);

      try {
        switch (data.type) {
          case "CALL_OFFER": {
            console.log("📥 Received OFFER");

            await peerRef.current.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );

            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);

            console.log("📤 Sending ANSWER", answer);

            ws.send(
              JSON.stringify({
                type: "CALL_ANSWER",
                answer,
              })
            );
            break;
          }

          case "CALL_ANSWER": {
            console.log("📥 Received ANSWER");

            await peerRef.current.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
            break;
          }

          case "CALL_ICE": {
            console.log("🧊 Received ICE", data.candidate);

            if (data.candidate) {
              await peerRef.current.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
            }
            break;
          }

          case "CALL_ENDED": {
            console.warn("📴 CALL ENDED received");
            cleanup();
            break;
          }

          default:
            console.warn("⚠️ Unknown WS message type", data.type);
            break;
        }
      } catch (err) {
        console.error("❌ Error handling WS message", err);
      }
    };

    /* =========================
       CLEANUP
    ========================== */
    const cleanup = () => {
      console.warn("🧹 CLEANUP CALL RESOURCES");

      if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
      }
      
      if (peerRef.current) {
          peerRef.current.close();
          peerRef.current = null;
      }

      if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => {
            console.log("🛑 Stopping local track", t.kind);
            t.stop();
          });
          localStreamRef.current = null;
      }
      setLocalStream(null);
      // setRemoteStream(new MediaStream()); // Optional: clear remote view
    };

    ws.onclose = (e) => {
      console.warn("🔌 CALL WS CLOSED", e.code, e.reason);
      // cleanup(); // Prevent cleanup loop if called from cleanup
    };

    ws.onerror = (e) => {
      console.error("❌ CALL WS ERROR", e);
      // cleanup(); 
    };

    return () => {
      console.warn("♻️ useCallSocket UNMOUNT");
      isMounted = false;
      cleanup();
    };
  }, [callId, token, isCaller]);

  /* =========================
     MEDIA CONTROLS
  ========================== */
  const toggleAudio = (enabled) => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  };

  const toggleVideo = (enabled) => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  };

  return {
    localStream,
    remoteStream,
    toggleAudio,
    toggleVideo,
  };
};
