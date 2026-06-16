import { createContext, useState, useEffect, useCallback, useContext, useRef } from "react";
import api from "../api/axios";
import { AuthContext } from "./authContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pollingRef = useRef(null);
  const echoRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/messages/unread-count");
      setUnreadCount(res.data.data?.count ?? 0);
    } catch (err) {
      // silently fail
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/messages/notifications");
      setNotifications(res.data.data ?? []);
    } catch (err) {
      // silently fail
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchUnreadCount(), fetchNotifications()]);
  }, [fetchUnreadCount, fetchNotifications]);

  // Set up Echo real-time listener
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    refreshAll();
    pollingRef.current = setInterval(refreshAll, 15000);

    const initEcho = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { initEcho: createEcho, destroyEcho } = await import("../echo");
        destroyEcho();

        const echo = createEcho(token);
        if (!echo) return; // initialization failed
        echoRef.current = echo;

        const channel = echo.private(`user.${user.id}`);
        channel.listen(".new-message", (e) => {
          const { message } = e;
          if (message) {
            // Increment unread count
            setUnreadCount((prev) => prev + 1);
            // Add notification to list
            setNotifications((prev) => [
              {
                id: message.id,
                conversation_id: message.conversation_id,
                sender_name: message.sender_name,
                sender_role: message.sender_type,
                preview: message.content?.substring(0, 60),
                created_at: message.created_at,
                time_ago: "À l'instant",
              },
              ...prev,
            ].slice(0, 20));
          }
        });
      } catch (err) {
        // WebSocket not available - polling fallback works fine
      }
    };

    initEcho();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (echoRef.current) {
        try {
          echoRef.current.leave(`user.${user.id}`);
        } catch (err) {
          // ignore
        }
      }
    };
  }, [user, refreshAll]);

  const openDropdown = useCallback(() => {
    setDropdownOpen(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => {
      if (!prev) fetchNotifications();
      return !prev;
    });
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await api.put(`/conversations/${conversationId}/read`);
      setNotifications((prev) =>
        prev.filter((n) => n.conversation_id !== conversationId)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // silently fail
    }
  }, []);

  const decrementUnread = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        dropdownOpen,
        openDropdown,
        closeDropdown,
        toggleDropdown,
        refreshAll,
        fetchUnreadCount,
        fetchNotifications,
        markAsRead,
        decrementUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
