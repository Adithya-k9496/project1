// =============================================================
//  FRONTEND COMPONENT: components/Notifications.jsx
//  Employer notification panel to review, accept/reject, and delete submissions.
// =============================================================

import { useState, useEffect } from "react";
import { fetchApplications, updateApplicationStatus, deleteApplication } from "../api";
import { Link } from "react-router-dom";

export default function Notifications({ user, onRefreshNotificationCount }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadNotifications = async () => {
    try {
      const res = await fetchApplications();
      if (res.success) {
        setNotifications(res.data);
        // If an app was selected, keep it selected but update its data
        if (selectedApp) {
          const updatedSelected = res.data.find(a => a._id === selectedApp._id);
          setSelectedApp(updatedSelected || null);
        }
      } else {
        setError(res.error || "Failed to load notifications.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while loading notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "employer") {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleStatusChange = async (appId, newStatus) => {
    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setSuccessMsg(`Application status updated to ${newStatus}!`);
        await loadNotifications();
        if (onRefreshNotificationCount) {
          onRefreshNotificationCount();
        }
      } else {
        setError(res.error || "Failed to update application status.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during update.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    
    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await deleteApplication(appId);
      if (res.success) {
        setSuccessMsg("Notification deleted successfully.");
        setSelectedApp(null);
        await loadNotifications();
        if (onRefreshNotificationCount) {
          onRefreshNotificationCount();
        }
      } else {
        setError(res.error || "Failed to delete notification.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during deletion.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== "employer") {
    return (
      <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: 40, border: "1px solid var(--border-mid)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h3 style={{ color: "var(--color-accent-red)", marginBottom: 12 }}>Access Denied</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Please log in with an employer account to access this notifications dashboard.
          </p>
          <Link to="/login" className="btn btn-primary btn-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "45vh", flexDirection: "column" }}>
        <div style={{ fontSize: 44, animation: "spin 1s linear infinite" }}>⏳</div>
        <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>Loading notifications...</p>
      </div>
    );
  }

  const backendHost = "http://localhost:5000";

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="hero__eyebrow">Employer Center</p>
        <h1>Notifications Center</h1>
        <p style={{ marginTop: 6, color: "var(--text-secondary)" }}>
          Manage received job applications, review attachments, and update candidate statuses.
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{successMsg}</div>}

      {notifications.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
          <h4>No Notifications Yet</h4>
          <p style={{ marginTop: 8 }}>
            You will receive notification cards here when candidates apply for your job listings.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}>
          {/* Left: Notifications List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ marginBottom: 8, fontSize: 16, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
              Submissions Inbox ({notifications.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
              {notifications.map((app) => {
                const isSelected = selectedApp && selectedApp._id === app._id;
                let badgeClass = "badge-purple";
                if (app.status === "Approved") badgeClass = "badge-teal";
                if (app.status === "Suspended") badgeClass = "badge-red";

                return (
                  <div
                    key={app._id}
                    className="card"
                    onClick={() => { setSelectedApp(app); setSuccessMsg(""); setError(""); }}
                    style={{
                      cursor: "pointer",
                      padding: "16px 20px",
                      background: isSelected ? "var(--bg-raised)" : "var(--bg-surface)",
                      border: isSelected ? "1px solid var(--color-primary)" : "1px solid var(--border-subtle)",
                      transition: "var(--transition)",
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                      position: "relative"
                    }}
                  >
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: 10 }}>
                        {app.status}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, marginBottom: 4 }}>{app.seekerName}</h4>
                    <p style={{ fontSize: 12, margin: 0, color: "var(--text-secondary)" }}>
                      Opted for: <strong>{app.jobTitle}</strong>
                    </p>
                    {app.status === "Pending" && (
                      <span style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--color-accent-gold)"
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Notification Detail Pane */}
          <div>
            {selectedApp ? (
              <div className="card" style={{ padding: 32, position: "sticky", top: 80, border: "1px solid var(--border-mid)" }}>
                {/* Job Info Header */}
                <div style={{ marginBottom: 24, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16 }}>
                  <span className="badge badge-purple" style={{ marginBottom: 8 }}>Job Detail</span>
                  <h2 style={{ fontSize: 22, marginBottom: 4 }}>{selectedApp.jobTitle}</h2>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
                    Opted at: <strong>{selectedApp.company}</strong>
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <Link to={`/jobs/${selectedApp.jobId}`} className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>
                      View Job Details Page →
                    </Link>
                  </div>
                </div>

                {/* Candidate Info */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 15, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>
                    Candidate Profile
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "12px 16px", fontSize: 14 }}>
                    <div style={{ color: "var(--text-muted)" }}>Full Name:</div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{selectedApp.seekerName}</div>

                    <div style={{ color: "var(--text-muted)" }}>Email:</div>
                    <div>
                      <a href={`mailto:${selectedApp.seekerEmail}`} style={{ color: "var(--color-primary-lt)", textDecoration: "underline" }}>
                        {selectedApp.seekerEmail}
                      </a>
                    </div>

                    <div style={{ color: "var(--text-muted)" }}>Phone:</div>
                    <div style={{ color: "var(--text-secondary)" }}>{selectedApp.seekerPhone}</div>

                    <div style={{ color: "var(--text-muted)" }}>Submitted:</div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      {new Date(selectedApp.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </div>

                    <div style={{ color: "var(--text-muted)" }}>Status:</div>
                    <div>
                      <span
                        className={`badge ${
                          selectedApp.status === "Approved"
                            ? "badge-teal"
                            : selectedApp.status === "Suspended"
                            ? "badge-red"
                            : "badge-purple"
                        }`}
                        style={{ fontSize: 11 }}
                      >
                        {selectedApp.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resume PDF Link */}
                <div style={{ marginBottom: 32, padding: 16, background: "var(--bg-base)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex-between flex-wrap" style={{ gap: 12 }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: 14, color: "var(--text-primary)" }}>Resume PDF Attachment</p>
                      <p style={{ fontSize: 12, margin: "2px 0 0", color: "var(--text-muted)" }}>Uploaded resume of the applicant</p>
                    </div>
                    <a
                      href={`${backendHost}${selectedApp.resumePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, padding: "8px 14px" }}
                    >
                      <span>📄</span> Open Resume PDF
                    </a>
                  </div>
                </div>

                {/* Actions Pane */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 24 }}>
                  <h3 style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
                    Manage Status & Notification
                  </h3>
                  
                  {/* Status Options */}
                  <div className="flex flex-gap-sm flex-wrap" style={{ marginBottom: 16 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusChange(selectedApp._id, "Approved")}
                      disabled={actionLoading || selectedApp.status === "Approved"}
                      style={{ flexGrow: 1 }}
                    >
                      👍 Approve / Accept
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStatusChange(selectedApp._id, "Suspended")}
                      disabled={actionLoading || selectedApp.status === "Suspended"}
                      style={{ flexGrow: 1, color: "var(--color-accent-red)", borderColor: "var(--color-accent-red)" }}
                    >
                      👎 Suspend / Reject
                    </button>
                  </div>

                  {/* Delete Option */}
                  <button
                    className="btn btn-secondary btn-full"
                    onClick={() => handleDelete(selectedApp._id)}
                    disabled={actionLoading}
                    style={{ background: "rgba(235,51,73,0.1)", color: "var(--color-accent-red)", borderColor: "rgba(235,51,73,0.3)" }}
                  >
                    🗑️ Delete Notification
                  </button>
                </div>
              </div>
            ) : (
              <div className="card flex-center" style={{ height: "450px", border: "1px dashed var(--border-mid)", background: "var(--bg-base)" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>👉</div>
                  <p style={{ color: "var(--text-secondary)" }}>Select a candidate from the left panel to review details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
