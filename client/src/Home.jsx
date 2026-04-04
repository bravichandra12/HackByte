import { Link } from "react-router-dom";
import "./index.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ChatbotWidget from "./ChatbotWidget";

function Home({ user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/notifications/${user.id}`
      );
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/read/${user.id}`
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">THE HOSTEL</h1>
        {user ? (
          <div className="nav-links">
            <div
              className="notification-container"
              ref={notificationRef}
              onClick={() => {
                setShowDropdown(!showDropdown);
                markAsRead();
              }}
            >
              🔔
              {notifications.some((n) => !n.is_read) && (
                <span className="notification-dot"></span>
              )}
              {showDropdown && (
                <div className="notification-dropdown">
                  <h4>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    notifications.map((n) => {
                      const cleanedMessage = n.message
                        ?.replace(/^user_\d+\s*/i, "")
                        .replace(/\s+Pickup:/, "\nPickup:");

                      return (
                      <div
                        key={n.id}
                        className="notification-item"
                        style={{
                          fontWeight: n.is_read ? "normal" : "bold",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {cleanedMessage}
                      </div>
                    );
                    })
                  )}
                </div>
              )}
            </div>
            <Link to="/resources" className="nav-link">Resource Sharing</Link>
            {user.role === "caretaker" && (
              <div className="dropdown">
                <span className="nav-link">Fines ▾</span>
                <div className="dropdown-content">
                  <Link to="/apply-fine" className="dropdown-item">
                    Apply Fine
                  </Link>
                  <Link to="/fine-list" className="dropdown-item">
                    Fine List
                  </Link>
                </div>
              </div>
            )}
            <span className="user-info">Welcome, {user.name} ({user.hostel})</span>
            <button className="btn-primary nav-auth-button" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary nav-auth-button">Login</Link>
        )}
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h2 className="hero-title">Welcome, {user?user.name:"User"}!</h2>
        {user && (
          <p className="hero-subtitle">
            Access resource sharing to help your fellow hostel mates
          </p>
        )}
        {user?.role === "caretaker" && (
          <div className="hero-actions">
            <Link to="/attendance/today" className="btn-primary">
              See todays attendance list
            </Link>
            <Link to="/complaints/list" className="btn-primary">
              View complaints
            </Link>
            <Link to="/guest-room/my-bookings" className="btn-primary">
              Guest room booking list
            </Link>
          </div>
        )}
      </div>

      <ChatbotWidget
        ariaLabel="Home chatbot"
        panelTitle="Chatbot"
        initialAssistantMessage="Hi, ask me about hostels, wardens, entry/exit times, and facilities."
        inputPlaceholder="Ask your question"
        toggleClassName="home-chat-toggle"
        panelClassName="home-chat-panel"
        headerClassName="home-chat-header"
        messagesClassName="home-chat-messages"
        bubbleClassName="home-chat-bubble"
        statusClassName="home-chat-status"
        errorClassName="home-chat-error"
        inputRowClassName="home-chat-input-row"
        inputClassName=""
        sendButtonClassName="btn-primary"
      />
    </div>
  );
}

export default Home;