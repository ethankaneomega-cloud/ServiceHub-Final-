const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  updateBookingStatus,
  addService,
  updateService,
  deleteService
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/bookings", protect, adminOnly, getAllBookings);
router.put("/bookings/:id", protect, adminOnly, updateBookingStatus);

router.post("/services", protect, adminOnly, addService);
router.put("/services/:id", protect, adminOnly, updateService);
router.delete("/services/:id", protect, adminOnly, deleteService);

module.exports = router;