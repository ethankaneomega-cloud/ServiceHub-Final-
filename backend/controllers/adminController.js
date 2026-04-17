const db = require("../config/db");

const BOOKING_TABLE = "bookings";

const VALID_BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

const canReviewRole = (reviewerRole, targetRole) => {
  if (reviewerRole === "super_admin") {
    return targetRole === "admin" || targetRole === "worker";
  }

  if (reviewerRole === "admin") {
    return targetRole === "worker";
  }

  return false;
};

const getPendingUsers = (req, res) => {
  let sql = `
    SELECT
      id,
      full_name,
      email,
      role,
      approval_status,
      approval_notes,
      credentials_summary,
      document_links,
      service_category,
      valid_id_image,
      worker_documents,
      availability_status,
      created_at
    FROM users
    WHERE approval_status IN ('pending', 'needs_resubmission')
  `;

  if (req.user.role === "admin") {
    sql += ` AND role = 'worker'`;
  } else {
    sql += ` AND role IN ('worker', 'admin')`;
  }

  sql += ` ORDER BY id DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch pending users",
        error: err.message,
      });
    }

    return res.status(200).json(results);
  });
};

const approveUser = (req, res) => {
  const userId = req.params.id;
  const { approval_notes } = req.body;

  db.query(
    "SELECT id, role FROM users WHERE id = ?",
    [userId],
    (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          message: "Failed to fetch user",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const targetUser = results[0];

      if (!canReviewRole(req.user.role, targetUser.role)) {
        return res.status(403).json({
          message: "You are not allowed to approve this type of account",
        });
      }

      const sql = `
        UPDATE users
        SET
          approval_status = 'approved',
          approval_notes = ?,
          approved_by = ?,
          approved_at = NOW(),
          availability_status = CASE
            WHEN role = 'worker' THEN 'unavailable'
            ELSE availability_status
          END
        WHERE id = ?
      `;

      db.query(sql, [approval_notes || null, req.user.id, userId], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            message: "Failed to approve user",
            error: updateErr.message,
          });
        }

        return res.status(200).json({
          message: `${targetUser.role} approved successfully`,
        });
      });
    }
  );
};

const rejectUser = (req, res) => {
  const userId = req.params.id;
  const { approval_notes } = req.body;

  db.query(
    "SELECT id, role FROM users WHERE id = ?",
    [userId],
    (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          message: "Failed to fetch user",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const targetUser = results[0];

      if (!canReviewRole(req.user.role, targetUser.role)) {
        return res.status(403).json({
          message: "You are not allowed to reject this type of account",
        });
      }

      const sql = `
        UPDATE users
        SET
          approval_status = 'rejected',
          approval_notes = ?,
          approved_by = ?,
          approved_at = NOW(),
          availability_status = 'unavailable'
        WHERE id = ?
      `;

      db.query(sql, [approval_notes || null, req.user.id, userId], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            message: "Failed to reject user",
            error: updateErr.message,
          });
        }

        return res.status(200).json({
          message: `${targetUser.role} rejected successfully`,
        });
      });
    }
  );
};

const requestResubmission = (req, res) => {
  const userId = req.params.id;
  const { approval_notes } = req.body;

  db.query(
    "SELECT id, role FROM users WHERE id = ?",
    [userId],
    (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          message: "Failed to fetch user",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const targetUser = results[0];

      if (!canReviewRole(req.user.role, targetUser.role)) {
        return res.status(403).json({
          message: "You are not allowed to request resubmission for this account",
        });
      }

      const sql = `
        UPDATE users
        SET
          approval_status = 'needs_resubmission',
          approval_notes = ?,
          approved_by = ?,
          approved_at = NOW(),
          availability_status = 'unavailable'
        WHERE id = ?
      `;

      db.query(
        sql,
        [approval_notes || "Please resubmit missing requirements.", req.user.id, userId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              message: "Failed to request resubmission",
              error: updateErr.message,
            });
          }

          return res.status(200).json({
            message: `${targetUser.role} marked as needs resubmission`,
          });
        }
      );
    }
  );
};

const getAllBookings = (req, res) => {
  const sql = `
    SELECT
      bookings.id,
      bookings.booking_date,
      bookings.address,
      bookings.phone_number,
      bookings.notes,
      bookings.status,
      bookings.worker_job_status,
      bookings.worker_notes,
      bookings.worker_id,
      bookings.rating,
      bookings.review_text,
      bookings.created_at,
      users.full_name,
      users.email,
      services.service_name,
      services.category,
      services.price,
      services.image_url,
      worker.full_name AS worker_name,
      worker.email AS worker_email,
      worker.service_category AS worker_service_category
    FROM ${BOOKING_TABLE} AS bookings
    JOIN users ON bookings.user_id = users.id
    JOIN services ON bookings.service_id = services.id
    LEFT JOIN users AS worker ON bookings.worker_id = worker.id
    ORDER BY bookings.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch all bookings",
        error: err.message,
      });
    }

    return res.status(200).json(results);
  });
};

const updateBookingStatus = (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  if (!VALID_BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid booking status" });
  }

  const sql = `
    UPDATE ${BOOKING_TABLE}
    SET
      status = ?,
      worker_job_status = CASE
        WHEN ? = 'Completed' THEN 'Completed'
        WHEN ? = 'Cancelled' THEN 'Cancelled'
        ELSE worker_job_status
      END,
      completed_at = CASE
        WHEN ? = 'Completed' THEN NOW()
        ELSE completed_at
      END
    WHERE id = ?
  `;

  db.query(sql, [status, status, status, status, bookingId], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to update booking status",
        error: err.message,
      });
    }

    return res.status(200).json({
      message: "Booking status updated successfully",
    });
  });
};

const getAllServicesAdmin = (req, res) => {
  const sql = `
    SELECT *
    FROM services
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch services",
        error: err.message,
      });
    }

    return res.status(200).json(results);
  });
};

const addService = (req, res) => {
  const {
    service_name,
    description,
    price,
    category,
    image_url,
    is_active,
  } = req.body;

  if (!service_name || !price) {
    return res.status(400).json({
      message: "Service name and price are required",
    });
  }

  const sql = `
    INSERT INTO services
    (service_name, description, price, category, image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      service_name,
      description || null,
      price,
      category || null,
      image_url || null,
      is_active === 0 || is_active === false ? 0 : 1,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add service",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Service added successfully",
        serviceId: result.insertId,
      });
    }
  );
};

const updateService = (req, res) => {
  const serviceId = req.params.id;
  const {
    service_name,
    description,
    price,
    category,
    image_url,
    is_active,
  } = req.body;

  if (!service_name || !price) {
    return res.status(400).json({
      message: "Service name and price are required",
    });
  }

  const sql = `
    UPDATE services
    SET
      service_name = ?,
      description = ?,
      price = ?,
      category = ?,
      image_url = ?,
      is_active = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      service_name,
      description || null,
      price,
      category || null,
      image_url || null,
      is_active === 0 || is_active === false ? 0 : 1,
      serviceId,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update service",
          error: err.message,
        });
      }

      return res.status(200).json({
        message: "Service updated successfully",
      });
    }
  );
};

const deleteService = (req, res) => {
  const serviceId = req.params.id;

  db.query("DELETE FROM services WHERE id = ?", [serviceId], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete service",
        error: err.message,
      });
    }

    return res.status(200).json({
      message: "Service deleted successfully",
    });
  });
};

module.exports = {
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
};