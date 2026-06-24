const express    = require("express");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const dataService = require("./dataService");

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "jobportal_secret_key_2026";

// ── Helper: Generate JWT Token ────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ── Helper: Strip password before sending user object ─────────
function safeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  const { password, __v, ...rest } = obj;
  return rest;
}

// ── POST /api/auth/register ───────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existing = await dataService.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    // Hash password with bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = await dataService.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || "jobseeker",
    });

    // Generate JWT
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: safeUser(newUser),
    });
  } catch (err) {
    console.error("[POST /api/auth/register]", err.message);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // Find user by email
    let user = await dataService.getUserByEmail(email);

    // Auto-create user in MongoDB on first login if they don't exist (to support the 'any email' UI tip)
    if (!user) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const namePart = email.split("@")[0];
      const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      
      user = await dataService.createUser({
        name: capitalizedName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: email.toLowerCase().includes("employer") ? "employer" : "jobseeker",
      });
    }

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err.message);
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

module.exports = router;
