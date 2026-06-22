// =============================================================
//  FRONTEND COMPONENT: components/JobListings.jsx
//  Route: /jobs
//  Job cards use <Link to={`/jobs/${job.id}`}> so clicking a
//  card changes the URL to /jobs/1, /jobs/2, etc.
// =============================================================

import { useState } from "react";
import { Link }     from "react-router-dom";

export const CATEGORIES    = ["All","Technology","Management","Data & AI","Design","Marketing"];
export const JOB_TYPES     = ["All","Full-time","Part-time","Contract"];
export const INITIAL_FILTERS = { search:"", category:"All", type:"All", location:"" };

// ── JobCard ───────────────────────────────────────────────────
function JobCard({ job, savedJobs, onToggleSave, appliedJobs, user, onDelete }) {
  const isSaved   = savedJobs.includes(job.id);
  const isApplied = appliedJobs.includes(job.id);

  return (
    // Wrap entire card in Link → clicking navigates to /jobs/:id
    <Link
      to={`/jobs/${job.id}`}
      className="card card-hover"
      style={{ "--card-accent": job.color, display: "block", textDecoration: "none", color: "inherit" }}
    >
      <div className="job-card__header">
        <div className="flex flex-gap-md" style={{ alignItems: "center" }}>
          <div className="logo-circle" style={{ background: job.color + "22", color: job.color }}>
            {job.logo}
          </div>
          <div>
            <h4 style={{ marginBottom: 2 }}>{job.title}</h4>
            <p style={{ fontSize: 13, margin: 0 }}>{job.company}</p>
          </div>
        </div>

        {user?.role !== "employer" && (
          <button
            className="save-btn"
            style={{ color: isSaved ? "var(--color-accent-gold)" : "var(--text-faint)" }}
            onClick={e => { e.preventDefault(); onToggleSave(job.id); }}
            title={isSaved ? "Remove from saved" : "Save job"}
          >
            ★
          </button>
        )}
      </div>

      <div className="job-card__meta">
        <span className="badge badge-purple">{job.type}</span>
        <span className="badge badge-teal">{job.category}</span>
        {isApplied && <span className="badge badge-teal">✓ Applied</span>}

      </div>

      <div className="job-card__footer">
        <span className="job-card__location">📍 {job.location}</span>
        <span className="job-card__salary" style={{ color: job.color }}>{job.salary}</span>
      </div>

      {user?.role === "employer" && (
        <div 
          className="flex flex-gap-sm" 
          style={{ marginTop: 12, borderTop: "1px solid var(--border-subtle)", paddingTop: 8 }}
          onClick={e => e.preventDefault()}
        >

          <button 
            className="btn btn-secondary" 
            style={{ padding: "6px 12px", fontSize: 12, borderColor: "var(--color-accent-red)", color: "var(--color-accent-red)" }} 
            onClick={() => onDelete(job.id)}
          >
            Delete
          </button>
        </div>
      )}
    </Link>
  );
}

// ── JobListings page ──────────────────────────────────────────
export default function JobListings({ jobs, loading, user, onSelectJob, appliedJobs, savedJobs, onToggleSave, onDelete }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filteredJobs = jobs.filter(job => {
    const matchSearch = !filters.search ||
      job.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company?.toLowerCase().includes(filters.search.toLowerCase());
    const matchCat  = filters.category === "All" || job.category === filters.category;
    const matchType = filters.type     === "All" || job.type     === filters.type;
    const matchLoc  = !filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase());
    return matchSearch && matchCat && matchType && matchLoc;
  });

  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  return (
    <div>
      <div className="hero">
        <p className="hero__eyebrow">React Router · Node.js · XML Data</p>
        <h1 className="hero__title">
          Find Your <span className="gradient-text">Dream Job</span>
        </h1>
        <p className="hero__subtitle">{filteredJobs.length} opportunities across all industries</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          ["Total Jobs",  jobs.length,         "var(--color-primary-lt)"],
          ["Applied",     appliedJobs.length,  "var(--color-accent-teal)"],
          ["Saved",       savedJobs.length,    "var(--color-accent-gold)"],
          ["Categories",  CATEGORIES.length-1, "var(--color-accent-pink)"],
        ].map(([label, value, color]) => (
          <div key={label} className="stat-card">
            <div className="stat-card__value" style={{ color }}>{value}</div>
            <div className="stat-card__label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid-2" style={{ marginBottom: 14 }}>
          <input className="input" placeholder="🔍  Search by title or company..."
            value={filters.search} onChange={e => updateFilter("search", e.target.value)} />
          <input className="input" placeholder="📍  Filter by location..."
            value={filters.location} onChange={e => updateFilter("location", e.target.value)} />
        </div>
        <div className="flex flex-gap-sm flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} className={`filter-btn ${filters.category === c ? "active" : ""}`}
              onClick={() => updateFilter("category", c)}>{c}</button>
          ))}
          <div style={{ width:1, background:"var(--border-subtle)", margin:"0 4px" }} />
          {JOB_TYPES.map(t => (
            <button key={t} className={`filter-btn ${filters.type === t ? "active" : ""}`}
              onClick={() => updateFilter("type", t)}>{t}</button>
          ))}
          <button className="btn btn-secondary" style={{ marginLeft:"auto", padding:"7px 14px", fontSize:13 }}
            onClick={() => setFilters(INITIAL_FILTERS)}>Clear</button>
        </div>
      </div>

      {loading ? (
        <div className="grid-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:160 }} />)}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-faint)" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔎</div>
          <h3 style={{ color:"var(--text-secondary)" }}>No jobs found</h3>
          <p style={{ marginTop:6 }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job}
              savedJobs={savedJobs} onToggleSave={onToggleSave} appliedJobs={appliedJobs}
              user={user} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
