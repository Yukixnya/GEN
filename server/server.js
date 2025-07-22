// server.js - Final Version with Update and Delete
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

// --- Basic Setup ---
dotenv.config();
const app = express();
app.use(express.json());

// --- Database Connection ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ FATAL ERROR: MONGO_URI is not defined in your .env file.");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Database Schema ---
const explanationSchema = new mongoose.Schema({
  term: String,
  language: String,
  level: String,
  length: String,
  explanation: String
}, { timestamps: true });

const Explanation = mongoose.model("Explanation", explanationSchema);

// --- API Routes ---

// GET all entries
app.get("/api/entries", async (req, res) => {
  try {
    const allEntries = await Explanation.find({}).sort({ createdAt: -1 });
    res.status(200).json(allEntries);
  } catch (err) {
    res.status(500).json({ message: "Could not retrieve data." });
  }
});

// GET a single entry by ID (useful for populating the edit form)
app.get("/api/entries/:id", async (req, res) => {
    try {
        const entry = await Explanation.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: "Entry not found" });
        res.status(200).json(entry);
    } catch (err) {
        res.status(500).json({ message: "Could not retrieve single entry." });
    }
});

// POST a new entry
app.post("/api/add-entry", async (req, res) => {
  try {
    const newEntry = new Explanation(req.body);
    await newEntry.save();
    res.status(201).json({ message: "Entry saved successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving to database." });
  }
});

// PUT (Update) an existing entry by its ID
app.put("/api/entries/:id", async (req, res) => {
    try {
        const updatedEntry = await Explanation.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // {new: true} returns the updated document
        );
        if (!updatedEntry) {
            return res.status(404).json({ message: "Entry not found to update." });
        }
        res.status(200).json({ message: "Entry updated successfully!", entry: updatedEntry });
    } catch (err) {
        res.status(500).json({ message: "Error updating entry." });
    }
});

// DELETE an entry by its ID
app.delete("/api/entries/:id", async (req, res) => {
    try {
        const deletedEntry = await Explanation.findByIdAndDelete(req.params.id);
        if (!deletedEntry) {
            return res.status(404).json({ message: "Entry not found to delete." });
        }
        res.status(200).json({ message: "Entry deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting entry." });
    }
});


// --- Serve Frontend ---
app.use(express.static(path.join(__dirname, 'public')));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
