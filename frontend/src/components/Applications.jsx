// =============================================================
//  FRONTEND COMPONENT: components/Applications.jsx
//  Employer dashboard to view submitted applications and download resumes.
// =============================================================

import { useState, useEffect } from "react";
import { fetchApplications } from "../api";
import { Link } from "react-router-dom";

export default function Applications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState("All");

  useEffect(() => {
    if (user && user.role === "employer") {
      fetchApplications()
        .then((res) => {
          if (res.success) {
            setApplications(res.data);
          } else {
            setError(res.error || "Failed to load applications.");
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "An error occurred while fetching applications.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== "employer") {
    return (
      <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: 40, border: "1px solid var(--border-mid)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h3 style={{ color: "var(--color-accent-red)", marginBottom: 12 }}>Access Denied</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            This page is reserved for employers to review candidate submissions. Please log in with an employer account.
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
        <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>Loading candidate profiles...</p>
      </div>
    );
  }

  // Extract unique job titles for filter dropdown
  const uniqueJobTitles = [
    "All",
    ...new Set(applications.map((app) => app.jobTitle)),
  ];

  // Filter application list based on search query and job title dropdown
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.seekerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.seekerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJob =
      selectedJobFilter === "All" || app.jobTitle === selectedJobFilter;

    return matchesSearch && matchesJob;
  });

  const backendHost = "http://localhost:5000";

  return (
    <div>
      {/* Page Header */}
      <div className="flex-between flex-wrap" style={{ marginBottom: 28, gap: 16 }}>
        <div>
          <p className="hero__eyebrow">Employer Dashboard</p>
          <h1>Job Applications</h1>
          <p style={{ marginTop: 6, color: "var(--text-secondary)" }}>
            Review candidate details and check resume attachments.
          </p>
        </div>
        <div className="flex flex-gap-sm" style={{ alignItems: "center" }}>
          <div className="tag" style={{ fontSize: 13, padding: "8px 16px", background: "var(--bg-raised)", border: "1px solid var(--border-mid)" }}>
            Total Submissions: <strong style={{ color: "var(--color-primary-lt)" }}>{applications.length}</strong>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: "16px 20px", background: "var(--bg-raised)" }}>
          <p style={{ fontSize: 12, margin: 0, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>Total Applicants</p>
          <h2 style={{ fontSize: 28, margin: "4px 0 0", color: "var(--color-primary-lt)" }}>{applications.length}</h2>
        </div>
        <div className="card" style={{ padding: "16px 20px", background: "var(--bg-raised)" }}>
          <p style={{ fontSize: 12, margin: 0, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>Filtered Count</p>
          <h2 style={{ fontSize: 28, margin: "4px 0 0", color: "var(--color-accent-teal)" }}>{filteredApps.length}</h2>
        </div>
        <div className="card" style={{ padding: "16px 20px", background: "var(--bg-raised)" }}>
          <p style={{ fontSize: 12, margin: 0, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>Active Jobs with Applicants</p>
          <h2 style={{ fontSize: 28, margin: "4px 0 0", color: "var(--color-accent-gold)" }}>{uniqueJobTitles.length - 1}</h2>
        </div>
      </div>

      {/* Filters bar */}
      <div className="card" style={{ padding: "14px 20px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 16 }}>
          <div>
            <input
              type="text"
              className="input"
              placeholder="Search by candidate name, email or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <select
              className="select"
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              style={{ width: "100%" }}
            >
              {uniqueJobTitles.map((title) => (
                <option key={title} value={title}>
                  {title === "All" ? "All Jobs" : title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Main List */}
      {filteredApps.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <h4>No applications found</h4>
          <p style={{ marginTop: 8 }}>
            {applications.length === 0
              ? "No job seekers have applied for any jobs yet."
              : "Try adjusting your search query or job filter."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredApps.map((app) => (
            <div key={app._id} className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
                <div>
                  <div className="flex flex-gap-sm" style={{ alignItems: "center", marginBottom: 8 }}>
                    <span className="badge badge-purple" style={{ fontSize: 11 }}>{app.jobTitle}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>at {app.company}</span>
                  </div>

                  <h3 style={{ marginBottom: 12 }}>{app.seekerName}</h3>

                  <div className="flex flex-gap-md flex-wrap" style={{ fontSize: 14 }}>
                    <div className="flex flex-gap-sm" style={{ alignItems: "center" }}>
                      <span style={{ color: "var(--color-primary-lt)" }}>✉</span>
                      <a href={`mailto:${app.seekerEmail}`} style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>
                        {app.seekerEmail}
                      </a>
                    </div>
                    <div className="flex flex-gap-sm" style={{ alignItems: "center" }}>
                      <span style={{ color: "var(--color-accent-teal)" }}>📞</span>
                      <span style={{ color: "var(--text-secondary)" }}>{app.seekerPhone}</span>
                    </div>
                    <div className="flex flex-gap-sm" style={{ alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)" }}>📅</span>
                      <span style={{ color: "var(--text-muted)" }}>
                        Applied on {new Date(app.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <a
                    href={`${backendHost}${app.resumePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 18px",
                      fontSize: 13,
                    }}
                  >
                    <span>📄</span> View Resume PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
