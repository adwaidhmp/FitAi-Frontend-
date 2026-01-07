import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

/* APPROVAL */
import {
  fetchApprovedUsers,
  clearTrainerApprovalState,
} from "../../redux/trainer_slices/trainerBookingApprovalSlice";

/* CHAT */
import {
  fetchTrainerChatRooms,
  fetchTrainerChatMessages,
  sendTrainerTextMessage,
  sendTrainerMediaMessage,
  setActiveRoom,
} from "../../redux/trainer_slices/trainerChatSlice";

/* CALL */
import { startCall  } from "../../redux/trainer_slices/trainerCallSlice";

/* SOCKET */
import { useTrainerChatSocket } from "../../hooks/useTrainerChatSocket";

/* ICONS */
import {
  MessageSquare,
  Video,
  Phone,
  Send,
  ChevronLeft,
  Search,
  Paperclip,
} from "lucide-react";

const ConfirmedClients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* =======================
     REDUX STATE
  ======================== */
  const { approvedUsers = [] } = useSelector(
    (state) => state.trainerBookingApproval || {}
  );

  const {
    rooms = [],
    activeRoomId,
    messagesByRoom = {},
    sending,
  } = useSelector((state) => state.trainerChat || {});

  const { activeCall } = useSelector(
    (state) => state.trainerCall || {}
  );

  /* =======================
     LOCAL STATE
  ======================== */
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showList, setShowList] = useState(true);

  /* =======================
     INIT
  ======================== */
  useEffect(() => {
    dispatch(fetchApprovedUsers());
    dispatch(fetchTrainerChatRooms());

    return () => {
      dispatch(clearTrainerApprovalState());
    };
  }, [dispatch]);

  /* =======================
     MOBILE
  ======================== */
  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) setShowList(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* =======================
     SOCKET
  ======================== */
  useTrainerChatSocket(activeRoomId);

  /* =======================
     AUTOSCROLL
  ======================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByRoom, activeRoomId]);

  /* =======================
     ✅ CALL ACCEPTED → NAVIGATE
  ======================== */
  useEffect(() => {
    if (activeCall?.call_id) {
      navigate(`/video-call/${activeCall.call_id}`);
    }
  }, [activeCall, navigate]);

  /* =======================
     HANDLERS
  ======================== */

  const handleSelectUser = (user) => {
    const room = rooms.find((r) => r.user_id === user.user_id);
    if (!room) return;

    setSelectedUser(user);
    dispatch(setActiveRoom(room.id));
    dispatch(fetchTrainerChatMessages({ roomId: room.id }));

    if (isMobileView) setShowList(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoomId) return;

    dispatch(
      sendTrainerTextMessage({
        roomId: activeRoomId,
        text: newMessage,
      })
    );

    setNewMessage("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoomId) return;

    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("audio")
      ? "audio"
      : null;

    if (!type) return;

    dispatch(
      sendTrainerMediaMessage({
        roomId: activeRoomId,
        file,
        type,
      })
    );

    e.target.value = "";
  };

  /* =======================
     🎥 VIDEO CALL (FIXED)
  ======================== */
  const handleVideoCall = async () => {
    if (!activeRoomId || !selectedUser) return;

    try {
      await dispatch(startCall(activeRoomId)).unwrap();

    } catch {
      // optional toast if you want
    }
  };

  /* =======================
     DATA
  ======================== */

  const filteredUsers = approvedUsers.filter((u) =>
    (u.user_name || "user")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const messages = messagesByRoom[activeRoomId] || [];

  /* =======================
     RENDER
  ======================== */

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* USER LIST */}
      <div
        className={`${
          showList ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-96 border-r border-gray-800`}
      >
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Approved Users</h2>

          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No approved users
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.user_id}
                onClick={() => handleSelectUser(user)}
                className={`p-5 border-b border-gray-800 cursor-pointer ${
                  selectedUser?.user_id === user.user_id
                    ? "bg-gray-800"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <h3 className="text-white font-bold">
                  {user.user_name || "User"}
                </h3>
                <span className="text-xs text-green-400">Approved</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} />
            <p className="mt-4">Select a user to view chat</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button onClick={() => setShowList(true)}>
                    <ChevronLeft />
                  </button>
                )}
                <div>
                  <h3 className="text-white font-bold">
                    {selectedUser.user_name}
                  </h3>
                  <span className="text-xs text-gray-400">Approved</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-gray-800 rounded">
                  <Phone />
                </button>
                <button
                  className="p-2 bg-gray-800 rounded"
                  onClick={handleVideoCall}
                >
                  <Video />
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => {
                const isTrainer = msg.sender_role === "trainer";

                return (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      isTrainer ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-md ${
                        isTrainer
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-200"
                      }`}
                    >
                      {msg.type === "text" && msg.text}

                      {msg.type === "image" && (
                        <img
                          src={msg.file}
                          alt="media"
                          className="max-w-xs rounded"
                        />
                      )}

                      {msg.type === "audio" && (
                        <audio controls src={msg.file} />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-gray-800 flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white rounded px-4"
              />

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*,audio/*"
                onChange={handleFileSelect}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-gray-700 rounded"
              >
                <Paperclip />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={sending}
                className="p-2 bg-blue-600 rounded"
              >
                <Send />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmedClients;
