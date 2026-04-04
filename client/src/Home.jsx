import { Link } from "react-router-dom";
import "./index.css";
import ChatbotWidget from "./ChatbotWidget";

function Home({ user, onLogout }) {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">THE HOSTEL</h1>
        {user ? (
          <div className="nav-links">
            <Link to="/resources" className="nav-link">Resource Sharing</Link>
            {user.role === "caretaker" && (
              <Link to="/apply-fine" className="nav-link">Apply Fine</Link>
            )}
            <span className="user-info">Welcome, {user.name} ({user.hostel})</span>
            <button className="btn-primary" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary">Login</Link>
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