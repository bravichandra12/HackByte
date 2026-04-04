import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import RequestForm from "./RequestForm";
import ResponseSharing from "./ResponseSharing";
import "./LostFound.css";
import "./ResourceSharing.css";

function ResourceSharing({ user }) {
  const { mode } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [userNameMap, setUserNameMap] = useState({});

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

  useEffect(() => {
    const loadUsernames = async () => {
      const ids = new Set();
      notifications.forEach((notification) => {
        const firstLine = (notification.message || "").split("\n")[0];
        const match = firstLine.match(/^user_(\d+)\s+.+?\s+has what you requested\.$/);
        if (match) {
          ids.add(match[1]);
        }
      });

      const idsToFetch = Array.from(ids).filter((id) => !userNameMap[id]);
      if (!idsToFetch.length) {
        return;
      }

      try {
        const results = await Promise.all(
          idsToFetch.map((id) => axios.get(`http://localhost:5000/api/auth/users/${id}`))
        );

        const nextMap = { ...userNameMap };
        results.forEach((res) => {
          const userData = res.data?.user;
          if (!userData?.id) return;
          const username = String(userData.email || "").split("@")[0] || String(userData.id);
          nextMap[String(userData.id)] = username;
        });
        setUserNameMap(nextMap);
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      }
    };

    if (notifications.length) {
      loadUsernames();
    }
  }, [notifications, userNameMap]);

  if (!user) {
    return (
      <div className="lf-page rs-page">
        <div className="lf-shell rs-shell">
          <header className="lf-header">
            <p className="lf-eyebrow">Resource Sharing</p>
            <h1 className="lf-title">Please login to continue</h1>
            <p className="lf-subtitle">Sign in to request or respond to resources.</p>
          </header>
          <Link to="/login" className="lf-button">
            Go to Login
          </Link>
        </div>
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
    <div className="lf-page rs-page">
      <div className="lf-shell rs-shell">
        <header className="lf-header">
          <p className="lf-eyebrow">Resource Sharing</p>
          <h1 className="lf-title">Find help or lend a hand</h1>
          <p className="lf-subtitle">Choose a flow to request a resource or respond to others.</p>
        </header>

        <section className="lf-buttons">
          <div className="lf-card">
            <h3>Request</h3>
            <p>Ask for a resource you need right now.</p>
            <Link to="/resources/request" className="lf-button">
              Request
            </Link>
          </div>
          <div className="lf-card">
            <h3>Response</h3>
            <p>Offer a resource to someone who needs it.</p>
            <Link to="/resources/response" className="lf-button">
              Response
            </Link>
          </div>
        </section>

        <section className="lf-toolbar">
          <div className="lf-post">
            <p>Notifications</p>
          </div>
          <div className="lf-list">
            {notifications.length === 0 ? (
              <p className="lf-empty">No accepted responses yet.</p>
            ) : (
              notifications.map((notification) => {
                const firstLine = (notification.message || "").split("\n")[0];
                const match = firstLine.match(/^user_(\d+)\s+(.+?)\s+has what you requested\.$/);
                let displayMessage = notification.message;

                if (match) {
                  const [, userId, userName] = match;
                  const username = userNameMap[userId] || userId;
                  displayMessage = (
                    <span>
                      <Link className="lf-user-link" to={`/profile/${username}`}>
                        {userName}
                      </Link>
                      {" has what you requested."}
                    </span>
                  );
                }

                const parts = (notification.message || "").split("\n");

                return (
                  <article key={notification.id} className="lf-item">
                    <p>{displayMessage}</p>
                    {parts[1] && <p className="lf-user">{parts[1]}</p>}
                    <p className="lf-user">{new Date(notification.created_at).toLocaleString()}</p>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResourceSharing;