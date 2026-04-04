import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import ResourceSharing from "./ResourceSharing";
import RequestForm from "./RequestForm";
import ResponseSharing from "./ResponseSharing";
import ApplyFine from "./ApplyFine";
import FineList from "./FineList";
import LostandFound from "./LostandFound.jsx";
import Lost from "./Lost.jsx";
import Found from "./Found.jsx";
import LostFoundPost from "./LostFoundPost.jsx";
import LostFoundDetail from "./LostFoundDetail.jsx";
import Profile from "./Profile.jsx";
import Attendance from "./Attendance.jsx";
import AttendanceList from "./AttendanceList.jsx";
import Complaint from "./Complaint.jsx";
import ComplaintList from "./ComplaintList.jsx";
import GuestRoomBooking from "./GuestRoomBooking.jsx";
import GuestRoomBookingsList from "./GuestRoomBookingsList.jsx";

function CaretakerRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "caretaker") {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

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
        <Route path="/profile/:username" element={<Profile user={user} />} />
        <Route path="/attendance" element={<Attendance user={user} />} />
        <Route path="/attendance/today" element={<AttendanceList user={user} />} />
        <Route path="/complaints" element={<Complaint user={user} />} />
        <Route path="/complaints/list" element={<ComplaintList user={user} />} />
        <Route path="/resources" element={<ResourceSharing user={user} />} />
        <Route path="/resources/:mode" element={<ResourceSharing user={user} />} />
        <Route path="/request" element={<RequestForm user={user} fullPage />} />
        <Route path="/response" element={<ResponseSharing user={user} />} />
        <Route
          path="/apply-fine"
          element={
            <CaretakerRoute user={user}>
              <ApplyFine user={user} />
            </CaretakerRoute>
          }
        />
        <Route
          path="/fine-list"
          element={
            <CaretakerRoute user={user}>
              <FineList user={user} />
            </CaretakerRoute>
          }
        />
        {/* Guest Room Routes */}
        <Route path="/guest-room/book" element={<GuestRoomBooking user={user} />} />
        <Route path="/guest-room/my-bookings" element={<GuestRoomBookingsList user={user} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />}/>
        <Route path="/login" element={<Login onLogin={handleLogin} />}/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;