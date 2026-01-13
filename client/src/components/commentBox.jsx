import { useState } from "react";

export default function CommentBox({ onSubmit, isSending = false }) {
  const [comment, setComment] = useState("");

  const handleSend = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setComment("");
  };

  return (
    <div className="w-full mt-2 flex items-start gap-2">
      <textarea
        rows={2}
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:ring-1 focus:ring-blue-500"
        placeholder="Add your comment…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
      />

      <button
        onClick={handleSend}
        disabled={isSending || !comment.trim()}
        className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
      >
        {isSending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
