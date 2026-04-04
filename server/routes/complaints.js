import express from "express";
import pool from "../db.js";

const router = express.Router();

const VALID_TYPES = new Set([
  "electrical",
  "plumbing",
  "lan",
  "carpenter",
  "cleaning",
  "insects",
  "others",
]);

router.post("/", async (req, res) => {
  try {
    const { userId, complaintType, description, location } = req.body;

    if (!userId || !complaintType || !description || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const normalizedType = String(complaintType || "").toLowerCase();
    if (!VALID_TYPES.has(normalizedType)) {
      return res.status(400).json({ error: "Invalid complaint type" });
    }

    const userResult = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [userId]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userResult.rows[0].role !== "student") {
      return res.status(403).json({ error: "Only students can submit complaints" });
    }

    const insert = `
      INSERT INTO complaints (user_id, complaint_type, description, location)
      VALUES ($1, $2, $3, $4)
      RETURNING id, complaint_type, description, location, status, created_at
    `;

    const values = [
      userId,
      normalizedType,
      String(description).trim(),
      String(location).trim(),
    ];

    const { rows } = await pool.query(insert, values);
    return res.status(201).json({ success: true, complaint: rows[0] });
  } catch (error) {
    console.error("Complaint create error", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const caretakerId = Number(req.query.userId);
    if (!caretakerId) {
      return res.status(400).json({ error: "Caretaker userId is required" });
    }

    const caretakerResult = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [caretakerId]
    );

    if (!caretakerResult.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    if (caretakerResult.rows[0].role !== "caretaker") {
      return res.status(403).json({ error: "Only caretakers can view complaints" });
    }

    const { rows } = await pool.query(
      `SELECT c.id,
              c.complaint_type,
              c.description,
              c.location,
              c.status,
              c.created_at,
              u.name AS student_name,
              u.hostel
       FROM complaints c
       JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at DESC`
    );

    return res.json({ success: true, complaints: rows });
  } catch (error) {
    console.error("Complaint list error", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.use((req, res) => {
  res.status(404).json({ error: "Complaints route not found" });
});

export default router;
