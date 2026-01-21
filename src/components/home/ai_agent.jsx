import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { askAI } from "../../redux/rag_agent_slcie/agent_slice";
import { X, ChevronDown } from "lucide-react";

const AiAgent = () => {
  const dispatch = useDispatch();
  const { answer, loading, error } = useSelector((state) => state.ai);

  // State for UI toggling and message history
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello! I'm your AI Diet Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Effect to handle incoming answers from Redux
  useEffect(() => {
    if (answer) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: answer },
      ]);
    }
  }, [answer]);

   // Effect to handle errors
   useEffect(() => {
    if (error) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Sorry, I encountered an error. Please try again." },
      ]);
    }
  }, [error]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message immediately
    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Dispatch action to AI
    dispatch(askAI({ question: input }));

    // Clear input
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg transition-transform hover:scale-110 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          /* Robot Icon SVG */
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M12 2a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3V4a2 2 0 0 1 2-2zm0 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4-2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-96 w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
            <h3 className="font-semibold flex items-center gap-2">
               {/* Mini Robot Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3V4a2 2 0 0 1 2-2zm0 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4-2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
               </svg>
              AI Assistant
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-indigo-700 focus:outline-none transition-colors"
            >
              <ChevronDown className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                      msg.type === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg rounded-bl-none border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-75"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask something..."
                className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ backgroundColor: '#4f46e5', color: 'white' }}
              >
                {/* Send Icon SVG - Paper Plane */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                  <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAgent;
