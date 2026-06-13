import { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/authContext";

const ROLE_LABELS = {
  medecin: "Dr.",
  secretaire: "Sec.",
  patient: "",
};

const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  loading,
}) => {
  const { user } = useContext(AuthContext);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="mmd-conversation-list">
      <div className="mmd-conv-list-header">
        <h3>Messages</h3>
        {conversations.length > 0 && (
          <span className="mmd-conv-list-header-badge">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="mmd-conv-search">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mmd-conv-search-input"
        />
      </div>

      <div className="mmd-conv-list-items">
        {loading ? (
          <div className="mmd-conv-loading">
            <div className="mmd-loading-spinner" />
            <p>Chargement...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="mmd-conv-empty">
            <i className="bi bi-chat-dots"></i>
            <p>Aucune conversation</p>
            <span className="mmd-conv-empty-hint">
              Les conversations apparaîtront ici
            </span>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === selectedId;
            const otherUser = conv.other_user;
            const lastMsg = conv.last_message;
            const prefix = ROLE_LABELS[otherUser?.user_type] || "";

            return (
              <button
                key={conv.id}
                className={`mmd-conv-item ${isSelected ? "mmd-conv-item--active" : ""}`}
                onClick={() => onSelect(conv.id)}
              >
                <div className="mmd-conv-avatar">
                    {`${otherUser?.prenom?.charAt(0) || ""}${otherUser?.nom?.charAt(0) || ""}`.toUpperCase() || "?"}
                    </div>
                <div className="mmd-conv-info">
                  <div className="mmd-conv-name-row">
                    <span className="mmd-conv-name">
                      {prefix ? `${prefix} ` : ""}
                      {otherUser?.prenom || ""} {otherUser?.nom || ""}
                    </span>
                    <span className="mmd-conv-time">
                      {formatTime(lastMsg?.created_at)}
                    </span>
                  </div>
                  <div className="mmd-conv-preview-row">
                    <span className="mmd-conv-preview">
                      {lastMsg?.content || "Aucun message"}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="mmd-conv-unread-badge">
                        {conv.unread_count > 99 ? "99+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
