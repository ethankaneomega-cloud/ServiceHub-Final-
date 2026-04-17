const db = require("../config/db");

const BOOKING_TABLE = "bookings";

const CEBU_LOCATIONS = [
  "Cebu City",
  "Mandaue City",
  "Lapu-Lapu City",
  "Talisay City",
  "Naga City, Cebu",
  "Carcar City",
  "Danao City",
  "Toledo City",
  "Minglanilla",
  "Consolacion",
  "Liloan",
  "Cordova",
  "Compostela",
  "San Fernando",
  "Tayud",
];

const createBooking = (req, res) => {
  const userId = req.user.id;
  const {
    service_id,
    booking_date,
    cebu_location,
    address_detail,
    phone_number,
    notes,
  } = req.body;

  if (!service_id || !booking_date || !cebu_location || !address_detail || !phone_number) {
    return res.status(400).json({
      message: "Please fill in all required fields",
    });
  }

  if (!CEBU_LOCATIONS.includes(cebu_location)) {
    return res.status(400).json({
      message: "Please select a valid Cebu location",
    });
  }

  const today = new Date().toISOString().split("T")[0];
  if (booking_date < today) {
    return res.status(400).json({
      message: "Booking date cannot be in the past",
    });
  }

  if (String(address_detail).trim().length < 5) {
    return res.status(400).json({
      message: "Please enter a valid detailed address",
    });
  }

  const cleanedPhone = String(phone_number).replace(/[^\d+]/g, "");
  if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
    return res.status(400).json({
      message: "Please enter a valid phone number",
    });
  }

  const fullAddress = `${cebu_location} - ${String(address_detail).trim()}`;

  const checkServiceSql = `
    SELECT id, service_name
    FROM services
    WHERE id = ? AND is_active = 1
  `;

  db.query(checkServiceSql, [service_id], (serviceErr, serviceResults) => {
    if (serviceErr) {
      return res.status(500).json({
        message: "Failed to verify service",
        error: serviceErr.message,
      });
    }

    if (serviceResults.length === 0) {
      return res.status(404).json({
        message: "Selected service does not exist or is inactive",
      });
    }

    const sql = `
      INSERT INTO ${BOOKING_TABLE}
      (user_id, service_id, booking_date, address, phone_number, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [userId, service_id, booking_date, fullAddress, cleanedPhone, notes || null],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to create booking",
            error: err.message,
          });
        }

        return res.status(201).json({
          message: "Booking created successfully",
          bookingId: result.insertId,
        });
      }
    );
  });
};

const getMyBookings = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      bookings.id,
      bookings.booking_date,
      bookings.address,
      bookings.phone_number,
      bookings.notes,
      bookings.status,
      bookings.created_at,
      services.service_name,
      services.category,
      services.price,
      services.image_url
    FROM ${BOOKING_TABLE} AS bookings
    JOIN services ON bookings.service_id = services.id
    WHERE bookings.user_id = ?
    ORDER BY bookings.id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch bookings",
        error: err.message,
      });
    }

    return res.status(200).json(results);
  });
};

const cancelBooking = (req, res) => {
  const userId = req.user.id;
  const bookingId = req.params.id;

  const findSql = `
    SELECT *
    FROM ${BOOKING_TABLE}
    WHERE id = ? AND user_id = ?
  `;

  db.query(findSql, [bookingId, userId], (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        message: "Failed to check booking",
        error: findErr.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (results[0].status === "Completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled",
      });
    }

    if (results[0].status === "Cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    const sql = `
      UPDATE ${BOOKING_TABLE}
      SET status = 'Cancelled'
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [bookingId, userId], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to cancel booking",
          error: err.message,
        });
      }

      return res.status(200).json({
        message: "Booking cancelled successfully",
      });
    });
  });
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};