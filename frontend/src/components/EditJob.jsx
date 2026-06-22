// =============================================================
//  FRONTEND COMPONENT: components/EditJob.jsx
//  Employer form to edit/update an existing job listing.
// =============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobById, updateJob } from "../api";
import { CATEGORIES, JOB_TYPES } from "./JobListings";

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

export default function EditJob({ user, onJobUpdated, onNavigateAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [jobForm, setJobForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [customReq, setCustomReq] = useState("");
  const [customBenefit, setCustomBenefit] = useState("");

  // Access check on mount
  useEffect(() => {
    if (!user || user.role !== "employer") {
      onNavigateAuth();
    }
  }, [user, onNavigateAuth]);

  // Load current job details
  useEffect(() => {
    if (id) {
      fetchJobById(id)
        .then((res) => {
          if (res.success) {
            setJobForm({
              title: res.data.title || "",
              company: res.data.company || "",
              location: res.data.location || "",
              type: res.data.type || "Full-time",
              category: res.data.category || "Technology",
              salary: res.data.salary || "",
              description: res.data.description || "",
              requirements: res.data.requirements || [],
              benefits: res.data.benefits || [],
            });
          } else {
            setErrors({ submit: res.error || "Failed to load job details." });
          }
          setLoading(false);
        })
        .catch((err) => {
          setErrors({ submit: err.message || "Failed to load job details." });
          setLoading(false);
        });
    }
  }, [id]);

  const updateForm = (key, val) =>
    setJobForm((prev) => ({ ...prev, [key]: val }));

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

  const validate = () => {
    const errs = {};
    if (!jobForm.title.trim()) errs.title = "Job title is required.";
    if (!jobForm.company.trim()) errs.company = "Company name is required.";
    if (!jobForm.location.trim()) errs.location = "Location is required.";
    if (!jobForm.description.trim()) errs.description = "Job description is required.";
    if (!jobForm.requirements || jobForm.requirements.length === 0) {
      errs.requirements = "At least one job requirement is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setUpdateLoading(true);
    setErrors({});

    try {
      const res = await updateJob(id, jobForm);
      if (res.success) {
        setSuccess(true);
        if (onJobUpdated) {
          onJobUpdated();
        }
        setTimeout(() => {
          navigate(`/jobs/${id}`);
        }, 2000);
      } else {
        setErrors({ submit: res.error || "Failed to update job listing." });
      }
    } catch (err) {
      setErrors({ submit: err.message || "An error occurred during submission." });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "45vh", flexDirection: "column" }}>
        <div style={{ fontSize: 44, animation: "spin 1s linear infinite" }}>⏳</div>
        <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>Loading listing details...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto" }}>
        <div className="card" style={{ padding: 48, textAlign: "center", borderColor: "var(--color-accent-teal)" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
          <h2 style={{ color: "var(--color-accent-teal)" }}>Listing Updated!</h2>
          <p style={{ marginTop: 12, color: "var(--text-secondary)" }}>
            Your modifications have been successfully saved to MongoDB.
          </p>
          <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
            Redirecting you back to the job detail view...
          </p>
        </div>
      </div>
    );
  }

  if (!jobForm) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h3>Job listing not found</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/jobs")}>
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <button className="btn btn-secondary" style={{ marginBottom: 24 }} onClick={() => navigate(`/jobs/${id}`)}>
        ← Cancel & Back
      </button>

      <div style={{ marginBottom: 28 }}>
        <p className="hero__eyebrow">Employer Panel</p>
        <h1>Edit Job Listing</h1>
        <p style={{ marginTop: 6, color: "var(--text-secondary)" }}>
          Modify details for this job card. Changes reflect instantly across the portal.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Row 1: Title + Company */}
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Senior React Developer"
                value={jobForm.title}
                onChange={(e) => updateForm("title", e.target.value)}
                style={errors.title ? { borderColor: "var(--color-accent-red)" } : {}}
              />
              {errors.title && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.title}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Acme Corp"
                value={jobForm.company}
                onChange={(e) => updateForm("company", e.target.value)}
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
                type="text"
                className="input"
                placeholder="e.g. Bangalore, India"
                value={jobForm.location}
                onChange={(e) => updateForm("location", e.target.value)}
                style={errors.location ? { borderColor: "var(--color-accent-red)" } : {}}
              />
              {errors.location && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.location}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Salary Range</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. ₹12L – ₹18L/yr"
                value={jobForm.salary}
                onChange={(e) => updateForm("salary", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Type + Category */}
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select className="select" value={jobForm.type} onChange={(e) => updateForm("type", e.target.value)}>
                {JOB_TYPES.filter((t) => t !== "All").map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="select" value={jobForm.category} onChange={(e) => updateForm("category", e.target.value)}>
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Job Description *</label>
            <textarea
              className="textarea"
              placeholder="Describe the role, requirements, and responsibilities..."
              value={jobForm.description}
              onChange={(e) => updateForm("description", e.target.value)}
              style={errors.description ? { borderColor: "var(--color-accent-red)", height: 180 } : { height: 180 }}
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
              <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Selected Requirements ({jobForm.requirements?.length || 0})</label>
              {!jobForm.requirements || jobForm.requirements.length === 0 ? (
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
                  type="text"
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
                        const isSelected = jobForm.requirements?.includes(skill);
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
              <label className="form-label" style={{ marginBottom: 8, display: "block" }}>Selected Benefits ({jobForm.benefits?.length || 0})</label>
              {!jobForm.benefits || jobForm.benefits.length === 0 ? (
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
                  type="text"
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
                        const isSelected = jobForm.benefits?.includes(b);
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
            type="submit"
            className="btn btn-primary btn-full"
            style={{ fontSize: 15 }}
            disabled={updateLoading}
          >
            {updateLoading ? "⏳ Saving modifications..." : "Save Job Listing →"}
          </button>
        </form>
      </div>
    </div>
  );
}
