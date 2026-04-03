import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import LostandFound from "./LostandFound.jsx";
import Lost from "./Lost.jsx";
import Found from "./Found.jsx";
import LostFoundPost from "./LostFoundPost.jsx";
import LostFoundDetail from "./LostFoundDetail.jsx";
import Profile from "./Profile.jsx";
import Attendance from "./Attendance.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />}/>
        <Route path="/lost-found" element={<LostandFound />} />
        <Route path="/lost-found/lost" element={<Lost />} />
        <Route path="/lost-found/found" element={<Found />} />
        <Route path="/lost-found/post/:type" element={<LostFoundPost />} />
        <Route path="/lost-found/item/:id" element={<LostFoundDetail />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/attendance" element={<Attendance user={user} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />}/>
        <Route path="/login" element={<Login onLogin={handleLogin} />}/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;