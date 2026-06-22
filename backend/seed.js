require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const Job = require("./models/Job");

const XML_PATH = path.join(__dirname, "jobs.xml");

async function parseJobsXML() {
  if (!fs.existsSync(XML_PATH)) {
    console.log("⚠️ No jobs.xml file found to seed data.");
    return [];
  }
  const xmlContent = fs.readFileSync(XML_PATH, "utf-8");
  const parsed = await xml2js.parseStringPromise(xmlContent, {
    explicitArray: false,
    trim: true,
  });

  const rawJobs = parsed.jobs.job;
  const jobList = Array.isArray(rawJobs) ? rawJobs : [rawJobs];

  return jobList.map(job => {
    // Helper to format requirements and benefits correctly into arrays
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

    return {
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
}

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Error: MONGODB_URI environment variable is missing.");
    process.exit(1);
  }

  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("✅ Connected successfully to Atlas.");

    console.log("📄 Parsing jobs.xml...");
    const jobs = await parseJobsXML();
    console.log(`✅ Parsed ${jobs.length} jobs.`);

    console.log("🧹 Clearing existing Job collection in MongoDB...");
    await Job.deleteMany({});
    console.log("✅ Existing Job collection cleared.");

    console.log("🚀 Inserting parsed jobs...");
    const result = await Job.insertMany(jobs);
    console.log(`🎉 Successfully seeded ${result.length} jobs in MongoDB!`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB. Seeding done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

runSeed();
