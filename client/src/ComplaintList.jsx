import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./LostFound.css";
import "./Complaint.css";

function ComplaintList({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null });
  const [activeType, setActiveType] = useState("all");

  const filteredComplaints = complaints.filter((complaint) => {
    if (activeType === "all") return true;
    return String(complaint.complaint_type || "").toLowerCase() === activeType;
  });

  const formatType = (value) => {
    const label = String(value || "").toLowerCase();
    if (!label) return "Unknown";
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  useEffect(() => {
    if (!user || user.role !== "caretaker") {
      return;
    }

    const loadComplaints = async () => {
      setStatus({ loading: true, error: null });
      try {
        const response = await fetch(
          `http://localhost:5000/api/complaints?userId=${user.id}`
        );
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Complaints API returned non-JSON response.");
        }
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Unable to fetch complaints");
        }
        setComplaints(Array.isArray(result.complaints) ? result.complaints : []);
      } catch (err) {
        setStatus({ loading: false, error: err.message });
        return;
      }

      setStatus({ loading: false, error: null });
    };

    loadComplaints();
  }, [user]);

  if (!user) {
    return (
      <div className="lf-page">
        <div className="lf-shell">
          <div className="lf-card">
            <h2>Complaints</h2>
            <p>Please log in to view complaints.</p>
            <Link to="/login" className="lf-button">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "caretaker") {
    return (
      <div className="lf-page">
        <div className="lf-shell">
          <div className="lf-card">
            <h2>Access Restricted</h2>
            <p>This page is only available to caretakers.</p>
            <Link to="/" className="lf-button">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lf-page">
      <div className="lf-shell">
        <header className="lf-header">
          <p className="lf-eyebrow">Caretaker Portal</p>
          <h1 className="lf-title">Complaints</h1>
          <p className="lf-subtitle">Review all complaints submitted by students.</p>
        </header>

        {status.loading && <p>Loading complaints...</p>}
        {status.error && <p className="lf-error">{status.error}</p>}

        {!status.loading && !status.error && complaints.length === 0 && (
          <p>No complaints yet.</p>
        )}

        {!status.loading && !status.error && complaints.length > 0 && (
          <div className="lf-search complaint-filter">
            <label htmlFor="complaint-type-filter">Filter</label>
            <select
              id="complaint-type-filter"
              value={activeType}
              onChange={(event) => setActiveType(event.target.value)}
            >
              <option value="all">All types</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="lan">LAN</option>
              <option value="carpenter">Carpenter</option>
              <option value="cleaning">Cleaning</option>
              <option value="insects">Insects</option>
              <option value="others">Others</option>
            </select>
          </div>
        )}

        {!status.loading && !status.error && filteredComplaints.length === 0 && complaints.length > 0 && (
          <p>No complaints for this category.</p>
        )}

        {!status.loading && !status.error && filteredComplaints.length > 0 && (
          <div className="lf-list">
            {filteredComplaints.map((complaint) => {
              const createdAt = complaint.created_at
                ? new Date(complaint.created_at).toLocaleString()
                : "";
              return (
                <article key={complaint.id} className="lf-item">
                  <div className="lf-item-top">
                    <h4>{complaint.student_name || "Student"}</h4>
                    <span className="complaint-badge">{formatType(complaint.complaint_type)}</span>
                  </div>
                  <p>{complaint.description}</p>
                  <div className="lf-meta">
                    <span>{complaint.location}</span>
                    <span>{complaint.hostel}</span>
                    <span>{createdAt}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Link to="/" className="lf-button secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default ComplaintList;
