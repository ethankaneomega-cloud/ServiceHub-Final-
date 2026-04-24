const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status || "approved",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

const sanitizeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  approval_status: user.approval_status,
});

const findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email], callback);
};

const registerCustomer = async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      message: "Full name, email, and password are required",
    });
  }

  findUserByEmail(email, async (findErr, existingUsers) => {
    if (findErr) {
      return res.status(500).json({
        message: "Failed to check existing user",
        error: findErr.message,
      });
    }

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        `
          INSERT INTO users
          (full_name, email, password, role, approval_status)
          VALUES (?, ?, ?, 'customer', 'approved')
        `,
        [full_name, email, hashedPassword],
        (insertErr, result) => {
          if (insertErr) {
            return res.status(500).json({
              message: "Failed to register user",
              error: insertErr.message,
            });
          }

          return res.status(201).json({
            message: "User account created successfully",
            userId: result.insertId,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({
        message: "Failed to secure password",
        error: error.message,
      });
    }
  });
};

const registerWorker = async (req, res) => {
  const {
    full_name,
    email,
    password,
    credentials_summary,
    document_links,
    service_category,
    valid_id_image,
    worker_documents,
  } = req.body;

  if (
    !full_name ||
    !email ||
    !password ||
    !credentials_summary ||
    !service_category ||
    !valid_id_image ||
    !worker_documents
  ) {
    return res.status(400).json({
      message: "Please complete all required worker registration fields",
    });
  }

  findUserByEmail(email, async (findErr, existingUsers) => {
    if (findErr) {
      return res.status(500).json({
        message: "Failed to check existing user",
        error: findErr.message,
      });
    }

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        `
          INSERT INTO users
          (
            full_name,
            email,
            password,
            role,
            approval_status,
            credentials_summary,
            document_links,
            service_category,
            valid_id_image,
            worker_documents,
            availability_status
          )
          VALUES (?, ?, ?, 'worker', 'pending', ?, ?, ?, ?, ?, 'unavailable')
        `,
        [
          full_name,
          email,
          hashedPassword,
          credentials_summary,
          document_links || null,
          service_category,
          valid_id_image,
          worker_documents,
        ],
        (insertErr, result) => {
          if (insertErr) {
            return res.status(500).json({
              message: "Failed to submit worker application",
              error: insertErr.message,
            });
          }

          return res.status(201).json({
            message:
              "Worker application submitted successfully. Please wait for admin review.",
            userId: result.insertId,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({
        message: "Failed to secure password",
        error: error.message,
      });
    }
  });
};

const registerAdmin = async (req, res) => {
  const { full_name, email, password, credentials_summary, document_links } = req.body;

  if (!full_name || !email || !password || !credentials_summary) {
    return res.status(400).json({
      message: "Please complete all required admin registration fields",
    });
  }

  findUserByEmail(email, async (findErr, existingUsers) => {
    if (findErr) {
      return res.status(500).json({
        message: "Failed to check existing user",
        error: findErr.message,
      });
    }

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        `
          INSERT INTO users
          (
            full_name,
            email,
            password,
            role,
            approval_status,
            credentials_summary,
            document_links
          )
          VALUES (?, ?, ?, 'admin', 'pending', ?, ?)
        `,
        [full_name, email, hashedPassword, credentials_summary, document_links || null],
        (insertErr, result) => {
          if (insertErr) {
            return res.status(500).json({
              message: "Failed to submit admin application",
              error: insertErr.message,
            });
          }

          return res.status(201).json({
            message:
              "Admin application submitted successfully. Higher-up approval is required.",
            userId: result.insertId,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({
        message: "Failed to secure password",
        error: error.message,
      });
    }
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  findUserByEmail(email, async (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        message: "Failed to find user",
        error: findErr.message,
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = results[0];

    try {
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      if (user.role === "admin" && user.approval_status !== "approved") {
        if (user.approval_status === "pending") {
          return res.status(403).json({
            message: "Admin account is still pending approval",
          });
        }

        if (user.approval_status === "rejected") {
          return res.status(403).json({
            message: user.approval_notes || "Admin application was rejected",
          });
        }

        if (user.approval_status === "needs_resubmission") {
          return res.status(403).json({
            message: user.approval_notes || "Admin application needs resubmission",
          });
        }
      }

      if (user.role === "worker" && user.approval_status !== "approved") {
        if (user.approval_status === "pending") {
          return res.status(403).json({
            message: "Worker account is still pending approval",
          });
        }

        if (user.approval_status === "rejected") {
          return res.status(403).json({
            message: user.approval_notes || "Worker application was rejected",
          });
        }

        if (user.approval_status === "needs_resubmission") {
          return res.status(403).json({
            message: user.approval_notes || "Worker application needs resubmission",
          });
        }
      }

      const token = signToken(user);

      return res.status(200).json({
        message: "Login successful",
        token,
        user: sanitizeUser(user),
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to verify password",
        error: error.message,
      });
    }
  });
};

const getCurrentUser = (req, res) => {
  return res.status(200).json({
    user: sanitizeUser(req.user),
  });
};

module.exports = {
  registerCustomer,
  registerWorker,
  registerAdmin,
  loginUser,
  getCurrentUser,
};