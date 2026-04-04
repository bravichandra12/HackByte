import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import RequestForm from "./RequestForm";
import ResponseSharing from "./ResponseSharing";
import "./index.css";

function ResourceSharing({ user }) {
  const { mode } = useParams();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/requests/notifications/${user.id}`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user && !mode) {
      fetchNotifications();
      // Auto-refresh notifications every 5 seconds
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user, mode, fetchNotifications]);

  if (!user) {
    return (
      <div className="resource-sharing" style={{ marginTop: "120px", textAlign: "center", color: "#fff" }}>
        <h2>Please login to use Resource Sharing</h2>
        <p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </p>
      </div>
    );
  }

  if (mode === "request") {
    return <RequestForm user={user} fullPage />;
  }

  if (mode === "response") {
    return <ResponseSharing user={user} onNotificationUpdate={fetchNotifications} />;
  }

  return (
    <div className="resource-selection-page">
      <div className="resource-selection-card">
        <h1>Resource Sharing</h1>
        <p>Select an option</p>
        <div className="resource-buttons">
          <Link to="/resources/request" className="btn-primary large">
            Request
          </Link>
          <Link to="/resources/response" className="btn-primary large">
            Response
          </Link>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="notifications-section" style={{ marginTop: '30px', textAlign: 'left' }}>
            <h3 style={{ color: '#ffd700', fontSize: '1.3rem', marginBottom: '15px' }}>Notifications</h3>
            <div className="notifications-list" style={{ display: 'grid', gap: '10px' }}>
              {notifications.map(notification => {
                // Parse the message to extract user ID and name for request_fulfilled
               const firstLine = (notification.message || "").split("\n")[0];

const match = firstLine.match(
  /^user_(\d+)\s+(.+?)\s+has what you requested\.$/
);
                let displayMessage = notification.message;
                
                if (match) {
                  const [, userId, userName] = match;
                  displayMessage = (
                    <span>
                      <Link 
                        to={`/profile/${userId}`}
                        className="notification-user-link" 
                        style={{ color: '#8b5cf6', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {userName}
                      </Link>
                      {' has what you requested.'}
                    </span>
                  );
                }

                return (
                  <div key={notification.id} className={`notification ${notification.is_read ? 'read' : 'unread'}`} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.9rem'
                  }}>
                    {(() => {
 const parts = (notification.message || "").split("\n");

  return (
    <>
      <p style={{ margin: '0 0 5px', color: '#e2e8f0' }}>
        {displayMessage}
      </p>

      {parts[1] && (
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
          {parts[1]}
        </p>
      )}
    </>
  );
})()}
                    <small style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(notification.created_at).toLocaleString()}</small>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceSharing;