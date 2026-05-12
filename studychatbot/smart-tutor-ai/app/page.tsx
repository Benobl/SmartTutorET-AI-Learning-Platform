"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setChat((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await res.json();

      const aiMessage = {
        role: "assistant",
        content: data.reply,
      };

      setChat((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          SmartTutorET AI
        </h1>

        <div className="bg-zinc-900 rounded-xl p-4 h-[500px] overflow-y-auto mb-4">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.role === "user"
                  ? "text-blue-400"
                  : "text-green-400"
              }`}
            >
              <strong>
                {msg.role === "user" ? "You" : "AI"}:
              </strong>{" "}
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-yellow-400">
              AI is thinking...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask anything..."
            className="flex-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}