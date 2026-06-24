# 🏢 Job Portal — Setup & Run Instructions

This guide provides step-by-step instructions on how to install, configure, and run the Full-Stack Job Portal application locally on your machine.

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed:
* **Node.js** (v16.0.0 or higher) — [Download Node.js](https://nodejs.org/)
* **MongoDB Account** (Optional — only required for cloud database mode)

---

## ⚡ Execution Modes (MongoDB vs. Local Mode)

The backend features a **hybrid database fallback engine** that automatically determines how data is read and written based on your environment variables:

1. **Local Mode (Default / Offline):** If `MONGODB_URI` is missing or commented out in your `.env` file, the server launches in Local Mode. It initializes jobs from `jobs.xml` and saves all changes (registered users, new jobs, submitted applications) directly to local JSON files under `backend/data/`. No database installation is required!
2. **MongoDB Mode:** If `MONGODB_URI` is provided, the server connects to your cloud MongoDB Atlas cluster and uses Mongoose collections.

---

## 🚀 Setup Instructions

### Step 1: Create the Environment Configuration (`.env`)
1. Navigate into the `backend` folder.
2. Create a new file named `.env`.
3. Add the following parameters:

```env
# Optional: Provide a connection string to connect to MongoDB. 
# If left blank, the app will run in Local Mode (offline JSON storage).
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxx.mongodb.net/job_portal?retryWrites=true&w=majority

JWT_SECRET=jobportal_secret_key_2026
PORT=5000
```

---

### Step 2: Seed the Database (MongoDB Mode Only)
If you are running in **MongoDB Mode** and want to populate your cloud database with the initial job listings parsed from the legacy `jobs.xml` file:
1. Open your terminal in the `backend` folder.
2. Run the seeding script:
   ```bash
   node seed.js
   ```
3. You should see a confirmation message: `🎉 Successfully seeded jobs in MongoDB!`

*(Note: In Local Mode, this seeding step is automatic on first launch).*

---

### Step 3: Install & Start the Backend Server
1. Open a terminal in the `backend` folder.
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the Express server (development mode):
   ```bash
   npm run dev
   ```
   *The server will start running at:* `http://localhost:5000`

---

### Step 4: Install & Start the Frontend React Client
1. Open a **new** terminal window/tab in the `frontend` folder.
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server (development mode):
   ```bash
   npm run dev
   ```
   *The client will open automatically in your browser at:* `http://localhost:3000`

---

## 📁 Project Directory Reference

This repository is organized into a clean client-server architecture:

```
project1/
├── backend/                  ← Express API Server
│   ├── data/                 ← (Auto-generated in Local Mode) JSON storage files
│   │   ├── jobs_local.json
│   │   ├── users_local.json
│   │   └── applications_local.json
│   ├── models/               ← Mongoose schemas (used in MongoDB Mode)
│   ├── uploads/              ← Directory for uploaded PDF resumes (static)
│   ├── .env                  ← (Create manually) Configuration file
│   ├── jobs.xml              ← Legacy XML data seed source
│   ├── seed.js               ← Seeder script (for MongoDB initialization)
│   └── server.js             ← Express main entry point
│
└── frontend/                 ← React.js SPA Client
    ├── src/
    │   ├── components/       ← React UI Components (Auth, JobListings, ApplyForm, etc.)
    │   ├── api.js            ← Connection layer (fetch calls to backend)
    │   ├── App.jsx           ← Main Router & State logic
    │   └── global.css        ← Design System (Dark/Light theme CSS variables)
    └── package.json          ← Dependencies declaration
```

---
*Guide compiled for the Job Portal Project. Happy coding!*
