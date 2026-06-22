// =============================================================
//  FRONTEND COMPONENT: components/Auth.jsx
//  Login and Register — now URL-driven via React Router.
//
//  Routes:
//    /login    → renders login form  (mode="login")
//    /register → renders register form (mode="register")
//
//  useState:
//    authForm    → controlled input fields
//    authLoading → spinner during API call
//    authError   → error message display
// =============================================================

import { useState, useEffect } from "react";
import { Link, useNavigate }   from "react-router-dom";
import { loginUser, registerUser } from "../api";

const INITIAL_FORM = { name: "", email: "", password: "", role: "jobseeker" };

export default function Auth({ mode, user, onLogin, onLogout, appliedJobs, savedJobs }) {
  const navigate = useNavigate();

  // ── useState (stateBasics) ────────────────────────────────
  const [authForm,    setAuthForm]    = useState(INITIAL_FORM);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError,   setAuthError]   = useState("");

  // Reset form whenever the route switches between /login and /register
  useEffect(() => {
    setAuthForm(INITIAL_FORM);
    setAuthError("");
  }, [mode]);

  const updateForm = (key, val) =>
    setAuthForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!authForm.email || !authForm.password) {
      setAuthError("Please fill in all fields"); return;
    }
    if (mode === "register" && !authForm.name) {
      setAuthError("Full name is required"); return;
    }
    if (authForm.password.length < 6) {
      setAuthError("Password must be at least 6 characters"); return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      let data;
      if (mode === "register") {
        data = await registerUser({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          role: authForm.role
        });
      } else {
        data = await loginUser(authForm.email, authForm.password);
      }

      if (data.success) {
        onLogin(data.user);  // lifts state to App → also navigates to /jobs
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (err) {
      setAuthError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Logged-in dashboard view ──────────────────────────────
  if (user) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          width: 72, height: 72,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent-pink))",
          borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px",
          fontSize: 30, fontWeight: 800, color: "#fff",
        }}>
          {user.name[0].toUpperCase()}
        </div>
        <h2 style={{ marginBottom: 6 }}>Hey, {user.name}! 👋</h2>
        <p>{user.role === "employer" ? "Post jobs and manage listings." : "You're logged in and ready to apply."}</p>

        {user.role !== "employer" && (
          <div className="grid-2" style={{ marginTop: 24, marginBottom: 24 }}>
            <div className="stat-card" style={{ textAlign: "left" }}>
              <div className="stat-card__value" style={{ color: "var(--color-accent-teal)" }}>{appliedJobs.length}</div>
              <div className="stat-card__label">Jobs Applied</div>
            </div>
            <div className="stat-card" style={{ textAlign: "left" }}>
              <div className="stat-card__value" style={{ color: "var(--color-accent-gold)" }}>{savedJobs.length}</div>
              <div className="stat-card__label">Jobs Saved</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {/* Link navigates to /jobs — URL changes in browser */}
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          <button className="btn btn-secondary" onClick={onLogout}>Log Out</button>
        </div>

       
      </div>
    );
  }

  // ── Login / Register Form ─────────────────────────────────
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p style={{ marginTop: 6 }}>
          {mode === "login"
            ? "Sign in to apply for jobs and track applications"
            : "Join thousands of professionals on JobPortal"}
        </p>
      </div>

      {/* Route-based toggle — clicking changes URL */}
      <div className="auth-toggle">
        <Link
          to="/login"
          className={`auth-toggle__btn ${mode === "login" ? "active" : ""}`}
          style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          Login
        </Link>
        <Link
          to="/register"
          className={`auth-toggle__btn ${mode === "register" ? "active" : ""}`}
          style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          Register
        </Link>
      </div>

      <div className="card">
        {mode === "register" && (
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Full Name</label>
            <input className="input" placeholder="John Doe"
              value={authForm.name} onChange={e => updateForm("name", e.target.value)} />
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={authForm.email} onChange={e => updateForm("email", e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: mode === "register" ? 16 : 20 }}>
          <label className="form-label">Password</label>
          <input className="input" type="password" placeholder="Min. 6 characters"
            value={authForm.password} onChange={e => updateForm("password", e.target.value)} />
        </div>

        {mode === "register" && (
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">I am a</label>
            <select className="select" value={authForm.role} onChange={e => updateForm("role", e.target.value)}>
              <option value="jobseeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>
        )}

        {authError && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>{authError}</div>
        )}

        <button className="btn btn-primary btn-full" disabled={authLoading} onClick={handleSubmit}>
          {authLoading ? "Processing..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        {mode === "login" && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: "var(--bg-overlay)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            fontSize: 12,
            color: "var(--text-secondary)",
            textAlign: "left"
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "var(--color-primary-lt)" }}>🔑 Default Demo Accounts:</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span><strong>Job Seeker:</strong> user@gmail.com</span>
              <span><strong>Password:</strong> user1234</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span><strong>Employer:</strong> employer@gmail.com</span>
              <span><strong>Password:</strong> employer1234</span>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 14, fontSize: 13 }}>
          {mode === "login"
            ? <> Don't have an account? <Link to="/register">Register here</Link> </>
            : <> Already have an account? <Link to="/login">Login here</Link> </>
          }
        </p>
        <p style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "var(--text-faint)" }}>
          Tip: any email + 6+ character password
        </p>
      </div>

    </div>
  );
}
