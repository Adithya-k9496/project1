// =============================================================
//  FRONTEND COMPONENT: components/PostJob.jsx
//  Employer form to post a new job.
//
//  useState usage:
//    - jobForm     → controlled form fields (stateBasics)
//    - postLoading → loading spinner state
//    - postSuccess → success screen toggle
//    - errors      → field-level validation errors
// =============================================================

import { useState } from "react";
import { CATEGORIES, JOB_TYPES } from "./JobListings";
import { postJob } from "../api";

const PREDEFINED_SKILLS = {
  "Frontend / Web": ["React", "Vue", "Angular", "HTML5", "CSS3", "Tailwind CSS", "TypeScript", "JavaScript"],
  "Backend / DB": ["Node.js", "Express", "Python", "Django", "Java", "Spring Boot", "Go", "SQL", "PostgreSQL", "MongoDB", "Redis"],
  "DevOps / Cloud": ["Git", "Docker", "Kubernetes", "AWS", "Google Cloud", "CI/CD"],
  "General": ["REST APIs", "GraphQL", "Agile/Scrum", "UI/UX Design"]
};

const PREDEFINED_BENEFITS = {
  "Compensation & Health": ["Health insurance", "Dental insurance", "Stock options", "Performance bonus"],
  "Work & Flexibility": ["Flexible hours", "Remote work", "Hybrid work", "Paid time off (PTO)", "Parental leave"],
  "Growth & Perks": ["Learning budget", "Tech allowance", "Free meals", "Team retreats", "Gym membership"]
};

// ── Initial form state (stateBasics) ─────────────────────────
const INITIAL_FORM = {
  title:       "",
  company:     "",
  location:    "",
  type:        "Full-time",
  category:    "Technology",
  salary:      "",
  description: "",
  requirements: [],
  benefits: [],
};

