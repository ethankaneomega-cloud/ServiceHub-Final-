const express = require("express");
const router = express.Router();

const {
  getWorkerDashboard,
  updateAvailability,
  updateWorkerProfile,
  acceptOpenJob,
  updateWorkerJobStatus,
} = require("../controllers/workerController");

const { protect, roleIn } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, roleIn(["worker"]), getWorkerDashboard);
router.put("/availability", protect, roleIn(["worker"]), updateAvailability);
router.put("/profile", protect, roleIn(["worker"]), updateWorkerProfile);
router.put("/jobs/:id/accept", protect, roleIn(["worker"]), acceptOpenJob);
router.put("/jobs/:id/status", protect, roleIn(["worker"]), updateWorkerJobStatus);

module.exports = router;