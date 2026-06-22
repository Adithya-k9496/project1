import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import './global.css'; 

import JobListings from './components/JobListings';
import JobDetail from './components/JobDetail';
import PostJob from './components/PostJob';
import Auth from './components/Auth';
import ApplyForm from './components/ApplyForm';
import Notifications from './components/Notifications';
import EditJob from './components/EditJob';
import SeekerNotifications from './components/SeekerNotifications';
import { fetchJobs, deleteJob, logoutUser, fetchApplications, fetchSeekerApplications } from "./api";

// ── Navbar — uses NavLink for active URL highlighting ─────────
function Navbar({ user, onLogout, notificationCount, theme, onToggleTheme }) {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        {/* Link the logo back to /jobs */}
        <Link to="/jobs" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div className="navbar__logo">J</div>
          <span className="navbar__title">JobPortal</span>
        </Link>
        <span className="navbar__badge">React Router + Node + XML</span>
      </div>

      <div className="navbar__nav">
        {/* NavLink automatically adds "active" class when URL matches */}
        <NavLink
          to="/jobs"
          className={({ isActive }) => `btn btn-ghost ${isActive ? "active" : ""}`}
        >
          Browse Jobs
        </NavLink>

        {user?.role === "employer" && (
          <>
            <NavLink
              to="/post"
              className={({ isActive }) => `btn btn-ghost ${isActive ? "active" : ""}`}
            >
              Post a Job
            </NavLink>
            <NavLink
              to="/notifications"
              className={({ isActive }) => `btn btn-ghost ${isActive ? "active" : ""}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Notifications
              {notificationCount > 0 && (
                <span className="badge badge-red" style={{
                  padding: "2px 6px",
                  fontSize: 10,
                  borderRadius: "50%",
                  background: "var(--color-accent-red)",
                  color: "white",
                  lineHeight: 1
                }}>
                  {notificationCount}
                </span>
              )}
            </NavLink>
          </>
        )}

        {user?.role === "jobseeker" && (
          <NavLink
            to="/seeker-notifications"
            className={({ isActive }) => `btn btn-ghost ${isActive ? "active" : ""}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Notifications
            {notificationCount > 0 && (
              <span className="badge badge-red" style={{
                padding: "2px 6px",
                fontSize: 10,
                borderRadius: "50%",
                background: "var(--color-accent-red)",
                color: "white",
                lineHeight: 1
              }}>
                {notificationCount}
              </span>
            )}
          </NavLink>
        )}

        <NavLink
          to="/login"
          className={({ isActive }) => `btn btn-ghost ${isActive ? "active" : ""}`}
        >
          {user ? user.name : "Login"}
        </NavLink>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="btn btn-ghost"
          style={{
            padding: "8px 12px",
            fontSize: 18,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "var(--radius-sm)",
          }}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {user && (
        <button
          className="btn btn-secondary"
          style={{ padding: "6px 14px", fontSize: 13 }}
          onClick={onLogout}
        >
          Logout
        </button>
      )}
    </nav>
  );
}

