const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  registerWorker,
  registerAdmin,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register/customer", registerCustomer);
router.post("/register/worker", registerWorker);
router.post("/register/admin", registerAdmin);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

module.exports = router;