const jwt = require("jsonwebtoken");
const db = require("../config/db");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    db.query(
      `
        SELECT
          id,
          full_name,
          email,
          role,
          approval_status,
          availability_status
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [decoded.id],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to verify user",
            error: err.message,
          });
        }

        if (!results.length) {
          return res.status(401).json({
            message: "Not authorized, user no longer exists",
          });
        }

        req.user = results[0];
        next();
      }
    );
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

const roleIn = (allowedRoles = []) => {
  const normalizedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (!normalizedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient role access",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  roleIn,
};