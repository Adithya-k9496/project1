// =============================================================
//  FRONTEND SERVICE: services/api.js
//  Connects the React frontend to the Node.js/Express backend.
//
//  All fetch calls hit: http://localhost:5000/api/...
//  Swap BASE_URL for your deployed backend in production.
// =============================================================

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ── Helper: attach JWT token to authenticated requests ────────
function authHeaders() {
  const token = localStorage.getItem("jp_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Helper: handle fetch response ────────────────────────────
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Jobs API ──────────────────────────────────────────────────

/**
 * GET /api/jobs
 * Fetches all jobs from the Node.js backend (which reads jobs.xml).
 * @param {Object} filters - { search, category, type, location }
 */
export async function fetchJobs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search)   params.set("search",   filters.search);
  if (filters.category && filters.category !== "All") params.set("category", filters.category);
  if (filters.type     && filters.type     !== "All") params.set("type",     filters.type);
  if (filters.location) params.set("location", filters.location);

  const url = `${BASE_URL}/jobs${params.toString() ? "?" + params : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * GET /api/jobs/:id
 * Fetches a single job by ID.
 */
export async function fetchJobById(id) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

/**
 * POST /api/jobs
 * Posts a new job. Requires auth token (employer role).
 * @param {Object} jobData - { title, company, location, type, category, salary, description }
 */
export async function postJob(jobData) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify(jobData),
  });
  return handleResponse(res);
}

// ── Auth API ──────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {{ success, token, user }}
 */
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data.token) localStorage.setItem("jp_token", data.token);
  return data;
}

/**
 * POST /api/auth/register
 * @param {{ name, email, password, role }} userData
 * @returns {{ success, token, user }}
 */
export async function registerUser(userData) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(userData),
  });
  const data = await handleResponse(res);
  if (data.token) localStorage.setItem("jp_token", data.token);
  return data;
}

/**
 * Logout — removes JWT from localStorage
 */
export function logoutUser() {
  localStorage.removeItem("jp_token");
}

/**
 * DELETE /api/jobs/:id
 * Deletes a job listing.
 */
export async function deleteJob(id) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * POST /api/applications
 * Submits a candidate job application with details and file upload (FormData).
 * @param {FormData} formData
 */
export async function submitApplication(formData) {
  const token = localStorage.getItem("jp_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleResponse(res);
}

/**
 * GET /api/applications
 * Fetches all candidate submissions. Requires employer authorization.
 */
export async function fetchApplications() {
  const token = localStorage.getItem("jp_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}/applications`, {
    headers,
  });
  return handleResponse(res);
}

/**
 * PUT /api/jobs/:id
 * Updates an existing job listing.
 */
export async function updateJob(id, jobData) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(jobData),
  });
  return handleResponse(res);
}

/**
 * PUT /api/applications/:id/status
 * Updates the status of an application.
 */
export async function updateApplicationStatus(id, status) {
  const token = localStorage.getItem("jp_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}/applications/${id}/status`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

/**
 * DELETE /api/applications/:id
 * Deletes a candidate notification.
 */
export async function deleteApplication(id) {
  const token = localStorage.getItem("jp_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE_URL}/applications/${id}`, {
    method: "DELETE",
    headers,
  });
  return handleResponse(res);
}

/**
 * GET /api/applications/seeker
 * Fetches applications submitted by the logged-in seeker.
 */
export async function fetchSeekerApplications() {
  const token = localStorage.getItem("jp_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}/applications/seeker`, {
    headers,
  });
  return handleResponse(res);
}

/**
 * PUT /api/applications/seeker/read
 * Marks all notification updates as read for the seeker.
 */
export async function markSeekerNotificationsAsRead() {
  const token = localStorage.getItem("jp_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE_URL}/applications/seeker/read`, {
    method: "PUT",
    headers,
  });
  return handleResponse(res);
}



