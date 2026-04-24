const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const workerRoutes = require("./routes/workerRoutes");

const app = express();

const normalizeOrigin = (value) => {
  if (!value) return "";
  return String(value).replace(/\/+$/, "");
};

const explicitAllowedOrigins = [
  "http://localhost:3000",
  "https://servicehubeko.vercel.app",
  "https://servicehubeko1.vercel.app",
  normalizeOrigin(process.env.FRONTEND_URL),
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const cleanOrigin = normalizeOrigin(origin);

  if (explicitAllowedOrigins.includes(cleanOrigin)) {
    return true;
  }

  if (cleanOrigin.endsWith(".vercel.app")) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/", (req, res) => {
  res.send("ServiceHub backend is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ServiceHub API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/worker", workerRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  return res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});