const express = require("express");
const router = express.Router();

const {
  getPendingUsers,
  approveUser,
  rejectUser,
  requestResubmission,
  getAllBookings,
  updateBookingStatus,
  getAllServicesAdmin,
  addService,
  updateService,
  deleteService,
} = require("../controllers/adminController");

const { protect, roleIn } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({ message: "admin test route works" });
});

router.get("/users/pending", protect, roleIn(["admin", "super_admin"]), getPendingUsers);
router.put("/users/:id/approve", protect, roleIn(["admin", "super_admin"]), approveUser);
router.put("/users/:id/reject", protect, roleIn(["admin", "super_admin"]), rejectUser);
router.put(
  "/users/:id/resubmission",
  protect,
  roleIn(["admin", "super_admin"]),
  requestResubmission
);

router.get("/bookings", protect, roleIn(["admin", "super_admin"]), getAllBookings);
router.put("/bookings/:id", protect, roleIn(["admin", "super_admin"]), updateBookingStatus);

router.get("/services", protect, roleIn(["admin", "super_admin"]), getAllServicesAdmin);
router.post("/services", protect, roleIn(["admin", "super_admin"]), addService);
router.put("/services/:id", protect, roleIn(["admin", "super_admin"]), updateService);
router.delete("/services/:id", protect, roleIn(["admin", "super_admin"]), deleteService);

module.exports = router;