-- PostgreSQL schema for HackByte user registration
-- Run this in pgAdmin (or psql) as a superuser to create the database + role

-- 0. Create database + role (run in postgres DB or pgAdmin Query Tool)
CREATE DATABASE hackbyte;

CREATE ROLE hackbyte_user LOGIN PASSWORD 'ChangeThisPassword';
GRANT ALL PRIVILEGES ON DATABASE hackbyte TO hackbyte_user;

\c hackbyte;  -- reconnect to the new database (psql syntax)

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'caretaker')),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  hostel VARCHAR(50) NOT NULL CHECK (hostel IN ('H4', 'H3', 'H1', 'Panini', 'Ma Saraswati')),
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Simple test data
INSERT INTO users (role, email, password_hash, name, hostel, phone)
VALUES
  ('student', 'alice@college.edu', '$2b$10$/lNP/CUx78RoDMoBFmWqbeji9CcfPhbSNjTWdWJFnDGKpf7pPgNli', 'Alice Johnson', 'H4', '9876543210'),
  ('caretaker', 'bob@college.edu', '$2b$10$7cgXdP8iYcl16emzp5hMq.QPX/Fmp7r10TrlD8pyXvesNF64359YC', 'Bob Verma', 'Ma Saraswati', '9123456780')
ON CONFLICT DO NOTHING;

-- 3. Query for validation
SELECT * FROM users ORDER BY created_at DESC;

-- 4. Lost and found items
CREATE TABLE IF NOT EXISTS lost_found_items (
  id SERIAL PRIMARY KEY,
  item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('lost', 'found')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  hostel VARCHAR(50) NOT NULL,
  location VARCHAR(200),
  contact_phone VARCHAR(20),
  image_url TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  claimed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  claim_proof_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Attendance tracking
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  attended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Attendance OTPs (short-lived)
CREATE TABLE IF NOT EXISTS attendance_otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Lost/found queries
-- Create a post (lost or found) - example
INSERT INTO lost_found_items
  (item_type, title, description, hostel, location, user_id, contact_phone, image_url)
VALUES
  ('lost', 'Blue Water Bottle', 'Steel bottle with stickers', 'H4', 'Hostel lobby', 1, '9876543210', NULL)
RETURNING id;

-- Display found posts (for Lost page)
SELECT lfi.*, u.name AS user_name
FROM lost_found_items lfi
LEFT JOIN users u ON u.id = lfi.user_id
WHERE lfi.item_type = 'found'
ORDER BY lfi.created_at DESC;

-- Display lost posts (for Found page)
SELECT lfi.*, u.name AS user_name
FROM lost_found_items lfi
LEFT JOIN users u ON u.id = lfi.user_id
WHERE lfi.item_type = 'lost'
ORDER BY lfi.created_at DESC;
