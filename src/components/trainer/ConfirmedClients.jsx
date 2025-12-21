import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApprovedUsers,
  clearTrainerApprovalState,
} from "../../redux/trainer_slices/trainerBookingApprovalSlice";

import {
  MessageSquare,
  Video,
  Phone,
  Send,
  ChevronLeft,
  Search,
  X,
} from "lucide-react";

const ConfirmedClients = () => {
  const dispatch = useDispatch();
  const { approvedUsers, loading, error } = useSelector(
    (state) => state.trainerBookingApproval
  );

  const [selectedUser, setSelectedUser] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showList, setShowList] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchApprovedUsers());
    return () => dispatch(clearTrainerApprovalState());
  }, [dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedUser]);

  useEffect(() => {
    const resize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowList(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessagesMap((prev) => ({
      ...prev,
      [user.booking_id]: prev[user.booking_id] || [],
    }));
    if (isMobileView) setShowList(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    setMessagesMap((prev) => ({
      ...prev,
      [selectedUser.booking_id]: [
        ...(prev[selectedUser.booking_id] || []),
        {
          id: Date.now(),
          sender: "trainer",
          text: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    }));

    setNewMessage("");
  };

  const filteredUsers = approvedUsers.filter((u) => {
    if (!searchTerm.trim()) return true;
    const name = u.user_name || "user";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-gray-300">
        Loading approved users...
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
                key={user.booking_id}
                onClick={() => handleSelectUser(user)}
                className={`p-5 border-b border-gray-800 cursor-pointer ${
                  selectedUser?.booking_id === user.booking_id
                    ? "bg-gray-800"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <h3 className="text-white font-bold">
                  {user.user_name || "User"}
                </h3>
                <span className="text-xs text-green-400">Active</span>
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
            <div className="p-4 border-b border-gray-800 flex justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button onClick={() => setShowList(true)}>
                    <ChevronLeft />
                  </button>
                )}
                <div>
                  <h3 className="text-white font-bold">
                    {selectedUser.user_name || "User"}
                  </h3>
                  <span className="text-xs text-gray-400">Approved</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert("Voice call not implemented")}
                  className="p-2 bg-gray-800 rounded"
                >
                  <Phone />
                </button>
                <button
                  onClick={() => alert("Video call not implemented")}
                  className="p-2 bg-gray-800 rounded"
                >
                  <Video />
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4">
              {(messagesMap[selectedUser.booking_id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className="mb-3 flex justify-end"
                >
                  <div className="p-3 rounded-xl max-w-md bg-blue-600 text-white">
                    {msg.text}
                  </div>
                </div>
              ))}
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

export default ConfirmedClients;
