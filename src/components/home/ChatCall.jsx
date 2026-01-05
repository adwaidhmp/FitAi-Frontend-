import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyTrainers,
  clearTrainerState,
  removeTrainer,
} from "../../redux/user_slices/trainerBookingSlice";

import {
  fetchChatRooms,
  fetchChatMessages,
  setActiveRoom,
  sendTextMessage,
  sendMediaMessage,
} from "../../redux/chatSlice";

import { useChatSocket } from "../../hooks/useChatSocket.jsx";

import {
  MessageSquare,
  Video,
  Phone,
  Send,
  ChevronLeft,
  Search,
  Paperclip,
  CheckCheck,
  Trash2,
} from "lucide-react";

import { Modal, message } from "antd";

const { confirm } = Modal;

const STATUS_COLOR = {
  approved: "bg-green-500",
  pending: "bg-yellow-400",
  rejected: "bg-red-500",
  cancelled: "bg-gray-500",
};

const TrainerChat = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { myTrainers = [], loading, error } = useSelector(
    (state) => state.trainerBooking || {}
  );

  const {
    rooms = [],
    activeRoomId = null,
    messagesByRoom = {},
    sendingMessage = false,
  } = useSelector((state) => state.chat || {});

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  useChatSocket(activeRoomId);

  useEffect(() => {
    dispatch(fetchMyTrainers());
    dispatch(fetchChatRooms());

    return () => {
      dispatch(clearTrainerState());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) setShowChatList(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);

    if (trainer.status !== "approved") {
      message.info(`Trainer is ${trainer.status}. Chat not available.`);
      return;
    }

    const room = rooms.find(
      (r) => r.trainer_user_id === trainer.trainer_user_id
    );

    if (!room) {
      message.warning("Chat room not ready yet");
      return;
    }

    dispatch(setActiveRoom(room.id));
    dispatch(fetchChatMessages(room.id));

    if (isMobileView) setShowChatList(false);
  };

  const handleRemoveTrainer = () => {
    if (!selectedTrainer) return;

    confirm({
      title: "Remove trainer?",
      content: "This will remove the trainer and chat access.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          await dispatch(removeTrainer()).unwrap();
          message.success("Trainer removed");
          setSelectedTrainer(null);
          dispatch(setActiveRoom(null));
          dispatch(fetchMyTrainers());
        } catch {
          message.error("Failed to remove trainer");
        }
      },
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRoomId) return;

    try {
      await dispatch(
        sendTextMessage({
          room_id: activeRoomId,
          text: newMessage.trim(),
        })
      ).unwrap();

      setNewMessage("");
    } catch {
      message.error("Failed to send message");
    }
  };

  const handleMediaSelect = async (e) => {
    if (!activeRoomId) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("room_id", activeRoomId);
    formData.append("file", file);
    formData.append("type", "media");

    try {
      await dispatch(sendMediaMessage(formData)).unwrap();
    } catch {
      message.error("Failed to send media");
    } finally {
      e.target.value = "";
    }
  };

  /* =======================
     🔧 ONLY FIX IS HERE
  ======================= */
  const rawMessages =
    activeRoomId && messagesByRoom
      ? messagesByRoom[activeRoomId]
      : null;

  const messages = Array.isArray(rawMessages)
    ? rawMessages
    : Array.isArray(rawMessages?.results)
    ? rawMessages.results
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeRoomId]);

  const visibleTrainers = myTrainers.filter((t) =>
    searchTerm
      ? t.trainer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-gray-300">
        Loading trainers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-400">
        {error}
      </div>
    );
  }

  /* =======================
     RENDER
  ======================== */
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* TRAINER LIST */}
      <div
        className={`${showChatList ? "flex" : "hidden"} md:flex flex-col w-full md:w-96 border-r border-gray-800`}
      >
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">My Trainers</h2>

          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search trainers..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleTrainers.map((trainer) => (
            <div
              key={trainer.booking_id}
              onClick={() => handleSelectTrainer(trainer)}
              className="p-5 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50"
            >
              <h3 className="text-white font-bold">
                {trainer.trainer_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    STATUS_COLOR[trainer.status] || "bg-gray-400"
                  }`}
                />
                <span className="text-xs text-gray-400 capitalize">
                  {trainer.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {!selectedTrainer ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <MessageSquare size={48} />
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 border-b border-gray-800 flex justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button onClick={() => setShowChatList(true)}>
                    <ChevronLeft />
                  </button>
                )}
                <h3 className="text-white font-bold">
                  {selectedTrainer.trainer_name}
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRemoveTrainer}
                  className="p-2 bg-red-600 rounded"
                >
                  <Trash2 />
                </button>
                <button className="p-2 bg-gray-800 rounded">
                  <Phone />
                </button>
                <button className="p-2 bg-gray-800 rounded">
                  <Video />
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${
                    msg.is_mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-md ${
                      msg.is_mine
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {msg.text || "📎 Media"}
                    <div className="text-xs mt-1 opacity-70 flex justify-end">
                      <CheckCheck size={14} />
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-gray-800 flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleMediaSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-gray-800 rounded"
              >
                <Paperclip />
              </button>

              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white rounded px-4"
              />

              <button
                onClick={handleSendMessage}
                disabled={sendingMessage}
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

export default TrainerChat;
