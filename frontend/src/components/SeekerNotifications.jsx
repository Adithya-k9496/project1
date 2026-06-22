// =============================================================
//  FRONTEND COMPONENT: components/SeekerNotifications.jsx
//  Allows jobseekers to view their status updates and notifications.
// =============================================================

import { useState, useEffect } from "react";
import { fetchSeekerApplications, markSeekerNotificationsAsRead, deleteApplication } from "../api";
import { Link } from "react-router-dom";

export default function SeekerNotifications({ user, onRefreshNotificationCount }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const res = await fetchSeekerApplications();
      if (res.success) {
        setApplications(res.data);
        
        // Mark all as read after fetching
        const hasUnread = res.data.some(app => app.status !== "Pending" && !app.isSeekerRead);
        if (hasUnread) {
          await markSeekerNotificationsAsRead();
          if (onRefreshNotificationCount) {
            onRefreshNotificationCount();
          }
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

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this notification card?")) return;
    setError("");
    try {
      const res = await deleteApplication(appId);
      if (res.success) {
        loadNotifications();
      } else {
        setError(res.error || "Failed to delete notification.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during deletion.");
    }
  };

  useEffect(() => {
    if (user && user.role === "jobseeker") {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== "jobseeker") {
    return (
      <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: 40, border: "1px solid var(--border-mid)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h3 style={{ color: "var(--color-accent-red)", marginBottom: 12 }}>Access Denied</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Please log in with a job seeker account to view your application status notifications.
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
        <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>Loading application updates...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 750, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="hero__eyebrow">Candidate Center</p>
        <h1>My Notifications</h1>
        <p style={{ marginTop: 6, color: "var(--text-secondary)" }}>
          Track your active job applications, check decisions, and read feedback from employers.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💼</div>
          <h4>No Applications Found</h4>
          <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>
            You haven't submitted any job applications yet. Apply for jobs to see updates here!
          </p>
          <Link to="/jobs" className="btn btn-primary" style={{ display: "inline-flex", marginTop: 20 }}>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {applications.map((app) => {
            const isApproved = app.status === "Approved";
            const isSuspended = app.status === "Suspended";
            
            // Choose card borders/glow based on status
            let borderStyle = "1px solid var(--border-mid)";
            let backgroundStyle = "var(--bg-surface)";
            let accentColor = "var(--color-primary)";

            if (isApproved) {
              borderStyle = "1px solid rgba(67, 198, 172, 0.4)";
              backgroundStyle = "rgba(67, 198, 172, 0.04)";
              accentColor = "var(--color-accent-teal)";
            } else if (isSuspended) {
              borderStyle = "1px solid rgba(235, 51, 73, 0.25)";
              backgroundStyle = "rgba(235, 51, 73, 0.02)";
              accentColor = "var(--color-accent-red)";
            } else {
              borderStyle = "1px solid rgba(108, 99, 255, 0.3)";
              backgroundStyle = "rgba(108, 99, 255, 0.02)";
              accentColor = "var(--color-primary-lt)";
            }

            return (
              <div 
                key={app._id} 
                className="card" 
                style={{ 
                  border: borderStyle,
                  background: backgroundStyle,
                  borderLeft: `5px solid ${accentColor}`,
                  padding: "24px 28px",
                  position: "relative",
                  transition: "var(--transition)"
                }}
              >
                {/* Header Row */}
                <div className="flex-between flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>{app.jobTitle}</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                      at {app.company}
                    </p>
                  </div>
                  <div className="flex flex-gap-sm" style={{ alignItems: "center" }}>
                    <span 
                      className={`badge ${
                        isApproved 
                          ? "badge-teal" 
                          : isSuspended 
                          ? "badge-red" 
                          : "badge-purple"
                      }`}
                      style={{ padding: "4px 10px", fontSize: 11 }}
                    >
                      {app.status}
                    </span>
                    {!app.isSeekerRead && app.status !== "Pending" && (
                      <span className="badge badge-gold" style={{ fontSize: 9, padding: "2px 6px" }}>NEW</span>
                    )}
                  </div>
                </div>

                {/* Status-specific Messages */}
                {isApproved ? (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 36, lineHeight: 1 }}>🎉</div>
                    <div>
                      <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 15, margin: "0 0 6px" }}>
                        Application Approved!
                      </p>
                      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                        Congratulations, <strong>{app.seekerName}</strong>! We are absolutely thrilled to inform you that your application has been accepted. The hiring team at <strong>{app.company}</strong> is excited to welcome you aboard. They will reach out to you via your email (<strong>{app.seekerEmail}</strong>) or phone (<strong>{app.seekerPhone}</strong>) very soon to align on the onboarding process. Well done!
                      </p>
                    </div>
                  </div>
                ) : isSuspended ? (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 36, lineHeight: 1 }}>✉️</div>
                    <div>
                      <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 15, margin: "0 0 6px" }}>
                        Application Status Update
                      </p>
                      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                        Thank you for your interest in the <strong>{app.jobTitle}</strong> position at <strong>{app.company}</strong>. We regret to inform you that your job request has been denied at this time, as the hiring team has decided to move forward with other candidates. We greatly appreciate the time and effort you invested in applying and wish you the absolute best in your future career search.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 36, lineHeight: 1 }}>⏳</div>
                    <div>
                      <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 15, margin: "0 0 6px" }}>
                        Under Review
                      </p>
                      <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                        Your application details and uploaded resume PDF have been successfully delivered to the recruitment team. Your profile is currently under active evaluation. You will receive an immediate status notification update here as soon as the employer completes their review.
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer details */}
                <div style={{ marginTop: 20, borderTop: "1px solid var(--border-subtle)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span>Resume PDF: {app.resumePath.split("/").pop()}</span>
                    <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <button
                      className="btn btn-secondary"
                      style={{
                        padding: "6px 12px",
                        fontSize: 11,
                        background: "rgba(235,51,73,0.08)",
                        borderColor: "rgba(235,51,73,0.3)",
                        color: "var(--color-accent-red)",
                        cursor: "pointer",
                        borderRadius: "var(--radius-sm)",
                      }}
                      onClick={() => handleDelete(app._id)}
                    >
                      🗑️ Delete Notification
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
