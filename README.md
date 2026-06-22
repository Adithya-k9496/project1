# 🏢 Job Portal — Setup & Run Instructions

This guide provides step-by-step instructions on how to install, configure, and run the Full-Stack Job Portal application locally on your machine.

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed:
* **Node.js** (v16.0.0 or higher) — [Download Node.js](https://nodejs.org/)
* **MongoDB Atlas Account** (or a local MongoDB instance running)

---

## 🚀 Setup Instructions

Follow these 4 simple steps to get the project up and running:

### Step 1: Create the Environment Configuration (`.env`)
Since database credentials and JWT security secrets are kept private and are not uploaded to GitHub, you must create a configuration file manually:
1. Navigate into the `backend` folder.
2. Create a new file named `.env`.
3. Paste the following configuration, replacing the database connection string with your own **MongoDB Atlas URI**:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxx.mongodb.net/job_portal?retryWrites=true&w=majority
JWT_SECRET=jobportal_secret_key_2026
PORT=5000
```

---

### Step 2: Seed the Database (Optional but Recommended)
To pre-populate your MongoDB database with the initial job listings parsed from the legacy `jobs.xml` data source:
1. Open your terminal in the `backend` folder.
2. Run the seeding script:
   ```bash
   node seed.js
   ```
3. You should see a confirmation message: `🎉 Successfully seeded jobs in MongoDB!`

---

### Step 3: Install & Start the Backend Server
1. Open a terminal in the `backend` folder.
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
   *The server will start running at:* `http://localhost:5000`

---

### Step 4: Install & Start the Frontend React Client
1. Open a **new** terminal window/tab in the `frontend` folder.
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   *The client will open automatically in your browser at:* `http://localhost:3000` (or `http://localhost:5173` if running Vite)

---

## 📁 Project Directory Reference

This repository is organized into a clean client-server architecture:

```
project1/
├── backend/                  ← Express API Server
│   ├── models/               ← Mongoose schemas (User, Job, Application)
│   ├── uploads/              ← Directory for uploaded PDF resumes (static)
│   ├── .env                  ← (Create manually) Configuration file
│   ├── jobs.xml              ← Legacy XML data seed source
│   ├── seed.js               ← Seeder script (xml2js parsing)
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
