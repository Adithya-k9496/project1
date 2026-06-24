require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");
const path       = require("path");
const jobRoutes  = require("./jobs");
const authRoutes = require("./auth");
const applicationRoutes = require("./applications");

const app  = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ── Conditionally Connect to MongoDB Atlas or run in Local Mode ──
if (!MONGODB_URI) {
  console.log("⚠️  MONGODB_URI is not defined in environment variables.");
  console.log("📂 Running server in LOCAL MODE using local JSON storage.");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Connected successfully to MongoDB Atlas"))
    .catch(err => {
      console.error("❌ Failed to connect to MongoDB Atlas:", err.message);
      console.log("📂 Falling back to LOCAL MODE using local JSON storage.");
    });
}

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));   
app.use(express.json());                              
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ───────────────────────────────────────────────────
app.use("/api/jobs", jobRoutes);    
app.use("/api/auth", authRoutes);   
app.use("/api/applications", applicationRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "Job Portal API running",
    version: "1.0.0",
    endpoints: {
      jobs:     "GET  /api/jobs",
      postJob:  "POST /api/jobs",
      login:    "POST /api/auth/login",
      register: "POST /api/auth/register",
    },
  });
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Job Portal API running at http://localhost:${PORT}`);
});
