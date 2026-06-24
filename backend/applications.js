const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dataService = require("./dataService");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "jobportal_secret_key_2026";

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure Multer Filter (PDF only)
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Access denied. Login required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ success: false, error: "Invalid or expired token." });
  }
}

// ── POST /api/applications ───────────────────────────────────
// Job seekers submit their application with resume PDF upload
router.post("/", verifyToken, (req, res) => {
  upload.single("resume")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Multer upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      const { jobId, seekerName, seekerEmail, seekerPhone } = req.body;

      if (!jobId || !seekerName || !seekerEmail || !seekerPhone) {
        return res.status(400).json({ success: false, error: "All candidate details are required." });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: "Please upload your resume PDF." });
      }

      // Find job to extract jobTitle and company details
      const job = await dataService.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: "Job not found." });
      }

      const application = await dataService.createApplication({
        jobId,
        jobTitle: job.title,
        company: job.company,
        seekerName,
        seekerEmail: seekerEmail.toLowerCase(),
        seekerPhone,
        resumePath: `/uploads/${req.file.filename}`,
      });

      res.status(201).json({
        success: true,
        message: "Application submitted successfully!",
        data: application,
      });
    } catch (dbErr) {
      console.error("[POST /api/applications]", dbErr.message);
      res.status(500).json({ success: false, error: "Failed to save application details." });
    }
  });
});

// ── GET /api/applications ────────────────────────────────────
// Employers view all submitted job applications
router.get("/", verifyToken, async (req, res) => {
  try {
    // Check if the user is indeed an employer
    if (req.user.role !== "employer") {
      return res.status(403).json({ success: false, error: "Access denied. Employer dashboard access only." });
    }

    const applications = await dataService.getApplications();
    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    console.error("[GET /api/applications]", err.message);
    res.status(500).json({ success: false, error: "Failed to retrieve applications." });
  }
});

// ── PUT /api/applications/:id/status ─────────────────────────
// Update application status (Approve / Suspend / Accept / Reject)
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ success: false, error: "Access denied. Employer role required." });
    }

    const { status } = req.body;
    if (!["Pending", "Approved", "Suspended"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value." });
    }

    const updated = await dataService.updateApplicationStatus(req.params.id, status);

    if (!updated) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("[PUT /api/applications/:id/status]", err.message);
    res.status(500).json({ success: false, error: "Failed to update application status." });
  }
});

// ── DELETE /api/applications/:id ──────────────────────────────
// Delete the application/notification record (Employer or candidate seeker)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const application = await dataService.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: "Notification not found." });
    }

    const isSeeker = req.user.role === "jobseeker" && application.seekerEmail === req.user.email.toLowerCase();
    const isEmployer = req.user.role === "employer";

    if (!isSeeker && !isEmployer) {
      return res.status(403).json({ success: false, error: "Access denied. Unauthorized to delete this notification." });
    }

    await dataService.deleteApplication(req.params.id);
    res.json({ success: true, message: "Notification deleted successfully." });
  } catch (err) {
    console.error("[DELETE /api/applications/:id]", err.message);
    res.status(500).json({ success: false, error: "Failed to delete notification." });
  }
});

// ── GET /api/applications/seeker ──────────────────────────────
// Fetch seeker applications/notifications
router.get("/seeker", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ success: false, error: "Access denied. Jobseeker role required." });
    }

    const seekerEmail = req.user.email.toLowerCase();
    const applications = await dataService.getApplicationsBySeeker(seekerEmail);

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    console.error("[GET /api/applications/seeker]", err.message);
    res.status(500).json({ success: false, error: "Failed to retrieve seeker notifications." });
  }
});

// ── PUT /api/applications/seeker/read ──────────────────────────
// Mark seeker notifications as read
router.put("/seeker/read", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ success: false, error: "Access denied. Jobseeker role required." });
    }

    const seekerEmail = req.user.email.toLowerCase();
    await dataService.markApplicationsAsRead(seekerEmail);

    res.json({ success: true, message: "Notifications marked as read." });
  } catch (err) {
    console.error("[PUT /api/applications/seeker/read]", err.message);
    res.status(500).json({ success: false, error: "Failed to mark notifications as read." });
  }
});

module.exports = router;
