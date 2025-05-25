'use client';
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Paste your features or tasks and I'll help you turn them into Linear issues." }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input },
      { sender: "bot", text: input } // For now, echo input as bot response
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full flex flex-col h-[70vh]">
        <h1 className="text-xl text-black font-bold text-center py-4 border-b">Linear Issue Maker Chatbot</h1>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                msg.sender === "user"
                  ? "self-end bg-blue-100 text-blue-900 rounded-lg px-4 py-2 max-w-xs"
                  : "self-start bg-gray-200 text-gray-900 rounded-lg px-4 py-2 max-w-xs"
              }
            >
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
          <textarea
            className="flex-1 border rounded p-2 resize-none min-h-[40px] max-h-[100px] text-base text-black"
            placeholder="Type your tasks or features here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
