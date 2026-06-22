const express = require("express");
const Job     = require("./models/Job");

const router  = express.Router();

// ── GET /api/jobs ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, type, search, location } = req.query;
    const filterQuery = {};

    if (category && category !== "All") {
      filterQuery.category = category;
    }
    if (type && type !== "All") {
      filterQuery.type = type;
    }
    if (location) {
      filterQuery.location = { $regex: location, $options: "i" };
    }
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }

    const jobs = await Job.find(filterQuery);

    // Map Mongoose _id to virtual id for frontend compatibility
    const formattedJobs = jobs.map(j => {
      const obj = j.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    res.json({ success: true, count: formattedJobs.length, data: formattedJobs });
  } catch (err) {
    console.error("[GET /api/jobs]", err.message);
    res.status(500).json({ success: false, error: "Failed to load jobs" });
  }
});

// ── GET /api/jobs/:id ─────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    const obj = job.toObject();
    obj.id = obj._id.toString();

    res.json({ success: true, data: obj });
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

    const newJob = new Job({
      title,
      company,
      location,
      type:         type         || "Full-time",
      category:     category     || "Technology",
      salary:       salary       || "Negotiable",
      logo:         company.slice(0, 2).toUpperCase(),
      color:        "#6C63FF",
      description,
      requirements: (Array.isArray(requirements) && requirements.length > 0) ? requirements : ["See job description"],
      benefits:     (Array.isArray(benefits) && benefits.length > 0) ? benefits : ["Competitive package"]
    });

    await newJob.save();

    const obj = newJob.toObject();
    obj.id = obj._id.toString();

    res.status(201).json({ success: true, data: obj });
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

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        company,
        location,
        type: type || "Full-time",
        category: category || "Technology",
        salary: salary || "Negotiable",
        description,
        ...(requirements ? { requirements } : {}),
        ...(benefits ? { benefits } : {}),
      },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    const obj = updatedJob.toObject();
    obj.id = obj._id.toString();

    res.json({ success: true, data: obj });
  } catch (err) {
    console.error("[PUT /api/jobs/:id]", err.message);
    res.status(500).json({ success: false, error: "Failed to update job" });
  }
});

// ── DELETE /api/jobs/:id ──────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/jobs/:id]", err.message);
    res.status(500).json({ success: false, error: "Failed to delete job" });
  }
});

module.exports = router;
