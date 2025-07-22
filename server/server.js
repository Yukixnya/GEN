// server.js - Final Clean Version
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// --- Basic Setup ---
dotenv.config();
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// --- Database Connection ---
// This requires the MONGO_URI from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Database Schema ---
// Defines the structure of the documents in our "explanations" collection
const explanationSchema = new mongoose.Schema({
  term: String,
  language: String,
  level: String,
  length: String,
  explanation: String
}, { timestamps: true });

const Explanation = mongoose.model("Explanation", explanationSchema);


// --- API Routes ---
// All routes that handle data must come before the frontend routes.

// GET route to fetch all entries
app.get("/api/entries", async (req, res) => {
  try {
    const allEntries = await Explanation.find({}).sort({ createdAt: -1 });
    res.status(200).json(allEntries);
  } catch (err) {
    res.status(500).json({ message: "Could not retrieve data." });
  }
});

// POST route to save a new entry
app.post("/api/add-entry", async (req, res) => {
  try {
    const newEntry = new Explanation(req.body);
    await newEntry.save();
    res.status(201).json({ message: "Entry saved successfully!" });
  } catch (err) {
    console.error("Error saving entry:", err);
    res.status(500).json({ message: "Error saving to database." });
  }
});


// --- Serve Frontend ---
// This section serves your index.html file and other static assets.

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// A catch-all route to send index.html for any other request.
// This is important for single-page applications.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
