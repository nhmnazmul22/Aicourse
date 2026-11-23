"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/services/api";
import { useBoardStore } from "@/lib/board-store";

type AIUpdate = {
  type: "add" | "edit" | "delete" | "move";
  [key: string]: unknown;
};

type AIBoardResponse = {
  response?: string;
  text?: string;
  updates?: AIUpdate[];
  actions?: unknown[];
};

export function AIChatSidebar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const projectId = useBoardStore((state) => state.project?.id);
  const loadBoard = useBoardStore((state) => state.loadBoard);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

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
        const reply = data.response || data.text || "AI updated the board.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        if ((data.updates && data.updates.length > 0) || (data.actions && data.actions.length > 0)) {
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Chat Window */}
      {open && (
        <div
          role="dialog"
          aria-label="AI Assistant"
          className="mb-3 w-96 max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Dark Navy background (#032147) and Accent Yellow (#ecad0a) accent line */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#032147] border-b-2 border-[#ecad0a] text-white">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ecad0a] animate-pulse" />
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-white">AI Assistant</h2>
                <p className="text-[11px] text-[#888888]">Kanban board copilot</p>
              </div>
            </div>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f8fafc]" aria-live="polite">
            {messages.length === 0 && (
              <div className="my-auto text-center px-4 py-6">
                <div className="w-12 h-12 rounded-full bg-[#753991]/10 text-[#753991] flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-[#032147] mb-1">How can I help with your board?</h3>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Ask me to add, edit, or move cards across columns.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-xs ${
                  msg.role === "user"
                    ? "self-end bg-[#209dd7] text-white rounded-br-xs"
                    : "self-start bg-white text-[#032147] border border-gray-200 rounded-bl-xs"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="self-start p-3 rounded-2xl rounded-bl-xs text-xs bg-white text-[#888888] border border-gray-200 shadow-xs flex items-center gap-2">
                <span>Thinking…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2 p-3 bg-white border-t border-gray-200">
            <input
              className="flex-1 min-h-[40px] px-3.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-[#032147] placeholder:text-[#888888] focus:bg-white focus:border-[#209dd7] focus:outline-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask me to add, edit, or move cards…"
              disabled={loading}
            />
            <button
              className="h-[40px] px-4 text-xs font-semibold bg-[#753991] text-white rounded-xl hover:bg-[#622e7c] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="w-14 h-14 rounded-full bg-[#753991] text-white border-2 border-[#ecad0a] shadow-xl hover:shadow-2xl hover:bg-[#622e7c] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle AI assistant"
      >
        <span className="sr-only">Toggle AI assistant</span>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
