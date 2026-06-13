import { useState, useEffect, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/authContext";
import { NotificationContext } from "../../context/notificationContext";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import "./MessagingPage.css";

const MessagingPage = () => {
  const { user } = useContext(AuthContext);
  const { decrementUnread, refreshAll } = useContext(NotificationContext);
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversationData, setConversationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const seedConversations = async () => {
      try {
        await api.post("/conversations/seed");
      } catch (err) {
        // Silently fail - conversations may already exist
      } finally {
        setSeeded(true);
      }
    };
    seedConversations();
  }, []);

  // Handle navigation from notification
  useEffect(() => {
    const preselectedId = location.state?.selectedConversationId;
    if (preselectedId) {
      setSelectedConversationId(preselectedId);
    }
  }, [location.state]);

  const fetchConversations = useCallback(async () => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const res = await api.get("/conversations", { params });
      setConversations(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (seeded) {
      fetchConversations();
    }
  }, [seeded, fetchConversations]);

  // Fetch selected conversation messages
  useEffect(() => {
    if (!selectedConversationId) {
      setConversationData(null);
      setMessages([]);
      return;
    }

    const fetchConversation = async () => {
      try {
        const res = await api.get(`/conversations/${selectedConversationId}`);
        setConversationData(res.data.data);
        setMessages(res.data.data.messages ?? []);
        decrementUnread();
        refreshAll();
      } catch (err) {
        console.error("Failed to fetch conversation", err);
      }
    };

    fetchConversation();
  }, [selectedConversationId, decrementUnread, refreshAll]);

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
  };

  const handleNewMessage = (message) => {
    setMessages((prev) => [...prev, message]);
    // Refresh conversation list to update last message ordering
    fetchConversations();
  };

  return (
    <div className="mmd-messaging-page">
      <div className="mmd-messaging-container">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
        />
        <ChatWindow
          conversation={conversationData}
          messages={messages}
          currentUser={user}
          onNewMessage={handleNewMessage}
        />
      </div>
    </div>
  );
};

export default MessagingPage;
