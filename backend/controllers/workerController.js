const db = require("../config/db");

const BOOKING_TABLE = "bookings";

const parseDocuments = (value) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ name: item, data: item }));
  }

  return [];
};

const getWorkerDashboard = (req, res) => {
  const workerId = req.user.id;

  const workerSql = `
    SELECT
      id,
      full_name,
      email,
      role,
      approval_status,
      approval_notes,
      credentials_summary,
      service_category,
      valid_id_image,
      worker_documents,
      availability_status
    FROM users
    WHERE id = ? AND role = 'worker'
  `;

  db.query(workerSql, [workerId], (workerErr, workerResults) => {
    if (workerErr) {
      return res.status(500).json({
        message: "Failed to load worker profile",
        error: workerErr.message,
      });
    }

    if (workerResults.length === 0) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const worker = workerResults[0];

    const assignedJobsSql = `
      SELECT
        bookings.id,
        bookings.booking_date,
        bookings.address,
        bookings.phone_number,
        bookings.notes,
        bookings.status,
        bookings.worker_job_status,
        bookings.worker_notes,
        bookings.rating,
        bookings.review_text,
        bookings.completed_at,
        services.service_name,
        services.category,
        services.price,
        services.image_url,
        users.full_name AS customer_name,
        users.email AS customer_email
      FROM ${BOOKING_TABLE} AS bookings
      JOIN services ON bookings.service_id = services.id
      JOIN users ON bookings.user_id = users.id
      WHERE bookings.worker_id = ?
      ORDER BY bookings.id DESC
    `;

    const openJobsSql = `
      SELECT
        bookings.id,
        bookings.booking_date,
        bookings.address,
        bookings.phone_number,
        bookings.notes,
        bookings.status,
        bookings.worker_job_status,
        services.service_name,
        services.category,
        services.price,
        services.image_url,
        users.full_name AS customer_name,
        users.email AS customer_email
      FROM ${BOOKING_TABLE} AS bookings
      JOIN services ON bookings.service_id = services.id
      JOIN users ON bookings.user_id = users.id
      WHERE bookings.worker_id IS NULL
        AND bookings.status IN ('Pending', 'Confirmed')
      ORDER BY bookings.id DESC
    `;

    db.query(assignedJobsSql, [workerId], (jobsErr, assignedJobs) => {
      if (jobsErr) {
        return res.status(500).json({
          message: "Failed to load worker jobs",
          error: jobsErr.message,
        });
      }

      db.query(openJobsSql, (openErr, openJobs) => {
        if (openErr) {
          return res.status(500).json({
            message: "Failed to load open jobs",
            error: openErr.message,
          });
        }

        const activeJobs = assignedJobs.filter((job) =>
          ["Accepted", "In Progress", "New"].includes(job.worker_job_status)
        );

        const history = assignedJobs.filter((job) =>
          ["Completed", "Cancelled"].includes(job.worker_job_status)
        );

        const completedJobs = history.filter((job) => job.worker_job_status === "Completed");
        const totalEarnings = completedJobs.reduce(
          (sum, job) => sum + Number(job.price || 0),
          0
        );

        const ratedJobs = completedJobs.filter((job) => Number.isInteger(job.rating));
        const averageRating =
          ratedJobs.length > 0
            ? (
                ratedJobs.reduce((sum, job) => sum + Number(job.rating), 0) / ratedJobs.length
              ).toFixed(1)
            : "0.0";

        const notifications = [];

        if (worker.approval_status === "pending") {
          notifications.push({
            type: "status",
            title: "Pending Review",
            message: "Your worker application is waiting for admin review.",
          });
        }

        if (worker.approval_status === "approved") {
          notifications.push({
            type: "status",
            title: "Approved",
            message: "Your worker account is approved. You can now go available and accept jobs.",
          });
        }

        if (worker.approval_status === "rejected") {
          notifications.push({
            type: "status",
            title: "Rejected",
            message: worker.approval_notes || "Your worker application was rejected.",
          });
        }

        if (worker.approval_status === "needs_resubmission") {
          notifications.push({
            type: "status",
            title: "Needs Resubmission",
            message:
              worker.approval_notes ||
              "Your application needs updates before it can be approved.",
          });
        }

        if (openJobs.length > 0) {
          notifications.push({
            type: "job",
            title: "Open Customer Bookings",
            message: "There are customer bookings available for workers to accept.",
          });
        }

        return res.status(200).json({
          worker: {
            ...worker,
            worker_documents: parseDocuments(worker.worker_documents),
          },
          summary: {
            openJobs: openJobs.length,
            activeJobs: activeJobs.length,
            completedJobs: completedJobs.length,
            totalEarnings,
            averageRating,
            reviewCount: ratedJobs.length,
          },
          openJobs,
          activeJobs,
          history,
          notifications,
          reviews: ratedJobs.map((job) => ({
            booking_id: job.id,
            service_name: job.service_name,
            rating: job.rating,
            review_text: job.review_text,
          })),
        });
      });
    });
  });
};

const updateAvailability = (req, res) => {
  const workerId = req.user.id;
  const { availability_status } = req.body;

  if (!["available", "unavailable"].includes(availability_status)) {
    return res.status(400).json({ message: "Invalid availability status" });
  }

  db.query(
    "SELECT approval_status FROM users WHERE id = ? AND role = 'worker'",
    [workerId],
    (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          message: "Failed to verify worker",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Worker not found" });
      }

      if (results[0].approval_status !== "approved") {
        return res.status(403).json({
          message: "You cannot go available until your worker application is approved",
        });
      }

      db.query(
        "UPDATE users SET availability_status = ? WHERE id = ?",
        [availability_status, workerId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              message: "Failed to update availability",
              error: updateErr.message,
            });
          }

          return res.status(200).json({
            message: `Availability updated to ${availability_status}`,
          });
        }
      );
    }
  );
};

