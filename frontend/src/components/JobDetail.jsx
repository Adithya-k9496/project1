// =============================================================
//  FRONTEND COMPONENT: components/JobDetail.jsx
//  Shows the full detail view of a selected job.
//
//  useState usage:
//    - applied   → tracks if user has applied (boolean)
//    - saved     → tracks if job is saved (boolean)
// =============================================================

import { useState } from "react";

export default function JobDetail({ job, onBack, user, onNavigateAuth, appliedJobs, savedJobs, onToggleSave, onApply, onDelete, onEdit }) {
  // ── useState: local UI feedback state ────────────────────
  const [applyClicked, setApplyClicked] = useState(false);

  const isApplied = appliedJobs.includes(job.id);
  const isSaved   = savedJobs.includes(job.id);

  const handleApply = () => {
    if (!user) { onNavigateAuth(); return; }
    onApply(job.id);
    setApplyClicked(true);  // useState: local feedback
  };

  return (
    <div>
      {/* Back Button */}
      <button className="btn btn-secondary" style={{ marginBottom: 24 }} onClick={onBack}>
        ← Back to listings
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

        {/* ── Left: Job Details ─────────────────────────── */}
        <div>
          {/* Title Card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="flex flex-gap-md" style={{ alignItems: "center", marginBottom: 20 }}>
              <div
                className="logo-circle"
                style={{ width: 58, height: 58, borderRadius: 14, fontSize: 20, background: job.color + "22", color: job.color }}
              >
                {job.logo}
              </div>
              <div>
                <h2 style={{ marginBottom: 4 }}>{job.title}</h2>
                <p style={{ margin: 0, fontSize: 15 }}>{job.company} · {job.location}</p>
              </div>
            </div>

            <div className="flex flex-gap-sm" style={{ alignItems: "center" }}>
              <span className="badge badge-purple">{job.type}</span>
              <span className="badge badge-teal">{job.category}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 16, color: job.color }}>{job.salary}</span>
            </div>

            <div className="divider" />

            <h3 style={{ marginBottom: 10, color: "var(--text-secondary)" }}>About the role</h3>
            <p>{job.description}</p>
          </div>

          {/* Requirements */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14, color: "var(--text-secondary)" }}>Requirements</h3>
            {job.requirements?.map((req, i) => (
              <div key={i} className="flex flex-gap-md" style={{ alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: job.color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{req}</span>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="card">
            <h3 style={{ marginBottom: 14, color: "var(--text-secondary)" }}>Benefits</h3>
            <div className="flex flex-gap-sm flex-wrap">
              {job.benefits?.map((b, i) => <span key={i} className="tag">{b}</span>)}
            </div>
          </div>
        </div>

        {/* ── Right: Action Sidebar ─────────────────────── */}
        <div>
          <div className="card" style={{ position: "sticky", top: 80 }}>
            <p style={{ fontSize: 13, margin: "0 0 4px" }}>Posted</p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 0 }}>{job.posted}</p>

            <div className="divider" />

            {user?.role === "employer" ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: "10px 14px", fontSize: 13, whiteSpace: "nowrap" }}
                  onClick={() => onEdit(job.id)}
                >
                  ✏️ Edit Job
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, borderColor: "var(--color-accent-red)", color: "var(--color-accent-red)", padding: "10px 14px", fontSize: 13, whiteSpace: "nowrap" }} 
                  onClick={() => { onDelete(job.id); onBack(); }}
                >
                  🗑️ Delete
                </button>
              </div>
            ) : (
              /* useState: show success state after apply */
              isApplied || applyClicked ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 600, color: "var(--color-accent-teal)", margin: 0 }}>Application Sent!</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>We'll notify you via email</p>
                </div>
              ) : (
                <>
                  <button className="btn btn-primary btn-full" style={{ marginBottom: 10 }} onClick={handleApply}>
                    {user ? "Apply Now" : "Login to Apply"}
                  </button>
                  <button
                    className="btn btn-secondary btn-full"
                    onClick={() => onToggleSave(job.id)}
                  >
                    {isSaved ? "★ Saved" : "☆ Save Job"}
                  </button>
                </>
              )
            )}

            <div className="divider" />
            <p style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center", margin: 0 }}>
              Data from XML · Served by Node.js API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
