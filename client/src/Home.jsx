import { Link } from "react-router-dom";
import "./index.css";

function Home({ user, onLogout }) {
  console.log('User object:', user);
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">THE HOSTEL</h1>
        {user ? (
          <button className="btn-primary" onClick={onLogout}>Logout</button>
        ) : (
          <Link to="/login" className="btn-primary">Login</Link>
        )}
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h2 className="hero-title">Welcome, {user?user.name:"User"}!</h2>
      </div>
    </div>
  );
}

export default Home;