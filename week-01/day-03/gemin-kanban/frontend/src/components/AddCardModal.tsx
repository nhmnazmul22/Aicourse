import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AddCardModalProps {
  isOpen: boolean;
  columnTitle: string;
  onClose: () => void;
  onSubmit: (title: string, details: string) => void;
}

export function AddCardModal({
  isOpen,
  columnTitle,
  onClose,
  onSubmit,
}: AddCardModalProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDetails("");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Card title is required.");
      return;
    }
    onSubmit(trimmedTitle, details.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      data-testid="add-card-modal-backdrop"
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-[#032147]">
              Add New Card
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Adding to column: <span className="font-medium text-[#209dd7]">{columnTitle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
            data-testid="modal-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="card-title-input"
              className="block text-xs font-semibold text-[#032147] mb-1.5 uppercase tracking-wide"
            >
              Card Title *
            </label>
            <input
              id="card-title-input"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter card title..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209dd7] focus:border-[#209dd7] transition-all text-[#032147] placeholder-[#888888]"
              data-testid="card-title-input"
            />
            {error && (
              <p className="text-xs text-red-600 mt-1 font-medium" data-testid="title-error">
                {error}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="card-details-input"
              className="block text-xs font-semibold text-[#032147] mb-1.5 uppercase tracking-wide"
            >
              Details
            </label>
            <textarea
              id="card-details-input"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter card details..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209dd7] focus:border-[#209dd7] transition-all text-[#032147] placeholder-[#888888] resize-none"
              data-testid="card-details-input"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              data-testid="cancel-card-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#753991] hover:bg-[#602d77] rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.98]"
              data-testid="submit-card-button"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
