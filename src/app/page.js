'use client';
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Paste your features or tasks and I'll help you turn them into Linear issues." }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input }
    ]);
    setInput("");
    setLoading(true);
    setMessages((msgs) => [
      ...msgs,
      { sender: "bot", text: "Thinking..." }
    ]);
    try {
      const res = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: input })
      });
      const data = await res.json();
      console.log('OpenRouter response:', data); // Added debug log
      setMessages((msgs) => [
        ...msgs.slice(0, -1), // remove "Thinking..."
        { sender: "bot", text: data.issues ? `Here are your Linear issues:\n\n${data.issues}` : "Sorry, I couldn't parse your tasks." }
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { sender: "bot", text: "Sorry, there was an error contacting OpenRouter." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full flex flex-col h-[70vh]">
        <h1 className="text-xl font-bold text-center py-4 border-b">Linear Issue Maker Chatbot</h1>
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
              {msg.text.startsWith('Here are your Linear issues:') ? (
                <>
                  {msg.text.split('\n\n')[0]}
                  <pre className="mt-2 bg-gray-900 text-green-200 text-xs rounded p-2 overflow-x-auto">
                    {msg.text.split('\n\n')[1]}
                  </pre>
                </>
              ) : msg.text}
            </div>
          ))}
          {loading && (
            <div className="self-start bg-gray-200 text-gray-900 rounded-lg px-4 py-2 max-w-xs animate-pulse">Thinking...</div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
          <textarea
            className="flex-1 border rounded p-2 resize-none min-h-[40px] max-h-[100px] text-base"
            placeholder="Type your tasks or features here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
