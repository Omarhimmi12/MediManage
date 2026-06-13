import { useEffect, useRef, useMemo } from "react";
import MessageInput from "./MessageInput";

const ROLE_LABELS = {
  medecin: "Médecin",
  secretaire: "Secrétaire",
  patient: "Patient",
};

const ChatWindow = ({ conversation, messages, currentUser, onNewMessage }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";

    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const messagesWithSeparators = useMemo(() => {
    if (!messages.length) return [];

    const result = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== lastDate) {
        result.push({ type: "date-separator", date: msg.created_at });
        lastDate = msgDate;
      }
      result.push({ type: "message", data: msg });
    });

    return result;
  }, [messages]);

  if (!conversation) {
    return (
      <div className="mmd-chat-window">
        <div className="mmd-chat-empty">
          <div className="mmd-chat-empty-icon">
            <i className="bi bi-chat-dots"></i>
          </div>
          <h3>Messagerie</h3>
          <p>Sélectionnez une conversation pour commencer à discuter</p>
        </div>
      </div>
    );
  }

  const otherUser = conversation.other_user;

  return (
    <div className="mmd-chat-window">
      <div className="mmd-chat-header">
        <div className="mmd-chat-header-avatar">
          {otherUser?.prenom?.charAt(0)?.toUpperCase() || otherUser?.nom?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="mmd-chat-header-info">
          <h4>
            {otherUser?.prenom || ""} {otherUser?.nom || ""}
          </h4>
          <span className="mmd-chat-header-role">
            {ROLE_LABELS[otherUser?.user_type] || otherUser?.user_type}
          </span>
        </div>
      </div>

      <div className="mmd-chat-messages">
        {messagesWithSeparators.length === 0 ? (
          <div className="mmd-chat-no-messages">
            <p>Aucun message dans cette conversation</p>
            <span>Envoyez le premier message</span>
          </div>
        ) : (
          messagesWithSeparators.map((item, index) => {
            if (item.type === "date-separator") {
              return (
                <div key={`date-${index}`} className="mmd-chat-date-separator">
                  <span>{formatDateLabel(item.date)}</span>
                </div>
              );
            }

            const msg = item.data;
            const isOwn = msg.sender_id === currentUser?.id;
            const showAvatar =
              !isOwn &&
              (index === 0 ||
                messagesWithSeparators[index - 1]?.type === "date-separator" ||
                messagesWithSeparators[index - 1]?.data?.sender_id !== msg.sender_id);

            return (
              <div
                key={msg.id || `msg-${index}`}
                className={`mmd-chat-message ${isOwn ? "mmd-chat-message--own" : "mmd-chat-message--other"}`}
                style={showAvatar ? { marginTop: "12px" } : {}}
              >
                <div className="mmd-chat-message-bubble">
                  <p>{msg.content}</p>
                  <span className="mmd-chat-message-time">
                    {formatTime(msg.created_at)}
                    {isOwn && (
                      <i
                        className={`bi ${msg.is_read ? "bi-check-all" : "bi-check"} mmd-chat-read-indicator`}
                        style={{ color: msg.is_read ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}
                      ></i>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        conversationId={conversation.id}
        onMessageSent={onNewMessage}
      />
    </div>
  );
};

export default ChatWindow;
