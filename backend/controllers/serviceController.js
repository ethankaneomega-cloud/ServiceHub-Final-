const db = require("../config/db");

const getAllServices = (req, res) => {
  db.query(
    `
      SELECT
        id,
        service_name,
        description,
        price,
        category,
        image_url,
        is_active,
        created_at
      FROM services
      WHERE is_active = 1
      ORDER BY category ASC, service_name ASC
    `,
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to fetch services",
          error: err.message,
        });
      }

      return res.status(200).json(results);
    }
  );
};

const getServiceById = (req, res) => {
  const serviceId = req.params.id;

  db.query(
    `
      SELECT
        id,
        service_name,
        description,
        price,
        category,
        image_url,
        is_active,
        created_at
      FROM services
      WHERE id = ? AND is_active = 1
      LIMIT 1
    `,
    [serviceId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to fetch service",
          error: err.message,
        });
      }

      if (!results.length) {
        return res.status(404).json({
          message: "Service not found",
        });
      }

      return res.status(200).json(results[0]);
    }
  );
};

module.exports = {
  getAllServices,
  getServiceById,
};