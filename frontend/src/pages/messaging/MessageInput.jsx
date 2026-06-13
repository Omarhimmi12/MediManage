import { useState, useRef } from "react";
import api from "../../api/axios";

const MessageInput = ({ conversationId, onMessageSent }) => {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !conversationId) return;

    setSending(true);
    try {
      const res = await api.post("/messages", {
        conversation_id: conversationId,
        content: content.trim(),
      });
      setContent("");
      onMessageSent?.(res.data.data);
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="mmd-message-input" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="mmd-message-input-field"
        placeholder="Écrivez votre message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sending || !conversationId}
        autoFocus
      />
      <button
        type="submit"
        className="mmd-message-send-btn"
        disabled={!content.trim() || sending || !conversationId}
      >
        {sending ? (
          <div className="mmd-loading-spinner mmd-spinner-sm" />
        ) : (
          <i className="bi bi-send-fill"></i>
        )}
      </button>
    </form>
  );
};

export default MessageInput;