const updateWorkerProfile = (req, res) => {
  const workerId = req.user.id;
  const {
    full_name,
    service_category,
    credentials_summary,
    valid_id_image,
    worker_documents,
  } = req.body;

  db.query(
    "SELECT approval_status, valid_id_image, worker_documents, full_name, service_category, credentials_summary FROM users WHERE id = ? AND role = 'worker'",
    [workerId],
    (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          message: "Failed to load worker profile",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Worker not found" });
      }

      const current = results[0];
      const nextApprovalStatus =
        current.approval_status === "needs_resubmission" ? "pending" : current.approval_status;

      const sql = `
        UPDATE users
        SET
          full_name = ?,
          service_category = ?,
          credentials_summary = ?,
          valid_id_image = ?,
          worker_documents = ?,
          approval_status = ?,
          approval_notes = CASE
            WHEN ? = 'pending' THEN 'Worker profile updated and resubmitted for review.'
            ELSE approval_notes
          END
        WHERE id = ?
      `;

      db.query(
        sql,
        [
          full_name || current.full_name,
          service_category || current.service_category,
          credentials_summary || current.credentials_summary,
          valid_id_image || current.valid_id_image,
          worker_documents || current.worker_documents,
          nextApprovalStatus,
          nextApprovalStatus,
          workerId,
        ],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              message: "Failed to update worker profile",
              error: updateErr.message,
            });
          }

          return res.status(200).json({
            message:
              nextApprovalStatus === "pending"
                ? "Profile updated and resubmitted for review."
                : "Worker profile updated successfully.",
          });
        }
      );
    }
  );
};

const acceptOpenJob = (req, res) => {
  const workerId = req.user.id;
  const bookingId = req.params.id;

  db.query(
    "SELECT approval_status, availability_status FROM users WHERE id = ? AND role = 'worker'",
    [workerId],
    (workerErr, workerResults) => {
      if (workerErr) {
        return res.status(500).json({
          message: "Failed to verify worker",
          error: workerErr.message,
        });
      }

      if (workerResults.length === 0) {
        return res.status(404).json({ message: "Worker not found" });
      }

      const worker = workerResults[0];

      if (worker.approval_status !== "approved") {
        return res.status(403).json({
          message: "Your worker account is not yet approved for job handling",
        });
      }

      if (worker.availability_status !== "available") {
        return res.status(403).json({
          message: "Go available first before accepting customer bookings",
        });
      }

      const sql = `
        UPDATE ${BOOKING_TABLE}
        SET
          worker_id = ?,
          worker_job_status = 'Accepted',
          status = 'Confirmed'
        WHERE id = ?
          AND worker_id IS NULL
          AND status IN ('Pending', 'Confirmed')
      `;

      db.query(sql, [workerId, bookingId], (updateErr, result) => {
        if (updateErr) {
          return res.status(500).json({
            message: "Failed to accept booking",
            error: updateErr.message,
          });
        }

        if (result.affectedRows === 0) {
          return res.status(400).json({
            message: "This booking is no longer available",
          });
        }

        return res.status(200).json({
          message: "Booking accepted successfully",
        });
      });
    }
  );
};

const updateWorkerJobStatus = (req, res) => {
  const workerId = req.user.id;
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!["Accepted", "In Progress", "Completed", "Cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid worker job status" });
  }

  db.query(
    "SELECT approval_status FROM users WHERE id = ? AND role = 'worker'",
    [workerId],
    (workerErr, workerResults) => {
      if (workerErr) {
        return res.status(500).json({
          message: "Failed to verify worker",
          error: workerErr.message,
        });
      }

      if (workerResults.length === 0) {
        return res.status(404).json({ message: "Worker not found" });
      }

      if (workerResults[0].approval_status !== "approved") {
        return res.status(403).json({
          message: "Your worker account is not yet approved for job handling",
        });
      }

      db.query(
        `SELECT id FROM ${BOOKING_TABLE} WHERE id = ? AND worker_id = ?`,
        [bookingId, workerId],
        (findErr, bookingResults) => {
          if (findErr) {
            return res.status(500).json({
              message: "Failed to load booking",
              error: findErr.message,
            });
          }

          if (bookingResults.length === 0) {
            return res.status(404).json({ message: "Assigned booking not found" });
          }

          let bookingStatus = "Pending";

          if (status === "Accepted") bookingStatus = "Confirmed";
          if (status === "In Progress") bookingStatus = "In Progress";
          if (status === "Completed") bookingStatus = "Completed";
          if (status === "Cancelled") bookingStatus = "Cancelled";

          const sql = `
            UPDATE ${BOOKING_TABLE}
            SET
              worker_job_status = ?,
              status = ?,
              completed_at = CASE
                WHEN ? = 'Completed' THEN NOW()
                ELSE completed_at
              END
            WHERE id = ? AND worker_id = ?
          `;

          db.query(sql, [status, bookingStatus, status, bookingId, workerId], (updateErr) => {
            if (updateErr) {
              return res.status(500).json({
                message: "Failed to update job status",
                error: updateErr.message,
              });
            }

            return res.status(200).json({
              message: `Job status updated to ${status}`,
            });
          });
        }
      );
    }
  );
};

module.exports = {
  getWorkerDashboard,
  updateAvailability,
  updateWorkerProfile,
  acceptOpenJob,
  updateWorkerJobStatus,
};