const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const isLocalMode = !process.env.MONGODB_URI;

// ── File Paths for Local Storage ──────────────────────────────
const DATA_DIR = path.join(__dirname, "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs_local.json");
const USERS_FILE = path.join(DATA_DIR, "users_local.json");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications_local.json");
const XML_PATH = path.join(__dirname, "jobs.xml");

// ── In-Memory / File helpers ─────────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function initializeLocalJobs() {
  ensureDataDir();
  if (fs.existsSync(JOBS_FILE)) return;

  console.log("📄 Local Mode: Initializing jobs_local.json from jobs.xml...");
  try {
    if (!fs.existsSync(XML_PATH)) {
      console.log("⚠️ jobs.xml not found. Initializing empty jobs list.");
      fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2));
      return;
    }

    const xmlContent = fs.readFileSync(XML_PATH, "utf-8");
    const parsed = await xml2js.parseStringPromise(xmlContent, {
      explicitArray: false,
      trim: true,
    });

    const rawJobs = parsed.jobs.job;
    const jobList = Array.isArray(rawJobs) ? rawJobs : [rawJobs];

    const formattedJobs = jobList.map((job, index) => {
      let requirements = [];
      if (job.requirements && job.requirements.item) {
        requirements = Array.isArray(job.requirements.item)
          ? job.requirements.item
          : [job.requirements.item];
      }

      let benefits = [];
      if (job.benefits && job.benefits.item) {
        benefits = Array.isArray(job.benefits.item)
          ? job.benefits.item
          : [job.benefits.item];
      }

      const generatedId = (index + 1).toString();
      return {
        _id: generatedId,
        id: generatedId,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type || "Full-time",
        category: job.category || "Technology",
        salary: job.salary || "Negotiable",
        posted: job.posted || new Date().toISOString().split("T")[0],
        logo: job.logo || job.company.slice(0, 2).toUpperCase(),
        color: job.color || "#6C63FF",
        description: job.description.trim(),
        requirements: requirements,
        benefits: benefits,
      };
    });

    fs.writeFileSync(JOBS_FILE, JSON.stringify(formattedJobs, null, 2));
    console.log(`✅ jobs_local.json successfully initialized with ${formattedJobs.length} records.`);
  } catch (err) {
    console.error("❌ Failed to parse jobs.xml:", err.message);
    fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2));
  }
}

function readJsonFile(filePath) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e.message);
    return [];
  }
}

