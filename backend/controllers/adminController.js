const db = require("../config/db");

const getAllBookings = (req, res) => {
  const sql = `
    SELECT 
      bookings.id,
      bookings.booking_date,
      bookings.address,
      bookings.notes,
      bookings.status,
      bookings.created_at,
      users.full_name,
      users.email,
      services.service_name,
      services.category,
      services.price
    FROM bookings
    JOIN users ON bookings.user_id = users.id
    JOIN services ON bookings.service_id = services.id
    ORDER BY bookings.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch all bookings",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
};

const updateBookingStatus = (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Status is required"
    });
  }

  const sql = `UPDATE bookings SET status = ? WHERE id = ?`;

  db.query(sql, [status, bookingId], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to update booking status",
        error: err.message
      });
    }

    res.status(200).json({
      message: "Booking status updated successfully"
    });
  });
};

const addService = (req, res) => {
  const { service_name, description, price, category } = req.body;

  if (!service_name || !price) {
    return res.status(400).json({
      message: "Service name and price are required"
    });
  }

  const sql = `
    INSERT INTO services (service_name, description, price, category)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [service_name, description || null, price, category || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add service",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Service added successfully",
        serviceId: result.insertId
      });
    }
  );
};

const updateService = (req, res) => {
  const serviceId = req.params.id;
  const { service_name, description, price, category } = req.body;

  if (!service_name || !price) {
    return res.status(400).json({
      message: "Service name and price are required"
    });
  }

  const sql = `
    UPDATE services
    SET service_name = ?, description = ?, price = ?, category = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [service_name, description || null, price, category || null, serviceId],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update service",
          error: err.message
        });
      }

      res.status(200).json({
        message: "Service updated successfully"
      });
    }
  );
};

const deleteService = (req, res) => {
  const serviceId = req.params.id;

  const sql = `DELETE FROM services WHERE id = ?`;

  db.query(sql, [serviceId], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete service",
        error: err.message
      });
    }

    res.status(200).json({
      message: "Service deleted successfully"
    });
  });
};

module.exports = {
  getAllBookings,
  updateBookingStatus,
  addService,
  updateService,
  deleteService
};