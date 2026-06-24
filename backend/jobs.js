const express = require("express");
const dataService = require("./dataService");

const router  = express.Router();

// ── GET /api/jobs ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, type, search, location } = req.query;
    const jobs = await dataService.getJobs({ category, type, search, location });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    console.error("[GET /api/jobs]", err.message);
    res.status(500).json({ success: false, error: "Failed to load jobs" });
  }
});

// ── GET /api/jobs/:id ─────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const job = await dataService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }
    res.json({ success: true, data: job });
  } catch (err) {
    console.error("[GET /api/jobs/:id]", err.message);
    res.status(500).json({ success: false, error: "Failed to load job" });
  }
});

// ── POST /api/jobs ────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, company, location, type, category, salary, description, requirements, benefits } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const job = await dataService.createJob({
      title,
      company,
      location,
      type,
      category,
      salary,
      description,
      requirements,
      benefits
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error("[POST /api/jobs]", err.message);
    res.status(500).json({ success: false, error: "Failed to post job" });
  }
});

// ── PUT /api/jobs/:id ─────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { title, company, location, type, category, salary, description, requirements, benefits } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const updatedJob = await dataService.updateJob(req.params.id, {
      title,
      company,
      location,
      type,
      category,
      salary,
      description,
      requirements,
      benefits
    });

    if (!updatedJob) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    res.json({ success: true, data: updatedJob });
  } catch (err) {
    console.error("[PUT /api/jobs/:id]", err.message);
    res.status(500).json({ success: false, error: "Failed to update job" });
  }
});

// ── DELETE /api/jobs/:id ──────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const success = await dataService.deleteJob(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/jobs/:id]", err.message);
    res.status(500).json({ success: false, error: "Failed to delete job" });
  }
});

module.exports = router;
