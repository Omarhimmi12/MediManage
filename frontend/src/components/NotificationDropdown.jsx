import { useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/notificationContext";

const ROLE_LABELS = {
  medecin: "Médecin",
  secretaire: "Secrétaire",
  patient: "Patient",
};

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleClick = async (notification) => {
    if (notification.conversation_id) {
      await markAsRead(notification.conversation_id);
    }
    navigate("/messages", {
      state: { selectedConversationId: notification.conversation_id },
    });
    onClose?.();
  };

  if (notifications.length === 0) {
    return (
      <div className="mmd-notif-dropdown" ref={dropdownRef}>
        <div className="mmd-notif-header">
          <h4>Notifications</h4>
        </div>
        <div className="mmd-notif-empty">
          <i className="bi bi-check-all"></i>
          <p>Aucune nouvelle notification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mmd-notif-dropdown" ref={dropdownRef}>
      <div className="mmd-notif-header">
        <h4>Notifications</h4>
        <span className="mmd-notif-count">{notifications.length} non lue(s)</span>
      </div>
      <div className="mmd-notif-list">
        {notifications.map((notif) => (
          <button
            key={notif.id}
            className="mmd-notif-item"
            onClick={() => handleClick(notif)}
          >
            <div className="mmd-notif-avatar">
              {notif.sender_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="mmd-notif-content">
              <div className="mmd-notif-sender">
                <strong>{notif.sender_name}</strong>
                <span className="mmd-notif-role">
                  {ROLE_LABELS[notif.sender_role] || notif.sender_role}
                </span>
              </div>
              <p className="mmd-notif-preview">{notif.preview}</p>
              <span className="mmd-notif-time">{notif.time_ago}</span>
            </div>
            <div className="mmd-notif-unread-dot" />
          </button>
        ))}
      </div>
      <div className="mmd-notif-footer">
        <button
          className="mmd-notif-view-all"
          onClick={() => {
            navigate("/messages");
            onClose?.();
          }}
        >
          Voir tous les messages
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