// ── JobDetailPage wrapper — reads :id from URL ────────────────
function JobDetailPage({ jobs, user, appliedJobs, savedJobs, onToggleSave, onApply, onDelete, onEdit }) {
  const { id }    = useParams();           // reads /jobs/:id from URL
  const navigate  = useNavigate();
  const job       = jobs.find(j => j.id === id);

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

  return (
    <JobDetail
      job={job}
      onBack={() => navigate("/jobs")}         // navigate() changes URL to /jobs
      user={user}
      onNavigateAuth={() => navigate("/login")}
      appliedJobs={appliedJobs}
      savedJobs={savedJobs}
      onToggleSave={onToggleSave}
      onApply={onApply}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}

// ── Root App — state lives here, Router wraps everything ──────
function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── useState (stateBasics) ────────────────────────────────
  const [jobs,        setJobs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [user,        setUser]        = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs,   setSavedJobs]   = useState([]);
  const [loginAlert,  setLoginAlert]  = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("jp_theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jp_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  }, []);

  const fetchNotificationCount = useCallback(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }
    if (user.role === "employer") {
      fetchApplications()
        .then((res) => {
          if (res.success) {
            const count = res.data.filter(a => a.status === "Pending").length;
            setNotificationCount(count);
          }
        })
        .catch((err) => console.error("Error fetching count:", err));
    } else if (user.role === "jobseeker") {
      fetchSeekerApplications()
        .then((res) => {
          if (res.success) {
            const count = res.data.filter(a => a.status !== "Pending" && !a.isSeekerRead).length;
            setNotificationCount(count);
          }
        })
        .catch((err) => console.error("Error fetching count:", err));
    }
  }, [user]);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 15000);
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  const handleEditJob = useCallback((id) => {
    navigate(`/jobs/edit/${id}`);
  }, [navigate]);

  // ── useEffect: fetch session and jobs on mount ───────────
  useEffect(() => {
    // Decode JWT token on startup if it exists in localStorage
    const token = localStorage.getItem("jp_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id:    payload.id,
          email: payload.email,
          name:  payload.email.split("@")[0],
          role:  payload.role,
        });
      } catch (e) {
        localStorage.removeItem("jp_token");
      }
    }

    fetchJobs()
      .then(res => {
        if (res.success) {
          setJobs(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Clear applied status on logout
  useEffect(() => {
    if (!user) {
      setAppliedJobs([]);
    }
  }, [user]);

  // All users see all jobs (no approval phase)
  const visibleJobs = jobs;

  // ── Handlers ──────────────────────────────────────────────
  const handleSelectJob  = useCallback((job) => navigate(`/jobs/${job.id}`), [navigate]);
  const handleToggleSave = useCallback((id)  => setSavedJobs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]), []);

  const handleApply      = useCallback((id) => {
    navigate(`/apply/${id}`);
  }, [navigate]);

  const handleApplySuccess = useCallback((id) => {
    setAppliedJobs(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const reloadJobs = useCallback(() => {
    fetchJobs().then(res => {
      if (res.success) setJobs(res.data);
    });
  }, []);

  const handleJobPosted = useCallback(() => {
    reloadJobs();
  }, [reloadJobs]);

  const handleDeleteJob = useCallback(async (id) => {
    try {
      const res = await deleteJob(id);
      if (res.success) reloadJobs();
    } catch (err) {
      console.error("Failed to delete job", err);
    }
  }, [reloadJobs]);

  const handleLogin      = useCallback((userData) => { 
    setUser(userData); 
    setLoginAlert(`Welcome back, ${userData.name}! You have logged in successfully.`);
    setTimeout(() => setLoginAlert(""), 3500);
    navigate("/jobs"); 
  }, [navigate]);
  
  const handleLogout     = useCallback(() => {
    logoutUser();
    setUser(null);
    navigate("/jobs");
  }, [navigate]);

  return (
    <div>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        notificationCount={notificationCount} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />


      <div className="container page-padding">
        {loginAlert && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(10,10,14,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(6px)",
          }}>
            <div className="card" style={{
              maxWidth: 380,
              width: "90%",
              textAlign: "center",
              padding: "32px 24px",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--border-mid)",
              animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <h3 style={{ marginBottom: 8, color: "var(--color-primary-lt)" }}>Login Successful!</h3>
              <p style={{ marginBottom: 24, fontSize: 14, color: "var(--text-secondary)" }}>{loginAlert}</p>
              <button className="btn btn-primary btn-full" onClick={() => setLoginAlert("")}>
                Continue
              </button>
            </div>
          </div>
        )}
        <div key={location.pathname} className="page-transition">
          <Routes location={location}>
            {/* / → redirect to /jobs */}
            <Route path="/"         element={<Navigate to="/jobs" replace />} />

            {/* /jobs → Job Listings */}
            <Route path="/jobs" element={
              <JobListings
                jobs={visibleJobs}
                loading={loading}
                user={user}
                onSelectJob={handleSelectJob}
                appliedJobs={appliedJobs}
                savedJobs={savedJobs}
                onToggleSave={handleToggleSave}
                onDelete={handleDeleteJob}
              />
            } />

            {/* /jobs/:id → Job Detail (URL-driven) */}
            <Route path="/jobs/:id" element={
              <JobDetailPage
                jobs={visibleJobs}
                user={user}
                appliedJobs={appliedJobs}
                savedJobs={savedJobs}
                onToggleSave={handleToggleSave}
                onApply={handleApply}
                onDelete={handleDeleteJob}
                onEdit={handleEditJob}
              />
            } />

            {/* /apply/:id → Apply Form */}
            <Route path="/apply/:id" element={
              <ApplyForm
                user={user}
                onApplySuccess={handleApplySuccess}
              />
            } />

            {/* /notifications → Notifications dashboard */}
            <Route path="/notifications" element={
              <Notifications
                user={user}
                onRefreshNotificationCount={fetchNotificationCount}
              />
            } />

            {/* /seeker-notifications → Seeker Notifications */}
            <Route path="/seeker-notifications" element={
              <SeekerNotifications
                user={user}
                onRefreshNotificationCount={fetchNotificationCount}
              />
            } />

            {/* /jobs/edit/:id → Edit Job Form */}
            <Route path="/jobs/edit/:id" element={
              <EditJob
                user={user}
                onJobUpdated={reloadJobs}
                onNavigateAuth={() => navigate("/login")}
              />
            } />

            {/* /post → Post a Job */}
            <Route path="/post" element={
              <PostJob
                onJobPosted={handleJobPosted}
                user={user}
                onNavigateAuth={() => navigate("/login")}
              />
            } />

            {/* /login → Auth (login mode) */}
            <Route path="/login" element={
              <Auth
                mode="login"
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                appliedJobs={appliedJobs}
                savedJobs={savedJobs}
              />
            } />

            {/* /register → Auth (register mode) */}
            <Route path="/register" element={
              <Auth
                mode="register"
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
                appliedJobs={appliedJobs}
                savedJobs={savedJobs}
              />
            } />

            {/* 404 fallback */}
            <Route path="*" element={
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>404</div>
                <h2>Page not found</h2>
                <Link to="/jobs" className="btn btn-primary" style={{ display: "inline-flex", marginTop: 16 }}>
                  Go to Jobs
                </Link>
              </div>
            } />
          </Routes>
        </div>
      </div>

      <footer className="footer">
        <p className="footer__text">
          Built with
          <span style={{ color: "var(--color-primary)" }}> React.js</span> ·
          <span style={{ color: "var(--color-accent-teal)" }}> React Router v6</span> ·
          <span style={{ color: "#F7971E" }}> Node.js</span> ·
          <span style={{ color: "#EB3349" }}> XML</span> ·
          <span style={{ color: "var(--color-accent-pink)" }}> CSS</span> ·
          useState · useNavigate · useParams
        </p>
      </footer>
    </div>
  );
}

// ── Small helper: shows current pathname in the URL bar ───────
function CurrentPath() {
  // useNavigate gives us access to the router; we read location via window
  // In a real app use: const location = useLocation()
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    // Poll for React Router pushState changes
    const interval = setInterval(() => setPath(window.location.pathname), 100);
    return () => { window.removeEventListener("popstate", handler); clearInterval(interval); };
  }, []);
  return <span style={{ color: "#e8e8f0", fontWeight: 600 }}>{path}</span>;
}

// ── Wrap AppInner in BrowserRouter ────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
