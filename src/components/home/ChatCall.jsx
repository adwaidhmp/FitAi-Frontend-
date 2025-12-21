import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyTrainers,
  removeTrainer,
  clearTrainerState,
} from "../../redux/user_slices/trainerBookingSlice";

import {
  MessageSquare,
  Video,
  Phone,
  Send,
  User,
  ChevronLeft,
  Search,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Star,
  X,
} from "lucide-react";

const TrainerChat = () => {
  const dispatch = useDispatch();
  const { myTrainers, loading, error } = useSelector(
    (state) => state.trainerBooking
  );

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMyTrainers());
    return () => dispatch(clearTrainerState());
  }, [dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedTrainer]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowChatList(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setMessagesMap((prev) => ({
      ...prev,
      [trainer.trainer_user_id]: prev[trainer.trainer_user_id] || [],
    }));
    if (isMobileView) setShowChatList(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTrainer) return;

    setMessagesMap((prev) => ({
      ...prev,
      [selectedTrainer.trainer_user_id]: [
        ...(prev[selectedTrainer.trainer_user_id] || []),
        {
          id: Date.now(),
          sender: "user",
          text: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
        },
      ],
    }));

    setNewMessage("");
  };

  const handleRemoveTrainer = async () => {
    await dispatch(removeTrainer());
    setSelectedTrainer(null);
    dispatch(fetchMyTrainers());
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "bg-green-500";
    if (status === "pending") return "bg-yellow-500";
    if (status === "rejected") return "bg-red-500";
    if (status === "cancelled") return "bg-gray-500";
    return "bg-gray-500";
  };

const getStatusText = (status) => {
  switch (status) {
    case "approved":
      return "Active";
    case "pending":
      return "Pending";
    case "cancelled":
      return "Removed";
    case "rejected":
      return "Rejected";
    default:
      return status; 
  }
};

const filteredTrainers = myTrainers.filter((trainer) => {
  if (!searchTerm.trim()) return true;

  const name = trainer.trainer_name || "trainer";
  return name.toLowerCase().includes(searchTerm.toLowerCase());
});

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-gray-300">
        Loading trainers...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-red-400">
        {error}
      </div>
    );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* LEFT LIST */}
      <div
        className={`${
          showChatList ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-96 border-r border-gray-800`}
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
          {filteredTrainers.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No trainers found
            </div>
          ) : (
            filteredTrainers.map((trainer) => (
              <div
                key={trainer.booking_id}
                onClick={() => handleSelectTrainer(trainer)}
                className={`p-5 border-b border-gray-800 cursor-pointer
                  ${
                    selectedTrainer?.booking_id === trainer.booking_id
                      ? "bg-gray-800"
                      : "hover:bg-gray-800/50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">
                      {trainer.trainer_name || "Trainer"}
                    </h3>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${getStatusColor(
                        trainer.status
                      )}`}
                    >
                      {getStatusText(trainer.status)}
                    </span>
                  </div>
                  {trainer.rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-yellow-400" />
                      <span className="text-sm">{trainer.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {!selectedTrainer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} />
            <p className="mt-4">Select a trainer to view chat</p>
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
                <div>
                  <h3 className="text-white font-bold">
                    {selectedTrainer.trainer_name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {getStatusText(selectedTrainer.status)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert("Voice call")}
                  className="p-2 bg-gray-800 rounded"
                >
                  <Phone />
                </button>
                <button
                  onClick={() => alert("Video call")}
                  className="p-2 bg-gray-800 rounded"
                >
                  <Video />
                </button>

                {selectedTrainer.status === "approved" && (
                  <button
                    onClick={handleRemoveTrainer}
                    className="p-2 bg-red-900 rounded"
                  >
                    <X />
                  </button>
                )}
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4">
              {(messagesMap[selectedTrainer.trainer_user_id] || []).map(
                (msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-md ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-200"
                      }`}
                    >
                      {msg.text}
                      <div className="text-xs mt-1 opacity-70 flex justify-end">
                        {msg.sender === "user" ? (
                          msg.read ? (
                            <CheckCheck size={14} />
                          ) : (
                            <Check size={14} />
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-gray-800 flex gap-2">
              <button className="p-2 bg-gray-800 rounded">
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
