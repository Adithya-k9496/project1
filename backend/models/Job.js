const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "Full-time",
  },
  category: {
    type: String,
    required: true,
    default: "Technology",
  },
  salary: {
    type: String,
    required: true,
  },
  posted: {
    type: String,
    default: () => new Date().toISOString().split("T")[0],
  },
  logo: {
    type: String,
  },
  color: {
    type: String,
    default: "#6C63FF",
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    default: [],
  },
  benefits: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Job", JobSchema);
