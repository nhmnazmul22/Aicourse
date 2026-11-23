"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { useBoardStore } from "@/lib/board-store";

type AIUpdate = {
  type: "add" | "edit" | "delete" | "move";
  [key: string]: unknown;
};

type AIBoardResponse = {
  response: string;
  updates?: AIUpdate[];
};

export function AIChatSidebar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const projectId = useBoardStore((state) => state.project?.id);
  const loadBoard = useBoardStore((state) => state.loadBoard);

  function sendMessage() {
    if (!input.trim() || !projectId) return;
    const userMessage = input;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    api
      .post<AIBoardResponse>("/api/ai/board", {
        message: userMessage,
        history: messages,
        projectId,
      })
      .then((data) => {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        if (data.updates && data.updates.length > 0) {
          loadBoard(projectId);
        }
        setLoading(false);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
        ]);
        setLoading(false);
      });
  }

  return (
    <aside className={`fixed top-[70px] right-0 z-50 w-14 h-[calc(100vh-70px)] flex flex-col items-center justify-start pt-4 transition-all duration-200 bg-white border-l border-gray-200 shadow-lg ${open ? "w-84" : ""}`} onClick={(e) => e.stopPropagation()}>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      <button
        className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center mb-6 hover:bg-purple-700 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle AI assistant"
      >
        <span className="sr-only">Toggle AI assistant</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
        </svg>
      </button>

      {open && (
        <div className="w-full h-full flex flex-col bg-white border-l border-gray-200 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-navy-dark text-sm font-semibold">AI Assistant</h2>
            <button
              className="w-6 h-6 p-0 text-xs"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 aria-live-polite">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[85%] ${msg.role === "user" ? "self-end bg-blue-500 text-white rounded-br-[2px]" : "self-start bg-gray-50 text-ink border border-gray-200 rounded-bl-[2px]"}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="self-start p-2.5 rounded-lg text-xs bg-gray-50 text-ink border border-gray-200 rounded-bl-[2px]">
                Thinking…
              </div>
            )}
          </div>
          <div className="flex gap-2 p-4 border-t border-gray-200">
            <input
              className="flex-1 min-h-[36px] px-3 py-1.5 border border-gray-200 rounded bg-white text-ink text-sm focus:border-blue-300 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me to add, edit, or move cards…"
              disabled={loading}
            />
            <button
              className="h-[36px] px-4 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
