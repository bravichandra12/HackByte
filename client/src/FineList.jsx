import { useEffect, useState } from "react";
import axios from "axios";

function FineList({ user }) {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/fines/caretaker/${user.id}`
        );
        setFines(res.data.fines);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchFines();
  }, [user]);

  const markAsPaid = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/fines/${id}/mark-paid`
      );

      // ✅ remove from UI instantly
      setFines((prev) => prev.filter((f) => f.id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={{ marginTop: "100px", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Fine List</h2>

      {fines.length === 0 ? (
        <p style={{ textAlign: "center" }}>No unpaid fines 🎉</p>
      ) : (
        fines.map((fine) => (
          <div
            key={fine.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              margin: "10px auto",
              maxWidth: "600px",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <p><strong>Student:</strong> {fine.student_email.split("@")[0]}</p>
            <p><strong>Description:</strong> {fine.description}</p>
            <p><strong>Amount:</strong> ₹{fine.amount}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                Unpaid
              </span>
            </p>

            {/* 🔥 BUTTON */}
            <button
              onClick={() => markAsPaid(fine.id)}
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                backgroundColor: "green",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Mark as Paid
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default FineList;