function writeJsonFile(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ── Initialize Local Files on Import ──────────────────────────
if (isLocalMode) {
  initializeLocalJobs();
}

// ── Dynamic Models (only required in MongoDB Mode) ───────────
let Job, User, Application;
if (!isLocalMode) {
  Job = require("./models/Job");
  User = require("./models/User");
  Application = require("./models/Application");
}

// Helper to generate database-like IDs locally
function generateLocalId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ── Unified Data Service ──────────────────────────────────────
const dataService = {
  isLocalMode,

  // ── JOBS OPERATIONS ─────────────────────────────────────────
  async getJobs(filters = {}) {
    if (!isLocalMode) {
      const { category, type, search, location } = filters;
      const filterQuery = {};

      if (category && category !== "All") filterQuery.category = category;
      if (type && type !== "All") filterQuery.type = type;
      if (location) filterQuery.location = { $regex: location, $options: "i" };
      if (search) {
        filterQuery.$or = [
          { title: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } }
        ];
      }

      const jobs = await Job.find(filterQuery);
      return jobs.map(j => {
        const obj = j.toObject();
        obj.id = obj._id.toString();
        return obj;
      });
    } else {
      let jobs = readJsonFile(JOBS_FILE);
      const { category, type, search, location } = filters;

      if (category && category !== "All") {
        jobs = jobs.filter(j => j.category === category);
      }
      if (type && type !== "All") {
        jobs = jobs.filter(j => j.type === type);
      }
      if (location) {
        jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        jobs = jobs.filter(j => 
          (j.title && j.title.toLowerCase().includes(q)) || 
          (j.company && j.company.toLowerCase().includes(q))
        );
      }
      return jobs;
    }
  },

  async getJobById(id) {
    if (!isLocalMode) {
      const job = await Job.findById(id);
      if (!job) return null;
      const obj = job.toObject();
      obj.id = obj._id.toString();
      return obj;
    } else {
      const jobs = readJsonFile(JOBS_FILE);
      const job = jobs.find(j => j.id === id);
      return job || null;
    }
  },

  async createJob(jobData) {
    if (!isLocalMode) {
      const newJob = new Job(jobData);
      await newJob.save();
      const obj = newJob.toObject();
      obj.id = obj._id.toString();
      return obj;
    } else {
      const jobs = readJsonFile(JOBS_FILE);
      const newId = generateLocalId();
      const job = {
        _id: newId,
        id: newId,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type || "Full-time",
        category: jobData.category || "Technology",
        salary: jobData.salary || "Negotiable",
        posted: new Date().toISOString().split("T")[0],
        logo: jobData.company.slice(0, 2).toUpperCase(),
        color: jobData.color || "#6C63FF",
        description: jobData.description,
        requirements: jobData.requirements || ["See job description"],
        benefits: jobData.benefits || ["Competitive package"],
      };
      jobs.push(job);
      writeJsonFile(JOBS_FILE, jobs);
      return job;
    }
  },

  async updateJob(id, jobData) {
    if (!isLocalMode) {
      const updated = await Job.findByIdAndUpdate(id, jobData, { new: true });
      if (!updated) return null;
      const obj = updated.toObject();
      obj.id = obj._id.toString();
      return obj;
    } else {
      const jobs = readJsonFile(JOBS_FILE);
      const index = jobs.findIndex(j => j.id === id);
      if (index === -1) return null;

      const updatedJob = {
        ...jobs[index],
        title: jobData.title || jobs[index].title,
        company: jobData.company || jobs[index].company,
        location: jobData.location || jobs[index].location,
        type: jobData.type || jobs[index].type,
        category: jobData.category || jobs[index].category,
        salary: jobData.salary || jobs[index].salary,
        description: jobData.description || jobs[index].description,
        requirements: jobData.requirements || jobs[index].requirements,
        benefits: jobData.benefits || jobs[index].benefits,
      };

      jobs[index] = updatedJob;
      writeJsonFile(JOBS_FILE, jobs);
      return updatedJob;
    }
  },

  async deleteJob(id) {
    if (!isLocalMode) {
      const deleted = await Job.findByIdAndDelete(id);
      return !!deleted;
    } else {
      const jobs = readJsonFile(JOBS_FILE);
      const index = jobs.findIndex(j => j.id === id);
      if (index === -1) return false;
      jobs.splice(index, 1);
      writeJsonFile(JOBS_FILE, jobs);
      return true;
    }
  },

  // ── USER OPERATIONS ─────────────────────────────────────────
  async getUserByEmail(email) {
    const formattedEmail = email.toLowerCase().trim();
    if (!isLocalMode) {
      const user = await User.findOne({ email: formattedEmail });
      return user ? user.toObject() : null;
    } else {
      const users = readJsonFile(USERS_FILE);
      const user = users.find(u => u.email === formattedEmail);
      return user || null;
    }
  },

  async createUser(userData) {
    if (!isLocalMode) {
      const newUser = new User(userData);
      await newUser.save();
      return newUser.toObject();
    } else {
      const users = readJsonFile(USERS_FILE);
      const newId = generateLocalId();
      const newUser = {
        _id: newId,
        id: newId,
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: userData.password, // already hashed by bcrypt inside auth.js
        role: userData.role || "jobseeker",
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      writeJsonFile(USERS_FILE, users);
      return newUser;
    }
  },

  // ── APPLICATION OPERATIONS ──────────────────────────────────
  async createApplication(appData) {
    if (!isLocalMode) {
      const newApp = new Application(appData);
      await newApp.save();
      return newApp.toObject();
    } else {
      const apps = readJsonFile(APPLICATIONS_FILE);
      const newId = generateLocalId();
      const newApp = {
        _id: newId,
        id: newId,
        jobId: appData.jobId,
        jobTitle: appData.jobTitle,
        company: appData.company,
        seekerName: appData.seekerName,
        seekerEmail: appData.seekerEmail.toLowerCase().trim(),
        seekerPhone: appData.seekerPhone,
        resumePath: appData.resumePath,
        status: "Pending",
        isSeekerRead: false,
        createdAt: new Date().toISOString(),
      };
      apps.push(newApp);
      writeJsonFile(APPLICATIONS_FILE, apps);
      return newApp;
    }
  },

  async getApplications() {
    if (!isLocalMode) {
      return await Application.find().sort({ createdAt: -1 });
    } else {
      const apps = readJsonFile(APPLICATIONS_FILE);
      // Sort newest first
      return [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getApplicationById(id) {
    if (!isLocalMode) {
      return await Application.findById(id);
    } else {
      const apps = readJsonFile(APPLICATIONS_FILE);
      return apps.find(a => a.id === id || a._id === id) || null;
    }
  },

  async updateApplicationStatus(id, status) {
    if (!isLocalMode) {
      return await Application.findByIdAndUpdate(
        id,
        { status, isSeekerRead: false },
        { new: true }
      );
    } else {
      const apps = readJsonFile(APPLICATIONS_FILE);
      const index = apps.findIndex(a => a.id === id || a._id === id);
      if (index === -1) return null;

      apps[index].status = status;
      apps[index].isSeekerRead = false;
      writeJsonFile(APPLICATIONS_FILE, apps);
      return apps[index];
    }
  },

  async deleteApplication(id) {
    if (!isLocalMode) {
      const deleted = await Application.findByIdAndDelete(id);
      return !!deleted;
    } else {
      const apps = readJsonFile(APPLICATIONS_FILE);
      const index = apps.findIndex(a => a.id === id || a._id === id);
      if (index === -1) return false;

      apps.splice(index, 1);
      writeJsonFile(APPLICATIONS_FILE, apps);
      return true;
    }
  },

  async getApplicationsBySeeker(email) {
    const formattedEmail = email.toLowerCase().trim();
    if (!isLocalMode) {
      return await Application.find({
        seekerEmail: { $regex: new RegExp("^" + formattedEmail + "$", "i") }
      }).sort({ createdAt: -1 });
    } else {
      const apps = readJsonFile(APPLICATIONS_FILE);
      const filtered = apps.filter(a => a.seekerEmail === formattedEmail);
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async markApplicationsAsRead(email) {
    const formattedEmail = email.toLowerCase().trim();
    if (!isLocalMode) {
      await Application.updateMany(
        {
          seekerEmail: { $regex: new RegExp("^" + formattedEmail + "$", "i") },
          status: { $ne: "Pending" }
        },
        { isSeekerRead: true }
      );
    } else {
      const apps = readJsonFile(APPLICATIONS_FILE);
      let updated = false;
      apps.forEach(a => {
        if (a.seekerEmail === formattedEmail && a.status !== "Pending") {
          a.isSeekerRead = true;
          updated = true;
        }
      });
      if (updated) {
        writeJsonFile(APPLICATIONS_FILE, apps);
      }
    }
  }
};

module.exports = dataService;
