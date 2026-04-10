const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

const registerUser = async (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  if (full_name.trim().length < 2) {
    return res.status(400).json({ message: "Full name must be at least 2 characters" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(
        sql,
        [full_name.trim(), email.trim(), hashedPassword, role || "customer"],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: "Failed to register user", error: err.message });
          }

          res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  });
};

module.exports = { registerUser, loginUser };