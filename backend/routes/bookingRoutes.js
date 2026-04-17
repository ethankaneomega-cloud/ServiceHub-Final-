const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/mine", protect, getMyBookings);
router.put("/cancel/:id", protect, cancelBooking);

module.exports = router;