export default function PostJob({ onJobPosted, user, onNavigateAuth }) {
  // ── useState: form fields ─────────────────────────────────
  const [jobForm,     setJobForm]     = useState(INITIAL_FORM);
  // ── useState: async loading ───────────────────────────────
  const [postLoading, setPostLoading] = useState(false);
  // ── useState: success toggle ──────────────────────────────
  const [postSuccess, setPostSuccess] = useState(false);
  // ── useState: validation errors ──────────────────────────
  const [errors,      setErrors]      = useState({});
  // ── useState: custom requirement input ────────────────────
  const [customReq,   setCustomReq]   = useState("");
  // ── useState: custom benefit input ────────────────────────
  const [customBenefit, setCustomBenefit] = useState("");

  // ── stateBasics: partial form update helper ───────────────
  const updateForm = (key, val) =>
    setJobForm(prev => ({ ...prev, [key]: val }));

  const handleAddRequirement = (reqText) => {
    const trimmed = reqText.trim();
    if (!trimmed) return;
    if (jobForm.requirements.includes(trimmed)) return;
    updateForm("requirements", [...jobForm.requirements, trimmed]);
  };

  const handleRemoveRequirement = (reqText) => {
    updateForm("requirements", jobForm.requirements.filter(r => r !== reqText));
  };

  const handleAddBenefit = (benefitText) => {
    const trimmed = benefitText.trim();
    if (!trimmed) return;
    if (jobForm.benefits.includes(trimmed)) return;
    updateForm("benefits", [...jobForm.benefits, trimmed]);
  };

  const handleRemoveBenefit = (benefitText) => {
    updateForm("benefits", jobForm.benefits.filter(b => b !== benefitText));
  };

  // ── Validate form before submitting ──────────────────────
  const validate = () => {
    const errs = {};
    if (!jobForm.title)       errs.title       = "Job title is required";
    if (!jobForm.company)     errs.company     = "Company name is required";
    if (!jobForm.location)    errs.location    = "Location is required";
    if (!jobForm.description) errs.description = "Job description is required";
    if (jobForm.requirements.length === 0) {
      errs.requirements = "At least one job requirement is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handle submit → call Node.js POST /api/jobs ──────────
  const handleSubmit = async () => {
    if (!user) { onNavigateAuth(); return; }
    if (!validate()) return;

    setPostLoading(true);

    try {
      const res = await postJob(jobForm);
      if (res.success) {
        setPostSuccess(true);
        onJobPosted(res.data);

        // Reset after delay
        setTimeout(() => {
          setPostSuccess(false);
          setJobForm(INITIAL_FORM);
        }, 2500);
      } else {
        setErrors({ submit: res.error || "Failed to post job. Please try again." });
      }
    } catch (err) {
      setErrors({ submit: err.message || "Failed to post job. Please try again." });
    } finally {
      setPostLoading(false);
    }
  };

  if (postSuccess) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="card alert-success" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
          <h2 style={{ color: "var(--color-accent-teal)" }}>Job Posted!</h2>
          <p style={{ marginTop: 8 }}>Your listing is now live. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="hero__eyebrow">Employer Portal</p>
        <h1>Post a Job</h1>
        <p style={{ marginTop: 6 }}>
          Reach thousands of qualified candidates. Saved directly to the XML data source via Node.js.
        </p>
      </div>

      <div className="card">
        {/* Row 1: Title + Company */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              className="input"
              placeholder="e.g. Senior React Developer"
              value={jobForm.title}
              onChange={e => updateForm("title", e.target.value)}
              style={errors.title ? { borderColor: "var(--color-accent-red)" } : {}}
            />
            {errors.title && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.title}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              className="input"
              placeholder="e.g. Acme Corp"
              value={jobForm.company}
              onChange={e => updateForm("company", e.target.value)}
              style={errors.company ? { borderColor: "var(--color-accent-red)" } : {}}
            />
            {errors.company && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.company}</span>}
          </div>
        </div>

        {/* Row 2: Location + Salary */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              className="input"
              placeholder="e.g. Bangalore, India"
              value={jobForm.location}
              onChange={e => updateForm("location", e.target.value)}
              style={errors.location ? { borderColor: "var(--color-accent-red)" } : {}}
            />
            {errors.location && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.location}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Salary Range</label>
            <input
              className="input"
              placeholder="e.g. ₹12L – ₹18L/yr"
              value={jobForm.salary}
              onChange={e => updateForm("salary", e.target.value)}
            />
          </div>
        </div>

        {/* Row 3: Type + Category */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select className="select" value={jobForm.type} onChange={e => updateForm("type", e.target.value)}>
              {JOB_TYPES.filter(t => t !== "All").map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="select" value={jobForm.category} onChange={e => updateForm("category", e.target.value)}>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">Job Description *</label>
          <textarea
            className="textarea"
            placeholder="Describe the role, responsibilities, team, and what makes this opportunity great..."
            value={jobForm.description}
            onChange={e => updateForm("description", e.target.value)}
            style={errors.description ? { borderColor: "var(--color-accent-red)" } : {}}
          />
          {errors.description && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.description}</span>}
        </div>

        {/* Requirements Section */}
        <div style={{ marginBottom: 24, borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
          <h3 style={{ marginBottom: 8, fontSize: "1.1rem" }}>Job Requirements *</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Select from the common skills below or add custom requirements. Candidates will see these listed on the job posting.
          </p>

          {/* Render Currently Selected Requirements */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Selected Requirements ({jobForm.requirements.length})</label>
            {jobForm.requirements.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic", margin: 0 }}>
                No requirements added yet. Click skills below or add a custom one.
              </p>
            ) : (
              <div className="flex flex-gap-sm flex-wrap">
                {jobForm.requirements.map((req, i) => (
                  <span
                    key={i}
                    className="tag"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(108,99,255,0.12)",
                      borderColor: "rgba(108,99,255,0.3)",
                      color: "var(--color-primary-lt)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-primary-lt)",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 14,
                        padding: "0 2px",
                        lineHeight: 1,
                      }}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.requirements && (
              <span style={{ fontSize: 12, color: "var(--color-accent-red)", display: "block", marginTop: 6 }}>
                {errors.requirements}
              </span>
            )}
          </div>

          {/* Add Custom Requirement Input */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Add Custom Requirement</label>
            <div className="flex flex-gap-sm">
              <input
                className="input"
                placeholder="e.g. 3+ years experience with Kubernetes"
                value={customReq}
                onChange={e => setCustomReq(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequirement(customReq);
                    setCustomReq("");
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  handleAddRequirement(customReq);
                  setCustomReq("");
                }}
                style={{ padding: "10px 16px" }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Predefined Skills Picker */}
          <div style={{ background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", padding: 16, border: "1px solid var(--border-mid)" }}>
            <span className="form-label" style={{ display: "block", marginBottom: 12, fontWeight: 600 }}>Quick Add Skills</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(PREDEFINED_SKILLS).map(([category, skills]) => (
                <div key={category}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.5, marginBottom: 6, fontWeight: 700 }}>
                    {category}
                  </div>
                  <div className="flex flex-gap-sm flex-wrap">
                    {skills.map(skill => {
                      const isSelected = jobForm.requirements.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => isSelected ? handleRemoveRequirement(skill) : handleAddRequirement(skill)}
                          style={{
                            padding: "4px 10px",
                            fontSize: 12,
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid",
                            borderColor: isSelected ? "var(--color-primary)" : "var(--border-mid)",
                            background: isSelected ? "var(--color-primary)" : "var(--bg-raised)",
                            color: isSelected ? "#fff" : "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{ marginBottom: 24, borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
          <h3 style={{ marginBottom: 8, fontSize: "1.1rem" }}>Job Benefits</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Select from the common benefits below or add custom benefits. Candidates will see these listed on the job posting.
          </p>

          {/* Render Currently Selected Benefits */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Selected Benefits ({jobForm.benefits.length})</label>
            {jobForm.benefits.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic", margin: 0 }}>
                No benefits added yet. Click perks below or add a custom one.
              </p>
            ) : (
              <div className="flex flex-gap-sm flex-wrap">
                {jobForm.benefits.map((b, i) => (
                  <span
                    key={i}
                    className="tag"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(67,198,172,0.12)",
                      borderColor: "rgba(67,198,172,0.3)",
                      color: "var(--color-accent-teal)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {b}
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(b)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-accent-teal)",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 14,
                        padding: "0 2px",
                        lineHeight: 1,
                      }}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Benefit Input */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Add Custom Benefit</label>
            <div className="flex flex-gap-sm">
              <input
                className="input"
                placeholder="e.g. Wellness stipends or free lunches"
                value={customBenefit}
                onChange={e => setCustomBenefit(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBenefit(customBenefit);
                    setCustomBenefit("");
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  handleAddBenefit(customBenefit);
                  setCustomBenefit("");
                }}
                style={{ padding: "10px 16px" }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Predefined Benefits Picker */}
          <div style={{ background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", padding: 16, border: "1px solid var(--border-mid)" }}>
            <span className="form-label" style={{ display: "block", marginBottom: 12, fontWeight: 600 }}>Quick Add Benefits</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(PREDEFINED_BENEFITS).map(([category, benefits]) => (
                <div key={category}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.5, marginBottom: 6, fontWeight: 700 }}>
                    {category}
                  </div>
                  <div className="flex flex-gap-sm flex-wrap">
                    {benefits.map(b => {
                      const isSelected = jobForm.benefits.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => isSelected ? handleRemoveBenefit(b) : handleAddBenefit(b)}
                          style={{
                            padding: "4px 10px",
                            fontSize: 12,
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid",
                            borderColor: isSelected ? "var(--color-accent-teal)" : "var(--border-mid)",
                            background: isSelected ? "var(--color-accent-teal)" : "var(--bg-raised)",
                            color: isSelected ? "#fff" : "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {isSelected ? `✓ ${b}` : `+ ${b}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>{errors.submit}</div>
        )}

        <button
          className="btn btn-primary btn-full"
          style={{ fontSize: 15 }}
          disabled={postLoading}
          onClick={handleSubmit}
        >
          {postLoading
            ? "⏳ Posting to Node.js backend..."
            : user
            ? "Publish Job →"
            : "Login to Post →"}
        </button>

      
      </div>
    </div>
  );
}
