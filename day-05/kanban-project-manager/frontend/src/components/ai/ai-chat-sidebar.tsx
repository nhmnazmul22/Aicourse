"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

export function AIChatSidebar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function sendMessage() {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    api
      .post<{ response: string }>("/api/ai/board", {
        message: userMessage,
        history: messages,
      })
      .then((data) => {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
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
    <div className="ai-chat-sidebar">
      <Button
        className="ai-toggle"
        onClick={() => setOpen((o) => !o)}
        size="icon"
      >
        <span className="sr-only">Toggle AI assistant</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
        </svg>
      </Button>

      {open && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <h2>AI Assistant</h2>
            <Button
              className="ai-close"
              onClick={() => setOpen(false)}
              size="icon"
            >
              <span className="sr-only">Close chat</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </Button>
          </div>
          <div className="ai-chat-messages" aria-live="polite">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ai-message ai-message-${msg.role}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className="ai-message ai-message-assistant">Thinking…</div>}
          </div>
          <div className="ai-chat-input">
            <input
              className="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me to add, edit, or move cards…"
              disabled={loading}
            />
            <Button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="ai-send"
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
