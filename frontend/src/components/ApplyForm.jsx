// =============================================================
//  FRONTEND COMPONENT: components/ApplyForm.jsx
//  Allows jobseekers to apply for a job and upload a resume PDF.
// =============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobById, submitApplication } from "../api";

export default function ApplyForm({ user, onApplySuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [seekerName, setSeekerName] = useState("");
  const [seekerEmail, setSeekerEmail] = useState("");
  const [seekerPhone, setSeekerPhone] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-populate name/email if logged in user exists
  useEffect(() => {
    if (user) {
      setSeekerName(user.name || "");
      setSeekerEmail(user.email || "");
    }
  }, [user]);

  // Load Job details
  useEffect(() => {
    if (id) {
      fetchJobById(id)
        .then((res) => {
          if (res.success) {
            setJob(res.data);
          }
          setJobLoading(false);
        })
        .catch((err) => {
          console.error("Error loading job details:", err);
          setJobLoading(false);
        });
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, resume: "Only PDF resumes are supported." }));
        setResumeFile(null);
      } else if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: "File size must be less than 10MB." }));
        setResumeFile(null);
      } else {
        setResumeFile(file);
        setErrors((prev) => {
          const { resume, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!seekerName.trim()) errs.name = "Full name is required.";
    if (!seekerEmail.trim()) errs.email = "Email address is required.";
    if (!seekerPhone.trim()) errs.phone = "Phone number is required.";
    if (!resumeFile) errs.resume = "Resume PDF file is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("jobId", id);
    formData.append("seekerName", seekerName);
    formData.append("seekerEmail", seekerEmail);
    formData.append("seekerPhone", seekerPhone);
    formData.append("resume", resumeFile);

    try {
      const res = await submitApplication(formData);
      if (res.success) {
        setSuccess(true);
        if (onApplySuccess) {
          onApplySuccess(id);
        }
        setTimeout(() => {
          navigate("/jobs");
        }, 3000);
      } else {
        setErrors({ submit: res.error || "Failed to submit application." });
      }
    } catch (err) {
      setErrors({ submit: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  if (jobLoading) {
    return (
      <div className="flex-center" style={{ height: "40vh", flexDirection: "column" }}>
        <div style={{ fontSize: 40, animation: "spin 1s linear infinite" }}>⏳</div>
        <p style={{ marginTop: 16 }}>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h3>Job not found</h3>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/jobs")}>
          Back to Listings
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto" }}>
        <div className="card" style={{ padding: 48, textAlign: "center", borderColor: "var(--color-accent-teal)" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
          <h2 style={{ color: "var(--color-accent-teal)" }}>Application Sent!</h2>
          <p style={{ marginTop: 12, color: "var(--text-secondary)" }}>
            Your details and resume PDF have been successfully submitted to the employer.
          </p>
          <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
            Redirecting you back to the jobs catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <button className="btn btn-secondary" style={{ marginBottom: 24 }} onClick={() => navigate(`/jobs/${id}`)}>
        ← Back to Job Details
      </button>

      <div style={{ marginBottom: 28 }}>
        <span className="badge badge-purple" style={{ marginBottom: 8 }}>Applying</span>
        <h1 style={{ fontSize: "1.8rem" }}>{job.title}</h1>
        <p style={{ marginTop: 6, fontSize: "15px" }}>
          {job.company} · {job.location}
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Candidate Name */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. John Doe"
              value={seekerName}
              onChange={(e) => setSeekerName(e.target.value)}
              style={errors.name ? { borderColor: "var(--color-accent-red)" } : {}}
            />
            {errors.name && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.name}</span>}
          </div>

          {/* Candidate Email */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="input"
              placeholder="john.doe@example.com"
              value={seekerEmail}
              onChange={(e) => setSeekerEmail(e.target.value)}
              style={errors.email ? { borderColor: "var(--color-accent-red)" } : {}}
            />
            {errors.email && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.email}</span>}
          </div>

          {/* Candidate Phone */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="input"
              placeholder="e.g. +91 98765 43210"
              value={seekerPhone}
              onChange={(e) => setSeekerPhone(e.target.value)}
              style={errors.phone ? { borderColor: "var(--color-accent-red)" } : {}}
            />
            {errors.phone && <span style={{ fontSize: 12, color: "var(--color-accent-red)" }}>{errors.phone}</span>}
          </div>

          {/* Resume Upload (PDF) */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Resume PDF *</label>
            <div 
              style={{
                border: errors.resume ? "2px dashed var(--color-accent-red)" : "2px dashed var(--border-mid)",
                borderRadius: "var(--radius-md)",
                padding: "24px 16px",
                textAlign: "center",
                background: "var(--bg-base)",
                cursor: "pointer",
                position: "relative",
                transition: "var(--transition)",
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              {resumeFile ? (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--color-primary-lt)", margin: 0, fontSize: 14 }}>
                    {resumeFile.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB · Click or drag to replace
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text-secondary)", margin: 0, fontSize: 14 }}>
                    Select Resume PDF File
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    Supports PDF format only (Max 10MB)
                  </p>
                </div>
              )}
            </div>
            {errors.resume && <span style={{ fontSize: 12, color: "var(--color-accent-red)", display: "block", marginTop: 6 }}>{errors.resume}</span>}
          </div>

          {errors.submit && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>{errors.submit}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ fontSize: 15 }}
            disabled={loading}
          >
            {loading ? "⏳ Submitting application..." : "Submit Application →"}
          </button>
        </form>
      </div>
    </div>
  );
}
