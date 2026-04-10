const db = require("../config/db");

const createBooking = (req, res) => {
  const { user_id, service_id, booking_date, address, notes } = req.body;

  if (!user_id || !service_id || !booking_date || !address) {
    return res.status(400).json({
      message: "Please fill in all required fields"
    });
  }

  const today = new Date().toISOString().split("T")[0];
  if (booking_date < today) {
    return res.status(400).json({
      message: "Booking date cannot be in the past"
    });
  }

  if (String(address).trim().length < 5) {
    return res.status(400).json({
      message: "Please enter a valid address"
    });
  }

  const checkServiceSql = `SELECT * FROM services WHERE id = ?`;
  db.query(checkServiceSql, [service_id], (serviceErr, serviceResults) => {
    if (serviceErr) {
      return res.status(500).json({
        message: "Failed to verify service",
        error: serviceErr.message
      });
    }

    if (serviceResults.length === 0) {
      return res.status(404).json({
        message: "Selected service does not exist"
      });
    }

    const sql = `
      INSERT INTO bookings (user_id, service_id, booking_date, address, notes)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, service_id, booking_date, address.trim(), notes || null], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to create booking",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Booking created successfully",
        bookingId: result.insertId
      });
    });
  });
};

const getUserBookings = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      bookings.id,
      bookings.booking_date,
      bookings.address,
      bookings.notes,
      bookings.status,
      bookings.created_at,
      services.service_name,
      services.category,
      services.price
    FROM bookings
    JOIN services ON bookings.service_id = services.id
    WHERE bookings.user_id = ?
    ORDER BY bookings.id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch bookings",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
};

const cancelBooking = (req, res) => {
  const bookingId = req.params.id;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const findSql = `SELECT * FROM bookings WHERE id = ? AND user_id = ?`;
  db.query(findSql, [bookingId, user_id], (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        message: "Failed to check booking",
        error: findErr.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (results[0].status === "Completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled"
      });
    }

    const sql = `UPDATE bookings SET status = 'Cancelled' WHERE id = ? AND user_id = ?`;
    db.query(sql, [bookingId, user_id], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to cancel booking",
          error: err.message
        });
      }

      res.status(200).json({
        message: "Booking cancelled successfully"
      });
    });
  });
};

module.exports = { createBooking, getUserBookings, cancelBooking };